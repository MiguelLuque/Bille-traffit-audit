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
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          Add Step
        </button>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex-grow grid grid-cols-2 gap-4">
              <select
                value={step.type}
                onChange={(e) => updateStep(step.id, { type: e.target.value as StepType })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3.5 h-10 appearance-none bg-white cursor-pointer"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
              >
                <option value="decode-base64">Decode Base64</option>
                <option value="encode-base64">Encode Base64</option>
                <option value="decompress-gzip">Decompress GZip</option>
                <option value="compress-gzip">Compress GZip</option>
                <option value="decompress-zip">Decompress Zip</option>
                <option value="compress-zip">Compress Zip</option>
                <option value="extract-xml">Extract from XML</option>
                <option value="extract-json">Extract from JSON</option>
                <option value="encode-url">Encode URL</option>
                <option value="decode-url">Decode URL</option>
                <option value="encrypt-aes">Encrypt AES</option>
                <option value="decrypt-aes">Decrypt AES</option>
              </select>

              {step.type === 'extract-xml' && (
                <input
                  type="text"
                  value={step.xmlTag || 'message'}
                  onChange={(e) => updateStep(step.id, { xmlTag: e.target.value })}
                  placeholder="XML Tag (e.g., message)"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3.5 h-10"
                />
              )}

              {step.type === 'extract-json' && (
                <input
                  type="text"
                  value={step.jsonPath || ''}
                  onChange={(e) => updateStep(step.id, { jsonPath: e.target.value })}
                  placeholder="JSON path (e.g., data.user.name)"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3.5 h-10"
                />
              )}

              {(step.type === 'encrypt-aes' || step.type === 'decrypt-aes') && (
                <div className="col-span-2 grid grid-cols-1 gap-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Cipher Mode</label>
                      <select
                        value={step.cipherMode || 'CBC'}
                        onChange={(e) => updateStep(step.id, { cipherMode: e.target.value as any })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3.5 h-10 appearance-none bg-white cursor-pointer"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                      >
                        <option value="CBC">CBC</option>
                        <option value="ECB">ECB</option>
                        <option value="CFB">CFB</option>
                        <option value="OFB">OFB</option>
                        <option value="CTR">CTR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Padding</label>
                      <select
                        value={step.padding || 'PKCS5Padding'}
                        onChange={(e) => updateStep(step.id, { padding: e.target.value as any })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3.5 h-10 appearance-none bg-white cursor-pointer"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                      >
                        <option value="PKCS5Padding">PKCS5Padding</option>
                        <option value="NoPadding">NoPadding</option>
                        <option value="ZeroPadding">ZeroPadding</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Initialization Vector (IV) {step.cipherMode !== 'ECB' ? '(Required)' : '(Not used in ECB mode)'}
                    </label>
                    <input
                      type="text"
                      value={step.iv || ''}
                      onChange={(e) => updateStep(step.id, { iv: e.target.value })}
                      placeholder="Enter initialization vector"
                      disabled={step.cipherMode === 'ECB'}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3.5 h-10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Key Size</label>
                      <select
                        value={step.keySize || '128'}
                        onChange={(e) => updateStep(step.id, { keySize: e.target.value as any })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3.5 h-10 appearance-none bg-white cursor-pointer"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                      >
                        <option value="128">128 bits</option>
                        <option value="192">192 bits</option>
                        <option value="256">256 bits</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Output Format</label>
                      <select
                        value={step.outputFormat || 'Base64'}
                        onChange={(e) => updateStep(step.id, { outputFormat: e.target.value as any })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3.5 h-10 appearance-none bg-white cursor-pointer"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                      >
                        <option value="Base64">Base64</option>
                        <option value="Hex">Hex</option>
                        {step.type === 'decrypt-aes' && <option value="Plain-Text">Plain Text</option>}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Secret Key (Required)</label>
                    <input
                      type="text"
                      value={step.secretKey || ''}
                      onChange={(e) => updateStep(step.id, { secretKey: e.target.value })}
                      placeholder="Enter secret key"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 px-3.5 h-10"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => moveStep(index, 'up')}
                disabled={index === 0}
                className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors rounded-md hover:bg-gray-100"
                title="Move step up"
              >
                <MoveUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => moveStep(index, 'down')}
                disabled={index === steps.length - 1}
                className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors rounded-md hover:bg-gray-100"
                title="Move step down"
              >
                <MoveDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => removeStep(step.id)}
                className="p-1.5 text-red-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                title="Remove step"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {steps.length === 0 && (
          <div className="text-center py-6 px-4 text-gray-500 bg-white rounded-lg border border-gray-200 shadow-sm">
            No steps defined. Add a step to begin processing.
          </div>
        )}
      </div>
    </div>
  );
}