import JSZip from 'jszip';
import { inflate } from 'pako';

export interface ProcessingResult {
  content: string;
  type: 'xml' | 'final';
  warning?: string;
}

export function isValidBase64(str: string): boolean {
  try {
    return btoa(atob(str)) === str;
  } catch {
    return false;
  }
}

export async function decodeBase64ToFile(base64String: string): Promise<Uint8Array> {
  if (!isValidBase64(base64String)) {
    throw new Error('Invalid base64 string provided');
  }

  try {
    const binaryString = atob(base64String);
    return Uint8Array.from(binaryString, (m) => m.charCodeAt(0));
  } catch (error) {
    throw new Error('Failed to decode base64 string');
  }
}

export async function ungzipFile(data: Uint8Array): Promise<string> {
  try {
    const inflated = inflate(data);
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(inflated);
  } catch (error) {
    throw new Error('Failed to decompress gzip file. The file might be corrupted or not a valid gzip file.');
  }
}

export async function unzipFile(data: Uint8Array): Promise<string> {
  try {
    const zip = new JSZip();
    const result = await zip.loadAsync(data, { checkCRC32: true });
    const files = Object.values(result.files);
    
    if (files.length === 0) {
      throw new Error('No files found in zip');
    }
    
    return await files[0].async('string');
  } catch (error) {
    if (error instanceof Error && error.message.includes('Central Directory')) {
      throw new Error('Invalid ZIP file format. The file might be corrupted or not a ZIP file.');
    }
    throw error;
  }
}

export function extractMessageFromXml(xmlString: string): ProcessingResult {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for XML parsing errors
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error('Invalid XML format');
    }
    
    const messageElement = xmlDoc.getElementsByTagName('message')[0];
    if (!messageElement) {
      // Format the XML string for better readability
      const serializer = new XMLSerializer();
      const formattedXml = serializer.serializeToString(xmlDoc)
        .replace(/(>)(<)(\/*)/g, '$1\n$2$3')
        .replace(/<(.*?)>/g, '\n$&')
        .replace(/^\s*\n/gm, '')
        .trim();
      
      return {
        content: formattedXml,
        type: 'xml',
        warning: 'No message tag found in XML. Displaying the XML content instead.'
      };
    }
    
    const content = messageElement.textContent;
    if (!content) {
      throw new Error('Empty message content');
    }
    
    return {
      content,
      type: 'final'
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to process XML content');
  }
}