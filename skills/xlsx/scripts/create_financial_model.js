#!/usr/bin/env node

/**
 * Financial Model Generator
 * Creates multi-sheet financial models with advanced formulas
 * 
 * Usage: node create_financial_model.js <config.json> <output.xlsx>
 */

const ExcelJS = require('exceljs');
const fs = require('fs');

async function createFinancialModel(configPath, outputPath) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const workbook = new ExcelJS.Workbook();
    
    // Set workbook properties
    workbook.creator = config.author || 'Cowork Assistant';
    workbook.created = new Date();
    
    // Create Assumptions sheet
    const assumptionsSheet = workbook.addWorksheet('Assumptions');
    createAssumptionsSheet(assumptionsSheet, config.assumptions || {});
    
    // Create Income Statement sheet
    const incomeSheet = workbook.addWorksheet('Income Statement');
    createIncomeStatement(incomeSheet, config);
    
    // Create Balance Sheet
    if (config.includeBalanceSheet) {
      const balanceSheet = workbook.addWorksheet('Balance Sheet');
      createBalanceSheet(balanceSheet, config);
    }
    
    // Create Cash Flow sheet
    if (config.includeCashFlow) {
      const cashFlowSheet = workbook.addWorksheet('Cash Flow');
      createCashFlowStatement(cashFlowSheet, config);
    }
    
    // Create Dashboard with charts
    if (config.includeDashboard) {
      const dashboardSheet = workbook.addWorksheet('Dashboard');
      createDashboard(dashboardSheet, workbook, config);
    }
    
    // Save workbook
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Financial model created: ${outputPath}`);
    console.log(`Sheets: ${workbook.worksheets.map(ws => ws.name).join(', ')}`);
    
  } catch (error) {
    console.error('Error creating financial model:', error.message);
    process.exit(1);
  }
}

function createAssumptionsSheet(sheet, assumptions) {
  // Headers
  sheet.getCell('A1').value = 'Assumptions';
  sheet.getCell('A1').font = { bold: true, size: 14 };
  
  // Revenue assumptions
  let row = 3;
  sheet.getCell(`A${row}`).value = 'Revenue Assumptions';
  sheet.getCell(`A${row}`).font = { bold: true };
  row++;
  
  sheet.getCell(`A${row}`).value = 'Base Revenue';
  sheet.getCell(`B${row}`).value = assumptions.baseRevenue || 1000000;
  sheet.getCell(`B${row}`).font = { color: { argb: 'FF0000FF' } }; // Blue for inputs
  sheet.getCell(`B${row}`).numFmt = '$#,##0';
  row++;
  
  sheet.getCell(`A${row}`).value = 'Growth Rate (%)';
  sheet.getCell(`B${row}`).value = assumptions.growthRate || 0.15;
  sheet.getCell(`B${row}`).font = { color: { argb: 'FF0000FF' } };
  sheet.getCell(`B${row}`).numFmt = '0.0%';
  row++;
  
  // Cost assumptions
  row++;
  sheet.getCell(`A${row}`).value = 'Cost Assumptions';
  sheet.getCell(`A${row}`).font = { bold: true };
  row++;
  
  sheet.getCell(`A${row}`).value = 'COGS (% of Revenue)';
  sheet.getCell(`B${row}`).value = assumptions.cogsPercent || 0.40;
  sheet.getCell(`B${row}`).font = { color: { argb: 'FF0000FF' } };
  sheet.getCell(`B${row}`).numFmt = '0.0%';
  row++;
  
  sheet.getCell(`A${row}`).value = 'Operating Expenses';
  sheet.getCell(`B${row}`).value = assumptions.opex || 200000;
  sheet.getCell(`B${row}`).font = { color: { argb: 'FF0000FF' } };
  sheet.getCell(`B${row}`).numFmt = '$#,##0';
  
  // Column widths
  sheet.getColumn('A').width = 30;
  sheet.getColumn('B').width = 20;
}

function createIncomeStatement(sheet, config) {
  const years = config.projectionYears || 5;
  const startYear = config.startYear || new Date().getFullYear();
  
  // Headers
  sheet.getCell('A1').value = 'Income Statement';
  sheet.getCell('A1').font = { bold: true, size: 14 };
  
  // Year headers
  sheet.getCell('A3').value = 'Year';
  sheet.getCell('A3').font = { bold: true };
  for (let i = 0; i < years; i++) {
    const col = String.fromCharCode(66 + i); // B, C, D...
    sheet.getCell(`${col}3`).value = (startYear + i).toString();
    sheet.getCell(`${col}3').font = { bold: true };
    sheet.getCell(`${col}3`).alignment = { horizontal: 'center' };
  }
  
  let row = 5;
  
  // Revenue
  sheet.getCell(`A${row}`).value = 'Revenue';
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let i = 0; i < years; i++) {
    const col = String.fromCharCode(66 + i);
    if (i === 0) {
      sheet.getCell(`${col}${row}`).value = { formula: '=Assumptions!B4' };
    } else {
      const prevCol = String.fromCharCode(65 + i);
      sheet.getCell(`${col}${row}`).value = { 
        formula: `=${prevCol}${row}*(1+Assumptions!$B$5)` 
      };
    }
    sheet.getCell(`${col}${row}`).numFmt = '$#,##0;($#,##0);-';
  }
  row++;
  
  // COGS
  sheet.getCell(`A${row}`).value = 'Cost of Goods Sold';
  for (let i = 0; i < years; i++) {
    const col = String.fromCharCode(66 + i);
    sheet.getCell(`${col}${row}`).value = { 
      formula: `=${col}${row-1}*Assumptions!$B$8` 
    };
    sheet.getCell(`${col}${row}`).numFmt = '$#,##0;($#,##0);-';
  }
  row++;
  
  // Gross Profit
  sheet.getCell(`A${row}`).value = 'Gross Profit';
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let i = 0; i < years; i++) {
    const col = String.fromCharCode(66 + i);
    sheet.getCell(`${col}${row}`).value = { 
      formula: `=${col}${row-2}-${col}${row-1}` 
    };
    sheet.getCell(`${col}${row}`).numFmt = '$#,##0;($#,##0);-';
  }
  row++;
  
  // Operating Expenses
  row++;
  sheet.getCell(`A${row}`).value = 'Operating Expenses';
  for (let i = 0; i < years; i++) {
    const col = String.fromCharCode(66 + i);
    sheet.getCell(`${col}${row}`).value = { formula: '=Assumptions!B9' };
    sheet.getCell(`${col}${row}`).numFmt = '$#,##0;($#,##0);-';
  }
  row++;
  
  // Operating Income (EBIT)
  sheet.getCell(`A${row}`).value = 'Operating Income (EBIT)';
  sheet.getCell(`A${row}`).font = { bold: true };
  for (let i = 0; i < years; i++) {
    const col = String.fromCharCode(66 + i);
    sheet.getCell(`${col}${row}`).value = { 
      formula: `=${col}${row-3}-${col}${row-1}` 
    };
    sheet.getCell(`${col}${row}`).numFmt = '$#,##0;($#,##0);-';
  }
  
  // Column widths
  sheet.getColumn('A').width = 30;
  for (let i = 0; i < years; i++) {
    sheet.getColumn(i + 2).width = 15;
  }
}

