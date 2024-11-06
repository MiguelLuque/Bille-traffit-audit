import React, { useState } from 'react';
import { FileCode, Upload, AlertCircle, InfoIcon } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { decodeBase64ToFile, ungzipFile, unzipFile, extractMessageFromXml, ProcessingResult } from './utils/fileProcessing';

function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultType, setResultType] = useState<'xml' | 'final'>('final');

  const processInput = async () => {
    try {
      setIsProcessing(true);
      setError('');
      setWarning('');

      // First decode and ungzip
      const decodedFile = await decodeBase64ToFile(input);
      const ungzippedContent = await ungzipFile(decodedFile);

      // Extract message from XML
      const xmlResult = extractMessageFromXml(ungzippedContent);
      
      if (xmlResult.type === 'xml') {
        setResult(xmlResult.content);
        setResultType('xml');
        if (xmlResult.warning) {
          setWarning(xmlResult.warning);
        }
        return;
      }

      // Process message content (base64 decode and unzip)
      const messageDecoded = await decodeBase64ToFile(xmlResult.content);
      const finalContent = await unzipFile(messageDecoded);

      // Try to parse and format as JSON
      try {
        const jsonContent = JSON.parse(finalContent);
        setResult(JSON.stringify(jsonContent, null, 2));
      } catch {
        // If not valid JSON, show as is
        setResult(finalContent);
      }
      setResultType('final');
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
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Base64 Decoder & File Processor</h1>
          <p className="mt-2 text-gray-600">Process base64 encoded files with gzip and zip compression</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your base64 string here..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            
            <button
              onClick={processInput}
              disabled={!input || isProcessing}
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
                <span className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Process File
                </span>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {warning && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
            <div className="flex items-center">
              <InfoIcon className="w-5 h-5 text-yellow-400 mr-2" />
              <p className="text-yellow-700">{warning}</p>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 text-white text-sm font-medium">
              Result {resultType === 'xml' && '(XML Content)'}
            </div>
            <SyntaxHighlighter
              language={resultType === 'xml' ? 'xml' : 'json'}
              style={vs2015}
              customStyle={{
                margin: 0,
                padding: '1rem',
                fontSize: '0.875rem',
                lineHeight: '1.5',
              }}
            >
              {result}
            </SyntaxHighlighter>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;