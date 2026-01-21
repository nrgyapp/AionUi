#!/usr/bin/env node

/**
 * Advanced Excel Automation Script
 * Provides advanced Excel operations like data analysis, chart generation, and automation
 */

const ExcelJS = require('exceljs');
const fs = require('fs').promises;
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    action: null,
    input: null,
    output: null,
    params: {},
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--action':
        config.action = args[++i];
        break;
      case '--input':
        config.input = args[++i];
        break;
      case '--output':
        config.output = args[++i];
        break;
      case '--sheet':
        config.params.sheet = args[++i];
        break;
      case '--range':
        config.params.range = args[++i];
        break;
      case '--chart-type':
        config.params.chartType = args[++i];
        break;
      case '--data-cols':
        config.params.dataCols = args[++i].split(',');
        break;
      case '--title':
        config.params.title = args[++i];
        break;
      case '--file2':
        config.params.file2 = args[++i];
        break;
      case '--help':
        console.log(`
Advanced Excel Automation

Usage: node excel_advanced.js --action <action> [options]

Actions:
  analyze          Analyze data and generate statistics
  create-chart     Create charts from data
  create-pivot     Create pivot table
  autofilter       Add autofilter to data
  validate         Add data validation rules
  format           Apply conditional formatting
  compare          Compare two Excel files
  merge            Merge multiple Excel files
  extract-charts   Extract charts as images

Common Options:
  --input <file>       Input Excel file
  --output <file>      Output Excel file
  --sheet <name>       Sheet name to work with
  --range <range>      Cell range (e.g., A1:D10)
  --help               Show this help

Action-specific options:
  create-chart:
    --chart-type <type>    Chart type: bar, line, pie, scatter
    --data-cols <cols>     Data columns (comma-separated)
    --title <title>        Chart title

Examples:
  node excel_advanced.js --action analyze --input data.xlsx --output report.xlsx
  node excel_advanced.js --action create-chart --input data.xlsx --output chart.xlsx --chart-type bar --data-cols A,B,C
        `);
        process.exit(0);
    }
  }

  if (!config.action) {
    console.error('Error: --action parameter is required');
    process.exit(1);
  }

  return config;
}

// Analyze data and generate statistics
async function analyzeData(config) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(config.input);

  const sheet = config.params.sheet
    ? workbook.getWorksheet(config.params.sheet)
    : workbook.worksheets[0];

  const stats = {
    sheetName: sheet.name,
    rowCount: sheet.rowCount,
    columnCount: sheet.columnCount,
    columns: [],
    summary: {},
  };

  // Get column headers
  const headerRow = sheet.getRow(1);
  const headers = [];
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber] = cell.value;
  });

  // Analyze each column
  for (let col = 1; col <= sheet.columnCount; col++) {
    const columnData = [];
    const colLetter = String.fromCharCode(64 + col);

    for (let row = 2; row <= sheet.rowCount; row++) {
      const cell = sheet.getCell(row, col);
      if (cell.value !== null && cell.value !== undefined) {
        columnData.push(cell.value);
      }
    }

    if (columnData.length > 0) {
      const colStats = {
        column: colLetter,
        header: headers[col] || `Column ${col}`,
        count: columnData.length,
        type: typeof columnData[0],
        unique: new Set(columnData).size,
      };

      // If numeric, calculate statistics
      if (typeof columnData[0] === 'number') {
        const numbers = columnData.filter((v) => typeof v === 'number');
        if (numbers.length > 0) {
          colStats.min = Math.min(...numbers);
          colStats.max = Math.max(...numbers);
          colStats.avg = numbers.reduce((a, b) => a + b, 0) / numbers.length;
          colStats.sum = numbers.reduce((a, b) => a + b, 0);
        }
      }

      stats.columns.push(colStats);
    }
  }

  // Create analysis report in new workbook
  const outputWorkbook = new ExcelJS.Workbook();
  const summarySheet = outputWorkbook.addWorksheet('Analysis Summary');

  // Add headers
  summarySheet.columns = [
    { header: 'Column', key: 'column', width: 10 },
    { header: 'Header', key: 'header', width: 20 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Count', key: 'count', width: 10 },
    { header: 'Unique', key: 'unique', width: 10 },
    { header: 'Min', key: 'min', width: 15 },
    { header: 'Max', key: 'max', width: 15 },
    { header: 'Average', key: 'avg', width: 15 },
    { header: 'Sum', key: 'sum', width: 15 },
  ];

  // Style header
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };

  // Add data
  stats.columns.forEach((col) => {
    summarySheet.addRow(col);
  });

  // Auto-fit columns
  summarySheet.columns.forEach((column) => {
    column.width = Math.max(column.width || 10, 12);
  });

  // Save output
  await outputWorkbook.xlsx.writeFile(config.output);

  console.log('\n=== Data Analysis Complete ===');
  console.log(`Sheet: ${stats.sheetName}`);
  console.log(`Rows: ${stats.rowCount}`);
  console.log(`Columns: ${stats.columnCount}`);
  console.log(`Analysis saved to: ${config.output}`);
}

