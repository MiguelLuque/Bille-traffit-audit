import React from 'react';
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react';
import type { ProcessingStep, StepType } from '../utils/fileProcessing';

interface StepBuilderProps {
  steps: ProcessingStep[];
  onChange: (steps: ProcessingStep[]) => void;
}

export function StepBuilder({ steps, onChange }: StepBuilderProps) {
  const addStep = () => {
    const newStep: ProcessingStep = {
      id: crypto.randomUUID(),
      type: 'decode-base64'
    };
    onChange([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    onChange(steps.filter(step => step.id !== id));
  };

  const updateStep = (id: string, updates: Partial<ProcessingStep>) => {
    onChange(steps.map(step => 
      step.id === id ? { ...step, ...updates } : step
    ));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= steps.length) return;
    
    const newSteps = [...steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    onChange(newSteps);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Processing Steps</h2>
        <button
          onClick={addStep}
          className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Step
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex-grow grid grid-cols-2 gap-3">
              <select
                value={step.type}
                onChange={(e) => updateStep(step.id, { type: e.target.value as StepType })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="decode-base64">Decode Base64</option>
                <option value="encode-base64">Encode Base64</option>
                <option value="decompress-gzip">Decompress GZip</option>
                <option value="compress-gzip">Compress GZip</option>
                <option value="decompress-zip">Decompress Zip</option>
                <option value="compress-zip">Compress Zip</option>
                <option value="extract-xml">Extract from XML</option>
                <option value="extract-json">Extract from JSON</option>
              </select>

              {step.type === 'extract-xml' && (
                <input
                  type="text"
                  value={step.xmlTag || 'message'}
                  onChange={(e) => updateStep(step.id, { xmlTag: e.target.value })}
                  placeholder="XML Tag (e.g., message)"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              )}

              {step.type === 'extract-json' && (
                <input
                  type="text"
                  value={step.jsonPath || ''}
                  onChange={(e) => updateStep(step.id, { jsonPath: e.target.value })}
                  placeholder="JSON path (e.g., data.user.name)"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => moveStep(index, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <MoveUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => moveStep(index, 'down')}
                disabled={index === steps.length - 1}
                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <MoveDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeStep(step.id)}
                className="p-1 text-red-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {steps.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No steps defined. Add a step to begin processing.
          </div>
        )}
      </div>
    </div>
  );
}