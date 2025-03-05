import React from 'react';
import { Plus, Trash2, MoveUp, MoveDown, Lock, Unlock, Archive, Code, Database, Link, Layers } from 'lucide-react';
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

  const getStepIcon = (type: StepType) => {
    if (type.includes('encode-base64') || type.includes('decode-base64')) return <Code className="w-4 h-4" />;
    if (type.includes('compress') || type.includes('decompress')) return <Archive className="w-4 h-4" />;
    if (type.includes('extract')) return <Database className="w-4 h-4" />;
    if (type.includes('url')) return <Link className="w-4 h-4" />;
    if (type.includes('encrypt') || type.includes('decrypt')) return type.includes('encrypt') ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />;
    return <Layers className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Pasos de Procesamiento</h2>
        <button
          onClick={addStep}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Plus className="w-5 h-5 mr-1.5" />
          Añadir Paso
        </button>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
            {/* Encabezado del paso */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-200">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                {index + 1}
              </div>

              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  {getStepIcon(step.type)}
                </div>
                <select
                  value={step.type}
                  onChange={(e) => updateStep(step.id, { type: e.target.value as StepType })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2 pl-9 pr-8 h-9 appearance-none bg-white cursor-pointer"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                >
                  <option value="decode-base64">Decodificar Base64</option>
                  <option value="encode-base64">Codificar Base64</option>
                  <option value="decompress-gzip">Descomprimir GZip</option>
                  <option value="compress-gzip">Comprimir GZip</option>
                  <option value="decompress-zip">Descomprimir Zip</option>
                  <option value="compress-zip">Comprimir Zip</option>
                  <option value="extract-xml">Extraer de XML</option>
                  <option value="extract-json">Extraer de JSON</option>
                  <option value="encode-url">Codificar URL</option>
                  <option value="decode-url">Decodificar URL</option>
                  <option value="encrypt-aes">Encriptar AES</option>
                  <option value="decrypt-aes">Desencriptar AES</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveStep(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors rounded-md hover:bg-gray-100"
                  title="Mover paso arriba"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveStep(index, 'down')}
                  disabled={index === steps.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors rounded-md hover:bg-gray-100"
                  title="Mover paso abajo"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeStep(step.id)}
                  className="p-1 text-red-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                  title="Eliminar paso"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenido del paso */}
            <div className="p-4">
              {step.type === 'extract-xml' && (
                <div className="mb-0">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Etiqueta XML</label>
                  <input
                    type="text"
                    value={step.xmlTag || 'message'}
                    onChange={(e) => updateStep(step.id, { xmlTag: e.target.value })}
                    placeholder="Etiqueta XML (ej., message)"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 h-9"
                  />
                </div>
              )}

              {step.type === 'extract-json' && (
                <div className="mb-0">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ruta JSON</label>
                  <input
                    type="text"
                    value={step.jsonPath || ''}
                    onChange={(e) => updateStep(step.id, { jsonPath: e.target.value })}
                    placeholder="Ruta JSON (ej., data.user.name)"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 h-9"
                  />
                </div>
              )}

              {(step.type === 'encrypt-aes' || step.type === 'decrypt-aes') && (
                <div className="space-y-4">
                  <div className="aes-field-container">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Modo Cifrado</label>
                      <select
                        value={step.cipherMode || 'CBC'}
                        onChange={(e) => updateStep(step.id, { cipherMode: e.target.value as any })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 h-9 appearance-none bg-white cursor-pointer"
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
                      <label className="block text-xs font-medium text-gray-700 mb-1">Relleno</label>
                      <select
                        value={step.padding || 'PKCS5Padding'}
                        onChange={(e) => updateStep(step.id, { padding: e.target.value as any })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 h-9 appearance-none bg-white cursor-pointer"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                      >
                        <option value="PKCS5Padding">PKCS5Padding</option>
                        <option value="NoPadding">Sin Relleno</option>
                        <option value="ZeroPadding">Relleno Cero</option>
                      </select>
                    </div>
                  </div>

                  <div className="aes-field-full">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Vector de Inicialización (IV) {step.cipherMode !== 'ECB' ? '(Requerido)' : '(No usado en modo ECB)'}
                    </label>
                    <input
                      type="text"
                      value={step.iv || ''}
                      onChange={(e) => updateStep(step.id, { iv: e.target.value })}
                      placeholder="Ingrese vector de inicialización"
                      disabled={step.cipherMode === 'ECB'}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 h-9"
                    />
                  </div>

                  <div className="aes-field-container">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Tamaño de Clave</label>
                      <select
                        value={step.keySize || '128'}
                        onChange={(e) => updateStep(step.id, { keySize: e.target.value as any })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 h-9 appearance-none bg-white cursor-pointer"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                      >
                        <option value="128">128 bits</option>
                        <option value="192">192 bits</option>
                        <option value="256">256 bits</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Formato de {step.type === 'encrypt-aes' ? 'Salida' : 'Entrada'}</label>
                      <select
                        value={step.outputFormat || 'Base64'}
                        onChange={(e) => updateStep(step.id, { outputFormat: e.target.value as any })}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 h-9 appearance-none bg-white cursor-pointer"
                        style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                      >
                        <option value="Base64">Base64</option>
                        <option value="Hex">Hexadecimal</option>
                        {step.type === 'decrypt-aes' && <option value="Plain-Text">Texto Plano</option>}
                      </select>
                    </div>
                  </div>

                  <div className="aes-field-full">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Clave Secreta (Requerida)</label>
                    <input
                      type="text"
                      value={step.secretKey || ''}
                      onChange={(e) => updateStep(step.id, { secretKey: e.target.value })}
                      placeholder="Ingrese clave secreta"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-1.5 px-3 h-9"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {steps.length === 0 && (
          <div className="text-center py-8 px-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="mx-auto w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-indigo-600" />
            </div>
            <p className="text-gray-500 mb-4">No hay pasos definidos. Añade un paso para comenzar el procesamiento.</p>
            <button
              onClick={addStep}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <Plus className="w-5 h-5 mr-1.5" />
              Añadir primer paso
            </button>
          </div>
        )}
      </div>
    </div>
  );
}