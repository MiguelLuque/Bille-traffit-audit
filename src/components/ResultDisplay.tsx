import React, { useState } from 'react';
import { Braces, Copy, CheckCircle2 } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import type { ProcessingStep } from '../utils/fileProcessing';

interface ResultDisplayProps {
  step: ProcessingStep;
  result: string;
  index: number;
}

export function ResultDisplay({ step, result, index }: ResultDisplayProps) {
  const [isPretty, setIsPretty] = useState(false);
  const [copied, setCopied] = useState(false);

  const prettifyContent = (content: string): string => {
    try {
      // Try to parse and stringify as JSON
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      try {
        // Try to parse and format as XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(content, 'text/xml');
        if (!xmlDoc.getElementsByTagName('parsererror').length) {
          const serializer = new XMLSerializer();
          return serializer.serializeToString(xmlDoc)
            .replace(/(>)(<)(\/*)/g, '$1\n$2$3')
            .replace(/<(.*?)>/g, '\n$&')
            .replace(/^\s*\n/gm, '')
            .trim();
        }
      } catch {}
    }
    // Return original content if neither JSON nor XML
    return content;
  };

  const displayContent = isPretty ? prettifyContent(result) : result;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(displayContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-800 px-4 py-2 text-white flex items-center justify-between">
        <span className="text-sm font-medium">
          Step {index + 1} Result: {step.type}
          {step.type === 'extract-xml' && step.xmlTag && ` (Tag: ${step.xmlTag})`}
          {step.type === 'extract-json' && step.jsonPath && ` (Path: ${step.jsonPath})`}
        </span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPretty(!isPretty)}
            className="p-1 text-gray-300 hover:text-white transition-colors"
            title="Toggle pretty format"
          >
            <Braces className="w-4 h-4" />
          </button>
          <button
            onClick={copyToClipboard}
            className="p-1 text-gray-300 hover:text-white transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      <SyntaxHighlighter
        language={isPretty ? 'json' : 'plaintext'}
        style={vs2015}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5',
        }}
      >
        {displayContent}
      </SyntaxHighlighter>
    </div>
  );
}