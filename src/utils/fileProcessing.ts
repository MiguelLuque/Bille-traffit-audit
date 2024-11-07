import JSZip from 'jszip';
import { inflate, deflate } from 'pako';

export type StepType = 
  | 'decode-base64' 
  | 'encode-base64' 
  | 'decompress-gzip' 
  | 'compress-gzip'
  | 'decompress-zip'
  | 'compress-zip'
  | 'extract-xml'
  | 'extract-json';

export interface ProcessingStep {
  id: string;
  type: StepType;
  xmlTag?: string;
  jsonPath?: string;
}

export function isValidBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

export async function processStep(content: string, step: ProcessingStep): Promise<string> {
  switch (step.type) {
    case 'decode-base64':
      return await decodeBase64(content);
    case 'encode-base64':
      return btoa(content);
    case 'decompress-gzip':
      return await ungzipContent(content);
    case 'compress-gzip':
      return await gzipContent(content);
    case 'decompress-zip':
      return await unzipContent(content);
    case 'compress-zip':
      return await zipContent(content);
    case 'extract-xml':
      return extractFromXml(content, step.xmlTag || 'message');
    case 'extract-json':
      return extractFromJson(content, step.jsonPath || '');
    default:
      throw new Error('Invalid step type');
  }
}

function extractFromJson(jsonString: string, path: string): string {
  try {
    const data = JSON.parse(jsonString);
    
    if (!path) {
      throw new Error('JSON path is required');
    }

    const value = path.split('.').reduce((obj, key) => {
      if (obj === undefined || obj === null) {
        throw new Error(`Property '${key}' not found in path '${path}'`);
      }
      return obj[key];
    }, data);

    if (value === undefined || value === null) {
      throw new Error(`Value at path '${path}' is null or undefined`);
    }

    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format');
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to process JSON content');
  }
}

async function decodeBase64(base64String: string): Promise<string> {
  if (!isValidBase64(base64String)) {
    throw new Error('Invalid base64 string provided');
  }
  return atob(base64String);
}

async function ungzipContent(content: string): Promise<string> {
  try {
    // Convert base64 to binary data
    const binaryData = Uint8Array.from(atob(content), c => c.charCodeAt(0));
    
    // Decompress the binary data
    const inflated = inflate(binaryData);
    
    // Convert the decompressed data to string
    return new TextDecoder().decode(inflated);
  } catch (error) {
    throw new Error('Failed to decompress gzip content. Make sure the input is base64 encoded gzip data.');
  }
}

async function gzipContent(content: string): Promise<string> {
  try {
    // Convert string to binary data
    const binaryData = new TextEncoder().encode(content);
    
    // Compress the binary data
    const deflated = deflate(binaryData);
    
    // Convert compressed data to base64
    return btoa(String.fromCharCode.apply(null, deflated));
  } catch (error) {
    throw new Error('Failed to compress content with gzip');
  }
}

async function unzipContent(content: string): Promise<string> {
  try {
    const zip = new JSZip();
    const binaryData = Uint8Array.from(atob(content), c => c.charCodeAt(0));
    const result = await zip.loadAsync(binaryData);
    const files = Object.values(result.files);
    
    if (files.length === 0) {
      throw new Error('No files found in zip');
    }
    
    return await files[0].async('string');
  } catch (error) {
    throw new Error('Failed to decompress zip content. Make sure the input is base64 encoded zip data.');
  }
}

async function zipContent(content: string): Promise<string> {
  try {
    const zip = new JSZip();
    zip.file('content.txt', content);
    const zipped = await zip.generateAsync({type: 'uint8array'});
    return btoa(String.fromCharCode.apply(null, zipped));
  } catch (error) {
    throw new Error('Failed to compress content with zip');
  }
}

function extractFromXml(xmlString: string, tag: string): string {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error('Invalid XML format');
    }
    
    const element = xmlDoc.getElementsByTagName(tag)[0];
    if (!element) {
      throw new Error(`Tag <${tag}> not found in XML`);
    }
    
    const content = element.textContent;
    if (!content) {
      throw new Error(`Empty content in tag <${tag}>`);
    }
    
    return content;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to process XML content');
  }
}