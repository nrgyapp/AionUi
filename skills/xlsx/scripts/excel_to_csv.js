#!/usr/bin/env node

/**
 * Excel to CSV Converter
 * Exports Excel sheets to CSV format
 * 
 * Usage: node excel_to_csv.js <input.xlsx> <output_dir> [--all-sheets] [--sheet-name="SheetName"]
 */

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function excelToCSV(xlsxPath, outputDir, options = {}) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(xlsxPath);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let sheetsToExport = [];
    
    if (options.allSheets) {
      sheetsToExport = workbook.worksheets;
    } else if (options.sheetName) {
      const sheet = workbook.getWorksheet(options.sheetName);
      if (!sheet) {
        throw new Error(`Sheet "${options.sheetName}" not found`);
      }
      sheetsToExport = [sheet];
    } else {
      // Default: export first sheet
      sheetsToExport = [workbook.worksheets[0]];
    }
    
    const exportedFiles = [];
    
    for (const sheet of sheetsToExport) {
      const csvFilename = `${sheet.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
      const csvPath = path.join(outputDir, csvFilename);
      
      // Convert sheet to CSV
      const csvLines = [];
      
      sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const values = [];
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          let value = '';
          
          if (cell.value !== null && cell.value !== undefined) {
            // Handle formula cells
            if (cell.type === ExcelJS.ValueType.Formula) {
              value = cell.result || '';
            } else {
              value = cell.value;
            }
            
            // Convert to string and escape if needed
            value = String(value);
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              value = `"${value.replace(/"/g, '""')}"`;
            }
          }
          
          values.push(value);
        });
        
        csvLines.push(values.join(','));
      });
      
      // Write CSV file
      fs.writeFileSync(csvPath, csvLines.join('\n'));
      exportedFiles.push(csvPath);
      console.log(`Exported ${sheet.name} to ${csvPath}`);
    }
    
    console.log(`\nTotal sheets exported: ${exportedFiles.length}`);
    
  } catch (error) {
    console.error('Error converting Excel to CSV:', error.message);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node excel_to_csv.js <input.xlsx> <output_dir> [--all-sheets] [--sheet-name="SheetName"]');
    process.exit(1);
  }
  
  const xlsxPath = args[0];
  const outputDir = args[1];
  const options = {
    allSheets: args.includes('--all-sheets'),
    sheetName: args.find(arg => arg.startsWith('--sheet-name='))?.split('=')[1]
  };
  
  excelToCSV(xlsxPath, outputDir, options);
}

module.exports = { excelToCSV };
