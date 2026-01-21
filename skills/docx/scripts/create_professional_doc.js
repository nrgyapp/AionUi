#!/usr/bin/env node

/**
 * Professional Document Generator
 * Creates professional Word documents with advanced styling
 * 
 * Usage: node create_professional_doc.js <config.json> <output.docx>
 */

const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, 
        AlignmentType, BorderStyle, WidthType, Header, Footer, PageNumber, TableOfContents } = require('docx');
const fs = require('fs');

async function createProfessionalDocument(configPath, outputPath) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    const doc = new Document({
      creator: config.author || 'Cowork Assistant',
      title: config.title || 'Professional Document',
      description: config.description || '',
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1440,  // 1 inch = 1440 twips
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: config.headerText || config.title || '',
                alignment: AlignmentType.RIGHT,
                spacing: { after: 200 },
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun('Page '),
                  new PageNumber(),
                ],
              }),
            ],
          }),
        },
        children: createDocumentContent(config),
      }],
    });
    
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    
    console.log(`Professional document created: ${outputPath}`);
    
  } catch (error) {
    console.error('Error creating document:', error.message);
    process.exit(1);
  }
}

function createDocumentContent(config) {
  const content = [];
  
  // Title page
  if (config.includeTitle !== false) {
    content.push(
      new Paragraph({
        text: config.title || 'Document Title',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 2880, after: 1440 }, // 2 inches before, 1 after
      })
    );
    
    if (config.subtitle) {
      content.push(
        new Paragraph({
          text: config.subtitle,
          alignment: AlignmentType.CENTER,
          spacing: { after: 720 },
        })
      );
    }
    
    if (config.author) {
      content.push(
        new Paragraph({
          text: `By: ${config.author}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 720 },
        })
      );
    }
    
    if (config.date) {
      content.push(
        new Paragraph({
          text: config.date,
          alignment: AlignmentType.CENTER,
          spacing: { after: 2880 },
        })
      );
    }
  }
  
  // Table of Contents
  if (config.includeTOC) {
    content.push(
      new Paragraph({
        text: 'Table of Contents',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 480, after: 240 },
      })
    );
    
    content.push(
      new TableOfContents('Table of Contents', {
        hyperlink: true,
        headingStyleRange: '1-3',
      })
    );
    
    // Page break after TOC
    content.push(
      new Paragraph({
        text: '',
        pageBreakBefore: true,
      })
    );
  }
  
  // Sections
  if (config.sections) {
    config.sections.forEach(section => {
      // Section heading
      content.push(
        new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 480, after: 240 },
        })
      );
      
      // Section content
      if (section.paragraphs) {
        section.paragraphs.forEach(para => {
          content.push(
            new Paragraph({
              text: para,
              spacing: { after: 200 },
              alignment: AlignmentType.JUSTIFIED,
            })
          );
        });
      }
      
      // Subsections
      if (section.subsections) {
        section.subsections.forEach(subsection => {
          content.push(
            new Paragraph({
              text: subsection.title,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 360, after: 180 },
            })
          );
          
          if (subsection.paragraphs) {
            subsection.paragraphs.forEach(para => {
              content.push(
                new Paragraph({
                  text: para,
                  spacing: { after: 200 },
                  alignment: AlignmentType.JUSTIFIED,
                })
              );
            });
          }
          
          // Bullet lists
          if (subsection.bullets) {
            subsection.bullets.forEach(bullet => {
              content.push(
                new Paragraph({
                  text: bullet,
                  bullet: { level: 0 },
                  spacing: { after: 100 },
                })
              );
            });
          }
          
          // Numbered lists
          if (subsection.numbered) {
            subsection.numbered.forEach((item, idx) => {
              content.push(
                new Paragraph({
                  text: item,
                  numbering: {
                    reference: 'default-numbering',
                    level: 0,
                  },
                  spacing: { after: 100 },
                })
              );
            });
          }
        });
      }
      
      // Tables
      if (section.tables) {
        section.tables.forEach(tableData => {
          const table = createTable(tableData);
          content.push(table);
          content.push(new Paragraph({ text: '', spacing: { after: 240 } }));
        });
      }
    });
  }
  
  // References
  if (config.references) {
    content.push(
      new Paragraph({
        text: 'References',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 480, after: 240 },
        pageBreakBefore: true,
      })
    );
    
    config.references.forEach((ref, idx) => {
      content.push(
        new Paragraph({
          text: `[${idx + 1}] ${ref}`,
          spacing: { after: 120 },
        })
      );
    });
  }
  
  return content;
}

function createTable(tableData) {
  const rows = [];
  
  // Header row
  if (tableData.headers) {
    rows.push(
      new TableRow({
        children: tableData.headers.map(header => 
          new TableCell({
            children: [
              new Paragraph({
                text: header,
                bold: true,
              })
            ],
            shading: {
              fill: 'D9D9D9',
            },
          })
        ),
      })
    );
  }
  
  // Data rows
  if (tableData.rows) {
    tableData.rows.forEach(row => {
      rows.push(
        new TableRow({
          children: row.map(cell => 
            new TableCell({
              children: [new Paragraph({ text: String(cell) })],
            })
          ),
        })
      );
    });
  }
  
  return new Table({
    rows: rows,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1 },
      bottom: { style: BorderStyle.SINGLE, size: 1 },
      left: { style: BorderStyle.SINGLE, size: 1 },
      right: { style: BorderStyle.SINGLE, size: 1 },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
      insideVertical: { style: BorderStyle.SINGLE, size: 1 },
    },
  });
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node create_professional_doc.js <config.json> <output.docx>');
    process.exit(1);
  }
  
  const [configPath, outputPath] = args;
  createProfessionalDocument(configPath, outputPath);
}

module.exports = { createProfessionalDocument };
