#!/usr/bin/env node

/**
 * PDF Merger (JavaScript version using pdf-lib)
 * Merges multiple PDF files into a single document
 * 
 * Usage: node merge_pdfs_js.js <output.pdf> <input1.pdf> <input2.pdf> ...
 */

const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function mergePDFs(outputPath, inputPaths) {
  try {
    // Create new PDF document
    const mergedPdf = await PDFDocument.create();
    
    // Process each input PDF
    for (const inputPath of inputPaths) {
      console.log(`Adding ${inputPath}...`);
      
      const pdfBytes = fs.readFileSync(inputPath);
      const pdf = await PDFDocument.load(pdfBytes);
      
      // Copy all pages from this PDF
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => {
        mergedPdf.addPage(page);
      });
    }
    
    // Save merged PDF
    const mergedPdfBytes = await mergedPdf.save();
    fs.writeFileSync(outputPath, mergedPdfBytes);
    
    console.log(`\nMerged PDF created: ${outputPath}`);
    console.log(`Total pages: ${mergedPdf.getPageCount()}`);
    console.log(`Input files: ${inputPaths.length}`);
    
  } catch (error) {
    console.error('Error merging PDFs:', error.message);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node merge_pdfs_js.js <output.pdf> <input1.pdf> <input2.pdf> ...');
    process.exit(1);
  }
  
  const outputPath = args[0];
  const inputPaths = args.slice(1);
  
  mergePDFs(outputPath, inputPaths);
}

module.exports = { mergePDFs };
