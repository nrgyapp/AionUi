#!/usr/bin/env node

/**
 * CSV to Excel Converter
 * Converts CSV files to Excel with formatting
 * 
 * Usage: node csv_to_excel.js <input.csv> <output.xlsx> [--header-row] [--auto-format]
 */

const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

async function csvToExcel(csvPath, xlsxPath, options = {}) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet1');
    
    // Read CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Parse CSV
    const rows = lines.map(line => {
      // Simple CSV parsing (doesn't handle quoted commas)
      return line.split(',').map(cell => cell.trim());
    });
    
    // Add data to worksheet
    rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const excelRow = rowIndex + 1;
        const excelCol = colIndex + 1;
        
        // Try to parse as number
        let value = cell;
        if (!isNaN(cell) && cell !== '') {
          value = parseFloat(cell);
        }
        
        worksheet.getCell(excelRow, excelCol).value = value;
        
        // Format header row
        if (rowIndex === 0 && options.headerRow) {
          worksheet.getCell(excelRow, excelCol).font = { bold: true };
          worksheet.getCell(excelRow, excelCol).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9D9D9' }
          };
        }
      });
    });
    
    // Auto-format columns
    if (options.autoFormat) {
      worksheet.columns.forEach((column, idx) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, cell => {
          const cellLength = cell.value ? cell.value.toString().length : 0;
          maxLength = Math.max(maxLength, cellLength);
        });
        column.width = Math.min(Math.max(maxLength + 2, 10), 50);
      });
      
      // Add filters to header row
      if (options.headerRow && rows.length > 1) {
        worksheet.autoFilter = {
          from: { row: 1, column: 1 },
          to: { row: 1, column: rows[0].length }
        };
      }
    }
    
    // Save workbook
    await workbook.xlsx.writeFile(xlsxPath);
    console.log(`Converted ${csvPath} to ${xlsxPath}`);
    console.log(`Rows: ${rows.length}, Columns: ${rows[0]?.length || 0}`);
    
  } catch (error) {
    console.error('Error converting CSV to Excel:', error.message);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node csv_to_excel.js <input.csv> <output.xlsx> [--header-row] [--auto-format]');
    process.exit(1);
  }
  
  const csvPath = args[0];
  const xlsxPath = args[1];
  const options = {
    headerRow: args.includes('--header-row'),
    autoFormat: args.includes('--auto-format')
  };
  
  csvToExcel(csvPath, xlsxPath, options);
}

module.exports = { csvToExcel };
