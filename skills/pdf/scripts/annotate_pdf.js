#!/usr/bin/env node

/**
 * PDF Annotation Script
 * Adds text annotations and highlights to PDF documents
 * 
 * Usage: node annotate_pdf.js <input.pdf> <annotations.json> <output.pdf>
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function annotatePDF(inputPath, annotationsPath, outputPath) {
  try {
    // Read input PDF
    const existingPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Read annotations configuration
    const annotations = JSON.parse(fs.readFileSync(annotationsPath, 'utf8'));
    
    // Load font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Process each annotation
    for (const annotation of annotations) {
      const pageIndex = (annotation.page || 1) - 1;
      
      if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
        console.warn(`Warning: Page ${annotation.page} does not exist. Skipping annotation.`);
        continue;
      }
      
      const page = pdfDoc.getPage(pageIndex);
      const { width, height } = page.getSize();
      
      switch (annotation.type) {
        case 'text':
          // Add text annotation
          page.drawText(annotation.text, {
            x: annotation.x || 50,
            y: height - (annotation.y || 50), // PDF coordinates are bottom-up
            size: annotation.fontSize || 12,
            font: annotation.bold ? boldFont : font,
            color: parseColor(annotation.color || '000000'),
          });
          break;
          
        case 'highlight':
          // Add highlight rectangle
          page.drawRectangle({
            x: annotation.x || 50,
            y: height - (annotation.y || 50) - (annotation.height || 20),
            width: annotation.width || 100,
            height: annotation.height || 20,
            color: parseColor(annotation.color || 'FFFF00'),
            opacity: annotation.opacity || 0.3,
          });
          break;
          
        case 'rectangle':
          // Add rectangle (for highlighting areas)
          page.drawRectangle({
            x: annotation.x || 50,
            y: height - (annotation.y || 50) - (annotation.height || 100),
            width: annotation.width || 100,
            height: annotation.height || 100,
            borderColor: parseColor(annotation.borderColor || 'FF0000'),
            borderWidth: annotation.borderWidth || 2,
            opacity: annotation.opacity || 1,
          });
          break;
          
        case 'watermark':
          // Add watermark text
          const watermarkSize = annotation.fontSize || 60;
          page.drawText(annotation.text, {
            x: width / 2 - (annotation.text.length * watermarkSize / 4),
            y: height / 2,
            size: watermarkSize,
            font: boldFont,
            color: parseColor(annotation.color || 'FF0000'),
            opacity: annotation.opacity || 0.2,
            rotate: { angle: -45, type: 'degrees' },
          });
          break;
          
        default:
          console.warn(`Unknown annotation type: ${annotation.type}`);
      }
    }
    
    // Save annotated PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    
    console.log(`PDF annotated successfully: ${outputPath}`);
    console.log(`Annotations applied: ${annotations.length}`);
    
  } catch (error) {
    console.error('Error annotating PDF:', error.message);
    process.exit(1);
  }
}

function parseColor(colorHex) {
  // Convert hex color to RGB
  const hex = colorHex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  return rgb(r, g, b);
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.error('Usage: node annotate_pdf.js <input.pdf> <annotations.json> <output.pdf>');
    console.error('\nannotations.json format:');
    console.error(JSON.stringify([
      {
        type: 'text',
        page: 1,
        x: 50,
        y: 50,
        text: 'Important Note',
        fontSize: 14,
        bold: true,
        color: 'FF0000'
      },
      {
        type: 'highlight',
        page: 1,
        x: 100,
        y: 200,
        width: 200,
        height: 20,
        color: 'FFFF00',
        opacity: 0.3
      },
      {
        type: 'watermark',
        page: 1,
        text: 'CONFIDENTIAL',
        fontSize: 60,
        color: 'FF0000',
        opacity: 0.2
      }
    ], null, 2));
    process.exit(1);
  }
  
  const [inputPath, annotationsPath, outputPath] = args;
  annotatePDF(inputPath, annotationsPath, outputPath);
}

module.exports = { annotatePDF };
