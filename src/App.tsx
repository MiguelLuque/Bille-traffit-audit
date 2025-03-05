import React, { useState, useRef, useEffect } from 'react';
import { FileCode, FileText, Info, Menu, X, GripVertical, ArrowRightLeft } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(650); // Ancho inicial aumentado a 650px
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);
  const minSidebarWidth = 500; // Ancho mínimo aumentado para mejor visualización
  const maxSidebarWidth = 1000; // Ancho máximo aumentado
  const [showWidthIndicator, setShowWidthIndicator] = useState(false);
  const defaultSidebarWidth = 650; // Valor predeterminado para restablecer

  const processInput = async () => {
    if (steps.length === 0) {
      setError('Por favor, añade al menos un paso de procesamiento');
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

      // En dispositivos móviles, cerrar el sidebar automáticamente después de procesar
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error');
      setResult('');
    } finally {
      setIsProcessing(false);
    }
  };

  // Manejadores para el redimensionamiento del sidebar
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    setShowWidthIndicator(true);
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = sidebarWidth;
    document.body.classList.add('resizing');
  };

  const handleDrag = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartXRef.current;
    const newWidth = Math.max(minSidebarWidth, Math.min(maxSidebarWidth, dragStartWidthRef.current + deltaX));
    setSidebarWidth(newWidth);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    document.body.classList.remove('resizing');
    // Ocultar el indicador después de un breve retraso
    setTimeout(() => {
      setShowWidthIndicator(false);
    }, 1000);
  };

  // Configurar y limpiar los event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging]);

  const resetSidebarWidth = () => {
    setSidebarWidth(defaultSidebarWidth);
    setShowWidthIndicator(true);
    // Ocultar el indicador después de un breve retraso
    setTimeout(() => {
      setShowWidthIndicator(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <FileCode className="w-8 h-8 text-indigo-600 mr-3" />
            <h1 className="text-xl font-bold text-gray-900">Procesador Dinámico de Archivos</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
        {/* Left Sidebar - Input and Steps */}
        <div
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-full bg-white shadow-md overflow-y-auto border-r border-gray-200 flex-shrink-0 transition-transform duration-300 ease-in-out absolute md:relative z-10 h-full sidebar-container`}
          style={{ width: sidebarOpen ? (window.innerWidth < 768 ? '100%' : `${sidebarWidth}px`) : '0' }}
        >
          <div className="p-5 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="input" className="block text-sm font-medium text-gray-700">Entrada</label>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">{input.length} caracteres</span>
                  <button
                    onClick={resetSidebarWidth}
                    className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors rounded-md hover:bg-gray-100 hidden md:block"
                    title="Restablecer ancho"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute top-2 left-2 text-gray-400">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  id="input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ingrese su texto aquí..."
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm py-2.5 pl-8 pr-3.5 h-40 resize-none"
                />
              </div>
              {input.length > 0 && (
                <div className="mt-2 flex items-start">
                  <Info className="w-4 h-4 text-indigo-500 mr-1.5 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-500">
                    El texto introducido será procesado según los pasos definidos a continuación.
                  </p>
                </div>
              )}
            </div>

            <StepBuilder steps={steps} onChange={setSteps} />

            <button
              onClick={processInput}
              disabled={!input || steps.length === 0 || isProcessing}
              className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                'Procesar Entrada'
              )}
            </button>
          </div>
        </div>

        {/* Divisor arrastrable */}
        {sidebarOpen && (
          <div
            className={`hidden md:flex md:items-center md:justify-center resizer-handle ${isDragging ? 'active' : ''}`}
            onMouseDown={handleDragStart}
          >
            <GripVertical className="w-4 h-4 text-gray-400" />
            {showWidthIndicator && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow-md whitespace-nowrap">
                {Math.round(sidebarWidth)}px
              </div>
            )}
          </div>
        )}

        {/* Main Content Area - Results */}
        <div className="flex-1 overflow-hidden p-6 bg-gray-50 h-full">
          {/* Botón flotante para mostrar el sidebar en móviles cuando está oculto */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden fixed bottom-4 left-4 z-20 p-3 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <div className="max-w-5xl mx-auto space-y-6 pb-10 h-full flex flex-col">
            {/* Pipeline Visualization */}
            {steps.length > 0 && (
              <div className="flex-shrink-0">
                <ProcessingPipeline steps={steps} />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-4 flex-shrink-0">
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

            {/* Results Container */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden flex-grow flex flex-col">
              <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
                <h2 className="text-lg font-semibold text-indigo-900">Resultados</h2>
                {isProcessing && (
                  <div className="flex items-center text-sm text-indigo-600">
                    <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </div>
                )}
              </div>

              <div className="p-6 results-container custom-scrollbar flex-grow overflow-y-auto">
                {intermediateResults.length > 0 ? (
                  <div className="space-y-6 results-list">
                    {intermediateResults.map(({ step, result }, index) => (
                      <ResultDisplay
                        key={step.id}
                        step={step}
                        result={result}
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 px-4 h-full flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <FileCode className="w-12 h-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No hay resultados aún</h3>
                      <p className="text-gray-500 max-w-md">
                        Configura los pasos de procesamiento en el panel lateral y haz clic en "Procesar Entrada" para ver los resultados aquí.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;