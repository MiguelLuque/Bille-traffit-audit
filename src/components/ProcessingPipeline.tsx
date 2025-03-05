import React from 'react';
import { ArrowRight, GitBranch } from 'lucide-react';
import type { ProcessingStep } from '../utils/fileProcessing';

interface ProcessingPipelineProps {
  steps: ProcessingStep[];
}

export function ProcessingPipeline({ steps }: ProcessingPipelineProps) {
  if (steps.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-center mb-4">
        <GitBranch className="w-5 h-5 text-indigo-500 mr-2" />
        <h3 className="text-base font-medium text-gray-800">Processing Pipeline</h3>
        <span className="ml-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {steps.length} {steps.length === 1 ? 'step' : 'steps'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex items-center min-w-full">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`
                  px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-sm
                  ${step.type.includes('encode') || step.type.includes('encrypt') ? 'bg-blue-50 text-blue-700 border border-blue-200' : ''}
                  ${step.type.includes('decode') || step.type.includes('decrypt') ? 'bg-green-50 text-green-700 border border-green-200' : ''}
                  ${step.type.includes('compress') ? 'bg-purple-50 text-purple-700 border border-purple-200' : ''}
                  ${step.type.includes('decompress') ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : ''}
                  ${step.type.includes('extract') ? 'bg-amber-50 text-amber-700 border border-amber-200' : ''}
                  ${!step.type.includes('encode') && !step.type.includes('decode') &&
                    !step.type.includes('encrypt') && !step.type.includes('decrypt') &&
                    !step.type.includes('compress') && !step.type.includes('decompress') &&
                    !step.type.includes('extract') ? 'bg-gray-50 text-gray-700 border border-gray-200' : ''}
                `}>
                  {step.type}
                  {step.type === 'extract-xml' && step.xmlTag && ` (${step.xmlTag})`}
                  {step.type === 'extract-json' && step.jsonPath && ` (${step.jsonPath})`}
                  {step.type === 'encrypt-aes' && ` (${step.cipherMode}${step.padding ? `, ${step.padding}` : ''}${step.keySize ? `, ${step.keySize} bits` : ''})`}
                  {step.type === 'decrypt-aes' && ` (${step.cipherMode}${step.padding ? `, ${step.padding}` : ''}${step.keySize ? `, ${step.keySize} bits` : ''})`}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Step {index + 1}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="mx-2 flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}