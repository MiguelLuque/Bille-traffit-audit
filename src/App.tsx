import React, { useState } from 'react';
import { FileCode } from 'lucide-react';
import { processStep, type ProcessingStep } from './utils/fileProcessing';
import { StepBuilder } from './components/StepBuilder';
import { ProcessingPipeline } from './components/ProcessingPipeline';
import { ResultDisplay } from './components/ResultDisplay';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<ProcessingStep[]>([]);
  const [intermediateResults, setIntermediateResults] = useState<Array<{ step: ProcessingStep; result: string }>>([]);

  const processInput = async () => {
    if (steps.length === 0) {
      setError('Please add at least one processing step');
      return;
    }

    try {
      setIsProcessing(true);
      setError('');
      setIntermediateResults([]);

      let currentContent = input;
      const results: Array<{ step: ProcessingStep; result: string }> = [];

      for (const step of steps) {
        currentContent = await processStep(currentContent, step);
        results.push({ step, result: currentContent });
      }

      setIntermediateResults(results);
      setResult(currentContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setResult('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <FileCode className="w-16 h-16 mx-auto text-indigo-600" />
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Dynamic File Processor</h1>
          <p className="mt-2 text-gray-600">Process files with custom steps: encode, decode, compress, and extract</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="input" className="block text-sm font-medium text-gray-700">Input</label>
              <textarea
                id="input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your input text here..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-32"
              />
            </div>

            <StepBuilder steps={steps} onChange={setSteps} />
            
            {steps.length > 0 && (
              <ProcessingPipeline steps={steps} />
            )}
            
            <button
              onClick={processInput}
              disabled={!input || steps.length === 0 || isProcessing}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Process Input'
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {intermediateResults.length > 0 && (
          <div className="space-y-4">
            {intermediateResults.map(({ step, result }, index) => (
              <ResultDisplay
                key={step.id}
                step={step}
                result={result}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;