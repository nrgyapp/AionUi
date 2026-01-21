#!/usr/bin/env node

/**
 * PDF Template Filler with Dynamic Data
 * Fills PDF templates with dynamic data and annotations
 * 
 * Usage: node fill_pdf_template.js <template.pdf> <data.json> <output.pdf>
 */

const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

async function fillPDFTemplate(templatePath, dataPath, outputPath) {
  try {
    // Read template PDF and data
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Process fields for each page
    if (data.fields) {
      for (const field of data.fields) {
        const pageIndex = (field.page || 1) - 1;
        
        if (pageIndex < 0 || pageIndex >= pdfDoc.getPageCount()) {
          console.warn(`Warning: Page ${field.page} does not exist`);
          continue;
        }
        
        const page = pdfDoc.getPage(pageIndex);
        const { height } = page.getSize();
        
        // Replace placeholder text or add new text
        const textOptions = {
          x: field.x || 50,
          y: height - (field.y || 50),
          size: field.fontSize || 12,
          font: field.bold ? boldFont : font,
          color: field.color ? parseColor(field.color) : rgb(0, 0, 0),
        };
        
        // Support dynamic data substitution
        let text = field.value || '';
        
        // Replace variables in format {{variable}}
        if (data.variables) {
          Object.keys(data.variables).forEach(key => {
            const placeholder = `{{${key}}}`;
            text = text.replace(new RegExp(placeholder, 'g'), data.variables[key]);
          });
        }
        
        page.drawText(text, textOptions);
      }
    }
    
    // Add dynamic images if specified
    if (data.images) {
      for (const imageData of data.images) {
        const pageIndex = (imageData.page || 1) - 1;
        const page = pdfDoc.getPage(pageIndex);
        const { height } = page.getSize();
        
        let image;
        const imageBytes = fs.readFileSync(imageData.path);
        
        if (imageData.path.toLowerCase().endsWith('.png')) {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (imageData.path.toLowerCase().endsWith('.jpg') || 
                   imageData.path.toLowerCase().endsWith('.jpeg')) {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          console.warn(`Unsupported image format: ${imageData.path}`);
          continue;
        }
        
        const dims = image.scale(imageData.scale || 1);
        page.drawImage(image, {
          x: imageData.x || 50,
          y: height - (imageData.y || 50) - dims.height,
          width: dims.width,
          height: dims.height,
        });
      }
    }
    
    // Add metadata
    if (data.metadata) {
      pdfDoc.setTitle(data.metadata.title || '');
      pdfDoc.setAuthor(data.metadata.author || '');
      pdfDoc.setSubject(data.metadata.subject || '');
      pdfDoc.setKeywords(data.metadata.keywords || []);
      pdfDoc.setCreationDate(new Date());
    }
    
    // Save filled PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    
    console.log(`PDF template filled: ${outputPath}`);
    console.log(`Fields processed: ${data.fields?.length || 0}`);
    console.log(`Images added: ${data.images?.length || 0}`);
    
  } catch (error) {
    console.error('Error filling PDF template:', error.message);
    process.exit(1);
  }
}

function parseColor(colorHex) {
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
    console.error('Usage: node fill_pdf_template.js <template.pdf> <data.json> <output.pdf>');
    console.error('\ndata.json format:');
    console.error(JSON.stringify({
      variables: {
        companyName: 'Acme Corp',
        date: '2025-01-21',
        amount: '$10,000'
      },
      fields: [
        {
          page: 1,
          x: 100,
          y: 100,
          value: 'Company: {{companyName}}',
          fontSize: 14,
          bold: true
        },
        {
          page: 1,
          x: 100,
          y: 130,
          value: 'Date: {{date}}',
          fontSize: 12
        }
      ],
      metadata: {
        title: 'Invoice',
        author: 'Accounting Department',
        subject: 'Customer Invoice'
      }
    }, null, 2));
    process.exit(1);
  }
  
  const [templatePath, dataPath, outputPath] = args;
  fillPDFTemplate(templatePath, dataPath, outputPath);
}

module.exports = { fillPDFTemplate };