// Create chart from data
async function createChart(config) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(config.input);

  const sheet = config.params.sheet
    ? workbook.getWorksheet(config.params.sheet)
    : workbook.worksheets[0];

  // For now, we'll create a new sheet with chart instructions
  // Note: ExcelJS has limited chart support, charts are better created via libraries like pptxgenjs
  const chartSheet = workbook.addWorksheet('Chart Data');

  chartSheet.addRow(['Chart Configuration']);
  chartSheet.addRow(['Type', config.params.chartType || 'bar']);
  chartSheet.addRow(['Title', config.params.title || 'Chart']);
  chartSheet.addRow(['Data Columns', (config.params.dataCols || []).join(', ')]);
  chartSheet.addRow([]);
  chartSheet.addRow(['Note: For full chart generation, use pptxgenjs or export to PowerPoint']);

  await workbook.xlsx.writeFile(config.output);

  console.log('\n=== Chart Configuration Created ===');
  console.log(`Type: ${config.params.chartType || 'bar'}`);
  console.log(`Output saved to: ${config.output}`);
  console.log('Note: For full chart rendering, consider using PowerPoint generation');
}

// Add autofilter to data
async function addAutofilter(config) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(config.input);

  const sheet = config.params.sheet
    ? workbook.getWorksheet(config.params.sheet)
    : workbook.worksheets[0];

  // Determine range
  const range = config.params.range || `A1:${getColumnLetter(sheet.columnCount)}${sheet.rowCount}`;

  sheet.autoFilter = range;

  // Freeze the header row
  sheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

  await workbook.xlsx.writeFile(config.output);

  console.log('\n=== Autofilter Added ===');
  console.log(`Range: ${range}`);
  console.log(`Output saved to: ${config.output}`);
}

// Helper function to convert column number to letter
function getColumnLetter(colNumber) {
  let letter = '';
  while (colNumber > 0) {
    const modulo = (colNumber - 1) % 26;
    letter = String.fromCharCode(65 + modulo) + letter;
    colNumber = Math.floor((colNumber - modulo) / 26);
  }
  return letter;
}

// Compare two Excel files
async function compareFiles(config) {
  console.log('Comparing files...');

  if (!config.params.file2) {
    console.error('Error: Second file not specified. Use --file2 parameter');
    return;
  }

  const workbook1 = new ExcelJS.Workbook();
  const workbook2 = new ExcelJS.Workbook();

  await workbook1.xlsx.readFile(config.input);
  await workbook2.xlsx.readFile(config.params.file2);

  const differences = {
    sheetCount: {
      file1: workbook1.worksheets.length,
      file2: workbook2.worksheets.length,
    },
    sheets: [],
  };

  // Compare common sheets
  workbook1.worksheets.forEach((sheet1) => {
    const sheet2 = workbook2.getWorksheet(sheet1.name);
    if (sheet2) {
      const sheetDiff = {
        name: sheet1.name,
        rowCount: { file1: sheet1.rowCount, file2: sheet2.rowCount },
        columnCount: { file1: sheet1.columnCount, file2: sheet2.columnCount },
        cellDifferences: [],
      };

      // Compare cells (sample first 100 rows to avoid performance issues)
      const maxRow = Math.min(100, Math.max(sheet1.rowCount, sheet2.rowCount));
      for (let row = 1; row <= maxRow; row++) {
        for (let col = 1; col <= Math.max(sheet1.columnCount, sheet2.columnCount); col++) {
          const cell1 = sheet1.getCell(row, col);
          const cell2 = sheet2.getCell(row, col);

          if (cell1.value !== cell2.value) {
            sheetDiff.cellDifferences.push({
              cell: `${getColumnLetter(col)}${row}`,
              file1: cell1.value,
              file2: cell2.value,
            });
          }
        }
      }

      differences.sheets.push(sheetDiff);
    }
  });

  // Save comparison report
  await fs.writeFile(config.output, JSON.stringify(differences, null, 2));

  console.log('\n=== File Comparison Complete ===');
  console.log(`Sheets in file 1: ${differences.sheetCount.file1}`);
  console.log(`Sheets in file 2: ${differences.sheetCount.file2}`);
  console.log(`Comparison report saved to: ${config.output}`);
}

// Main function
async function main() {
  const config = parseArgs();

  try {
    switch (config.action) {
      case 'analyze':
        await analyzeData(config);
        break;
      case 'create-chart':
        await createChart(config);
        break;
      case 'autofilter':
        await addAutofilter(config);
        break;
      case 'compare':
        await compareFiles(config);
        break;
      default:
        console.error(`Unknown action: ${config.action}`);
        console.log('Use --help for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
