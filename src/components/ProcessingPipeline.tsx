import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { ProcessingStep } from '../utils/fileProcessing';

interface ProcessingPipelineProps {
  steps: ProcessingStep[];
}

export function ProcessingPipeline({ steps }: ProcessingPipelineProps) {
  if (steps.length === 0) return null;

  return (
    <div className="flex items-center justify-center overflow-x-auto py-4 px-2">
      <div className="flex items-center space-x-3">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
                {step.type}
                {step.type === 'extract-xml' && step.xmlTag && ` (${step.xmlTag})`}
                {step.type === 'extract-json' && step.jsonPath && ` (${step.jsonPath})`}
              </div>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}