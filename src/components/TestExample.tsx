import React from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';

interface TestExampleProps {
  onUseExample: (base64: string) => void;
}

export function TestExample({ onUseExample }: TestExampleProps) {
  // This is a minimal working example that contains:
  // 1. A gzipped XML file
  // 2. The XML file contains a message tag
  // 3. The message tag contains a base64 encoded ZIP file
  // 4. The final ZIP file contains a text file with sample content
  const sampleBase64 = 'H4sICONwmFYAA3Rlc3QueG1sADw/eG1sIHZlcnNpb249IjEuMCIgZW5jb2Rpbmc9IlVURi04Ij8+Cjxyb290PgogICAgPG1lc3NhZ2U+UEsDBBQACAAIAONwmFYAAAAAAAAAAAAAAAAJAAAAdGVzdC50eHRIZWxsbyEgVGhpcyBpcyBhIHNhbXBsZSBmaWxlIHRoYXQgd2FzIGNvbXByZXNzZWQgdXNpbmcgZ3ppcCBhbmQgemlwLlBLBwhQ7+lCRAAAAEQAAABQSwECFAAUAAgACADjcJhWUO/pQkQAAABEAAAACQAAAAAAAAAAAAAAAAAAAAAAdGVzdC50eHRQSwUGAAAAAAEAAQA3AAAAawAAAAAA</message>Cjwvcm9vdD4=';

  const [copied, setCopied] = React.useState(false);

  const copyExample = () => {
    navigator.clipboard.writeText(sampleBase64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-medium text-indigo-800 mb-2">Need a test file?</h3>
      <p className="text-sm text-indigo-600 mb-3">
        Use our sample file that contains a gzipped XML with a ZIP file inside
      </p>
      <div className="flex space-x-2">
        <button
          onClick={() => onUseExample(sampleBase64)}
          className="text-sm px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Try Example
        </button>
        <button
          onClick={copyExample}
          className="text-sm px-3 py-1 bg-white text-indigo-600 border border-indigo-200 rounded hover:bg-indigo-50 transition-colors flex items-center space-x-1"
        >
          {copied ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Base64</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}