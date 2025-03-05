import JSZip from 'jszip';
import { inflate, deflate } from 'pako';
import CryptoJS from 'crypto-js';

export type StepType = 
  | 'decode-base64' 
  | 'encode-base64' 
  | 'decompress-gzip' 
  | 'compress-gzip'
  | 'decompress-zip'
  | 'compress-zip'
  | 'extract-xml'
  | 'extract-json'
  | 'encode-url'
  | 'decode-url'
  | 'encrypt-aes'
  | 'decrypt-aes';

export interface ProcessingStep {
  id: string;
  type: StepType;
  xmlTag?: string;
  jsonPath?: string;
  cipherMode?: 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR';
  padding?: 'PKCS5Padding' | 'NoPadding' | 'ZeroPadding';
  iv?: string;
  keySize?: '128' | '192' | '256';
  secretKey?: string;
  outputFormat?: 'Base64' | 'Hex' | 'Plain-Text';
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
    case 'encode-url':
      return encodeUrl(content);
    case 'decode-url':
      return decodeUrl(content);
    case 'encrypt-aes':
      return await encryptAES(content, step);
    case 'decrypt-aes':
      return await decryptAES(content, step);
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
    return btoa(Array.from(deflated).map(byte => String.fromCharCode(byte)).join(''));
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
    return btoa(Array.from(zipped).map(byte => String.fromCharCode(byte)).join(''));
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

function encodeUrl(content: string): string {
  try {
    // Primero usamos encodeURIComponent para codificar la mayoría de los caracteres especiales
    let encoded = encodeURIComponent(content);
    
    // Luego reemplazamos manualmente algunos caracteres que encodeURIComponent no codifica
    // pero que deberían estar codificados en una URL completa
    encoded = encoded
      .replace(/!/g, '%21')
      .replace(/'/g, '%27')
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29')
      .replace(/\*/g, '%2A')
      .replace(/~/g, '%7E');
    
    return encoded;
  } catch (error) {
    throw new Error('Failed to encode URL content');
  }
}

function decodeUrl(content: string): string {
  try {
    // Primero verificamos si el contenido tiene caracteres codificados
    if (!content.includes('%') && !content.includes('+')) {
      // Si no hay caracteres codificados, podría ser que el contenido ya esté decodificado
      // o que no sea una URL codificada válida
      return content;
    }
    
    // Reemplazamos los caracteres que podrían haber sido codificados manualmente
    let decoded = content;
    
    // Finalmente aplicamos decodeURIComponent para decodificar el resto
    return decodeURIComponent(decoded);
  } catch (error) {
    // Si hay un error en la decodificación, podría ser que el contenido no esté correctamente codificado
    throw new Error('Failed to decode URL content. Make sure the input is properly URL encoded.');
  }
}

async function encryptAES(content: string, step: ProcessingStep): Promise<string> {
  try {
    if (!step.secretKey) {
      throw new Error('Secret key is required for AES encryption');
    }

    // Configurar el modo de cifrado
    const cipherMode = step.cipherMode || 'CBC';
    const mode = getCipherMode(cipherMode);

    // Configurar el padding
    const padding = getPadding(step.padding || 'PKCS5Padding');

    // Configurar el vector de inicialización (IV)
    let iv: any;
    if (step.iv && ['CBC', 'CFB', 'OFB', 'CTR'].includes(cipherMode)) {
      iv = CryptoJS.enc.Utf8.parse(step.iv);
    }

    // Configurar la clave secreta
    const keySize = parseInt(step.keySize || '128') / 32;
    const key = CryptoJS.enc.Utf8.parse(step.secretKey);
    
    // Configurar las opciones de encriptación
    const options: any = {
      mode: mode,
      padding: padding,
      iv: iv
    };

    // Encriptar el contenido
    const encrypted = CryptoJS.AES.encrypt(content, key, options);

    // Formatear la salida según el formato seleccionado
    const outputFormat = step.outputFormat || 'Base64';
    if (outputFormat === 'Hex') {
      return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    } else {
      return encrypted.toString();
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AES encryption failed: ${error.message}`);
    }
    throw new Error('AES encryption failed');
  }
}

async function decryptAES(content: string, step: ProcessingStep): Promise<string> {
  try {
    if (!step.secretKey) {
      throw new Error('Secret key is required for AES decryption');
    }

    // Configurar el modo de cifrado
    const cipherMode = step.cipherMode || 'CBC';
    const mode = getCipherMode(cipherMode);

    // Configurar el padding
    const padding = getPadding(step.padding || 'PKCS5Padding');

    // Configurar el vector de inicialización (IV)
    let iv: any;
    if (step.iv && ['CBC', 'CFB', 'OFB', 'CTR'].includes(cipherMode)) {
      iv = CryptoJS.enc.Utf8.parse(step.iv);
    }

    // Configurar la clave secreta
    const keySize = parseInt(step.keySize || '128') / 32;
    const key = CryptoJS.enc.Utf8.parse(step.secretKey);
    
    // Configurar las opciones de desencriptación
    const options: any = {
      mode: mode,
      padding: padding,
      iv: iv
    };

    // Preparar el contenido según el formato de entrada
    const inputFormat = step.outputFormat || 'Base64';
    let cipherParams: any;
    
    if (inputFormat === 'Hex') {
      const ciphertext = CryptoJS.enc.Hex.parse(content);
      cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: ciphertext
      });
    } else {
      cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Base64.parse(content)
      });
    }

    // Desencriptar el contenido
    const decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      key,
      options
    );

    // Convertir el resultado a texto
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`AES decryption failed: ${error.message}`);
    }
    throw new Error('AES decryption failed');
  }
}

// Funciones auxiliares para configurar el modo de cifrado y el padding
function getCipherMode(mode: string): any {
  switch (mode) {
    case 'CBC':
      return CryptoJS.mode.CBC;
    case 'ECB':
      return CryptoJS.mode.ECB;
    case 'CFB':
      return CryptoJS.mode.CFB;
    case 'OFB':
      return CryptoJS.mode.OFB;
    case 'CTR':
      return CryptoJS.mode.CTR;
    default:
      return CryptoJS.mode.CBC;
  }
}

function getPadding(padding: string): any {
  switch (padding) {
    case 'PKCS5Padding':
      return CryptoJS.pad.Pkcs7;
    case 'NoPadding':
      return {
        pad: () => {},
        unpad: () => {}
      };
    case 'ZeroPadding':
      return CryptoJS.pad.ZeroPadding;
    default:
      return CryptoJS.pad.Pkcs7;
  }
}