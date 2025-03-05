import React, { useState } from 'react';
import { Copy, Check, Code, Braces, Lock, Unlock, Archive, Database, Link, Layers } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import type { ProcessingStep } from '../utils/fileProcessing';

SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('xml', xml);

interface ResultDisplayProps {
  step: ProcessingStep;
  result: string;
  index: number;
}

export function ResultDisplay({ step, result, index }: ResultDisplayProps) {
  const [isPretty, setIsPretty] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const prettifyContent = (content: string): string => {
    try {
      if (content.trim().startsWith('<') && content.trim().endsWith('>')) {
        // Intentar formatear como XML
        const formatted = content
          .replace(/></g, '>\n<')
          .replace(/>\s*</g, '>\n<')
          .replace(/(<[^>]+>)(?![\s\n])/g, '$1\n');
        return formatted;
      } else if (
        (content.trim().startsWith('{') && content.trim().endsWith('}')) ||
        (content.trim().startsWith('[') && content.trim().endsWith(']'))
      ) {
        // Intentar formatear como JSON
        return JSON.stringify(JSON.parse(content), null, 2);
      }
    } catch (e) {
      // Si hay un error al formatear, devolver el contenido original
    }
    return content;
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar al portapapeles:', err);
    }
  };

  const getStepTypeInfo = () => {
    if (step.type.includes('encode-base64') || step.type.includes('decode-base64')) {
      return {
        icon: <Code className="w-4 h-4" />,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
      };
    }
    if (step.type.includes('compress') || step.type.includes('decompress')) {
      return {
        icon: <Archive className="w-4 h-4" />,
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200'
      };
    }
    if (step.type.includes('extract')) {
      return {
        icon: <Database className="w-4 h-4" />,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200'
      };
    }
    if (step.type.includes('url')) {
      return {
        icon: <Link className="w-4 h-4" />,
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      };
    }
    if (step.type.includes('encrypt') || step.type.includes('decrypt')) {
      return {
        icon: step.type.includes('encrypt') ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />,
        bgColor: step.type.includes('encrypt') ? 'bg-red-50' : 'bg-teal-50',
        textColor: step.type.includes('encrypt') ? 'text-red-700' : 'text-teal-700',
        borderColor: step.type.includes('encrypt') ? 'border-red-200' : 'border-teal-200'
      };
    }
    return {
      icon: <Layers className="w-4 h-4" />,
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200'
    };
  };

  const { icon, bgColor, textColor, borderColor } = getStepTypeInfo();

  // Determinar el lenguaje para el resaltador de sintaxis
  let language = 'text';
  if (
    (result.trim().startsWith('{') && result.trim().endsWith('}')) ||
    (result.trim().startsWith('[') && result.trim().endsWith(']'))
  ) {
    language = 'json';
  } else if (result.trim().startsWith('<') && result.trim().endsWith('>')) {
    language = 'xml';
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bgColor} ${textColor} mr-3`}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-800">
              Paso {index + 1}: {step.type}
              {step.type === 'extract-xml' && step.xmlTag && ` (${step.xmlTag})`}
              {step.type === 'extract-json' && step.jsonPath && ` (${step.jsonPath})`}
              {step.type === 'encrypt-aes' && ` (${step.cipherMode}${step.padding ? `, ${step.padding}` : ''}${step.keySize ? `, ${step.keySize} bits` : ''})`}
              {step.type === 'decrypt-aes' && ` (${step.cipherMode}${step.padding ? `, ${step.padding}` : ''}${step.keySize ? `, ${step.keySize} bits` : ''})`}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {result.length} caracteres
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPretty(!isPretty)}
            className={`p-1.5 rounded-md ${isPretty ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} transition-colors`}
            title={isPretty ? "Mostrar formato plano" : "Mostrar formato bonito"}
          >
            <Braces className="w-4 h-4" />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Copiar al portapapeles"
          >
            {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <div className="result-content-wrapper">
        <SyntaxHighlighter
          language={language}
          style={vs2015}
          customStyle={{
            margin: 0,
            padding: '1rem',
            fontSize: '0.9375rem',
            lineHeight: '1.6',
            borderRadius: '0 0 0.5rem 0.5rem',
            maxHeight: 'none',
            overflowY: 'visible',
            overflowX: 'auto'
          }}
          wrapLines={true}
          wrapLongLines={false}
          className="result-syntax-highlighter"
        >
          {isPretty ? prettifyContent(result) : result}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}