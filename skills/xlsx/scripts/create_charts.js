#!/usr/bin/env node

/**
 * Excel Chart Generator
 * Creates various chart types in Excel workbooks
 * 
 * Usage: node create_charts.js <data.json> <output.xlsx>
 */

const ExcelJS = require('exceljs');
const fs = require('fs');

async function createCharts(dataPath, outputPath) {
  try {
    const chartConfig = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const workbook = new ExcelJS.Workbook();
    
    // Create data sheet
    const dataSheet = workbook.addWorksheet('Data');
    
    // Add data to sheet
    if (chartConfig.data) {
      const { headers, rows } = chartConfig.data;
      
      // Add headers
      headers.forEach((header, idx) => {
        dataSheet.getCell(1, idx + 1).value = header;
        dataSheet.getCell(1, idx + 1).font = { bold: true };
      });
      
      // Add rows
      rows.forEach((row, rowIdx) => {
        row.forEach((value, colIdx) => {
          dataSheet.getCell(rowIdx + 2, colIdx + 1).value = value;
        });
      });
      
      // Auto-fit columns
      dataSheet.columns.forEach(column => {
        column.width = 15;
      });
    }
    
    // Create charts sheet
    const chartsSheet = workbook.addWorksheet('Charts');
    chartsSheet.getCell('A1').value = 'Charts';
    chartsSheet.getCell('A1').font = { bold: true, size: 14 };
    
    // Note: ExcelJS has limited chart support
    // For full chart functionality, consider using xlsx-populate or officegen
    
    // Add chart references/instructions
    let row = 3;
    if (chartConfig.charts) {
      chartConfig.charts.forEach(chart => {
        chartsSheet.getCell(`A${row}`).value = `${chart.type} Chart: ${chart.title}`;
        chartsSheet.getCell(`A${row}`).font = { bold: true };
        row++;
        
        chartsSheet.getCell(`A${row}`).value = `Data Range: ${chart.dataRange}`;
        row++;
        
        chartsSheet.getCell(`A${row}`).value = `Series: ${chart.series.join(', ')}`;
        row += 2;
      });
    }
    
    // Save workbook
    await workbook.xlsx.writeFile(outputPath);
    console.log(`Charts workbook created: ${outputPath}`);
    console.log('Note: For advanced charting, use Excel to create charts after opening the file');
    
  } catch (error) {
    console.error('Error creating charts:', error.message);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node create_charts.js <data.json> <output.xlsx>');
    console.error('\ndata.json format:');
    console.error(JSON.stringify({
      data: {
        headers: ['Month', 'Revenue', 'Expenses'],
        rows: [
          ['Jan', 100000, 60000],
          ['Feb', 120000, 65000],
          ['Mar', 110000, 62000]
        ]
      },
      charts: [
        {
          type: 'bar',
          title: 'Monthly Revenue vs Expenses',
          dataRange: 'A1:C4',
          series: ['Revenue', 'Expenses']
        }
      ]
    }, null, 2));
    process.exit(1);
  }
  
  const [dataPath, outputPath] = args;
  createCharts(dataPath, outputPath);
}

module.exports = { createCharts };