function createBalanceSheet(sheet, config) {
  const years = config.projectionYears || 5;
  const startYear = config.startYear || new Date().getFullYear();
  
  sheet.getCell('A1').value = 'Balance Sheet';
  sheet.getCell('A1').font = { bold: true, size: 14 };
  
  // Year headers
  sheet.getCell('A3').value = 'Year';
  sheet.getCell('A3').font = { bold: true };
  for (let i = 0; i < years; i++) {
    const col = String.fromCharCode(66 + i);
    sheet.getCell(`${col}3`).value = (startYear + i).toString();
    sheet.getCell(`${col}3`).font = { bold: true };
  }
  
  let row = 5;
  
  // Assets section
  sheet.getCell(`A${row}`).value = 'ASSETS';
  sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
  row++;
  
  // Placeholder for now - can be expanded based on requirements
  sheet.getCell(`A${row}`).value = 'Total Assets';
  row++;
  
  // Liabilities section
  row++;
  sheet.getCell(`A${row}`).value = 'LIABILITIES';
  sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
  
  sheet.getColumn('A').width = 30;
}

function createCashFlowStatement(sheet, config) {
  const years = config.projectionYears || 5;
  const startYear = config.startYear || new Date().getFullYear();
  
  sheet.getCell('A1').value = 'Cash Flow Statement';
  sheet.getCell('A1').font = { bold: true, size: 14 };
  
  // Year headers
  sheet.getCell('A3').value = 'Year';
  for (let i = 0; i < years; i++) {
    const col = String.fromCharCode(66 + i);
    sheet.getCell(`${col}3`).value = (startYear + i).toString();
    sheet.getCell(`${col}3`).font = { bold: true };
  }
  
  sheet.getColumn('A').width = 30;
}

function createDashboard(sheet, workbook, config) {
  sheet.getCell('A1').value = 'Financial Dashboard';
  sheet.getCell('A1').font = { bold: true, size: 16 };
  
  // Add charts (simplified - full implementation would add actual charts)
  sheet.getCell('A3').value = 'Revenue Trend';
  sheet.getCell('A3').font = { bold: true };
  
  sheet.getCell('A10').value = 'Profitability Metrics';
  sheet.getCell('A10').font = { bold: true };
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node create_financial_model.js <config.json> <output.xlsx>');
    process.exit(1);
  }
  
  const [configPath, outputPath] = args;
  createFinancialModel(configPath, outputPath);
}

module.exports = { createFinancialModel };
