import fs from 'fs';
import readline from 'readline';
import { MunicipalityRawData } from '@shared/schema';

/**
 * Parse a CSV file with municipality data
 */
export async function parseCsvFile(filePath: string): Promise<MunicipalityRawData[]> {
  return new Promise((resolve, reject) => {
    const data: MunicipalityRawData[] = [];
    let headers: string[] = [];
    let lineno = 0;
    
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });
    
    rl.on('line', (line) => {
      lineno++;
      
      // Skip empty lines
      if (!line.trim()) return;
      
      // Split the line by comma, handling quoted values
      const values = parseCSVLine(line);
      
      if (lineno === 1) {
        // First line contains headers
        headers = values;
      } else {
        // Create an object using headers as keys
        const rowData: MunicipalityRawData = {};
        
        headers.forEach((header, index) => {
          // Handle missing values
          const value = values[index] || '';
          
          // Try to convert to number if possible
          if (!isNaN(Number(value)) && value !== '') {
            rowData[header] = Number(value);
          } else {
            rowData[header] = value;
          }
        });
        
        data.push(rowData);
      }
    });
    
    rl.on('close', () => {
      resolve(data);
    });
    
    rl.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last value
  result.push(current);
  
  return result;
}
