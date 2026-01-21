#!/usr/bin/env node

/**
 * Advanced Word Document Automation Script
 * Generate Word documents with advanced formatting and content
 */

const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
  WidthType,
  BorderStyle,
  TableOfContents,
} = require('docx');
const fs = require('fs').promises;

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    action: null,
    input: null,
    output: 'document.docx',
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
      case '--title':
        config.params.title = args[++i];
        break;
      case '--author':
        config.params.author = args[++i];
        break;
      case '--template':
        config.params.template = args[++i];
        break;
      case '--help':
        console.log(`
Advanced Word Document Automation

Usage: node docx_advanced.js --action <action> [options]

Actions:
  from-json        Create document from JSON configuration
  from-markdown    Convert Markdown to Word document
  report           Create formatted report document
  letter           Create business letter
  meeting-notes    Create meeting notes template
  table-doc        Create document with tables

Options:
  --input <file>       Input JSON or Markdown file
  --output <file>      Output Word document (default: document.docx)
  --title <text>       Document title
  --author <name>      Document author
  --template <name>    Template style: business, academic, report
  --help               Show this help

Examples:
  node docx_advanced.js --action from-json --input content.json --output doc.docx
  node docx_advanced.js --action from-markdown --input readme.md --output readme.docx
  node docx_advanced.js --action report --title "Monthly Report" --author "John Doe" --output report.docx
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

// Create document from JSON
async function createFromJSON(config) {
  if (!config.input) {
    console.error('Error: --input parameter required for from-json action');
    process.exit(1);
  }

  const jsonData = JSON.parse(await fs.readFile(config.input, 'utf-8'));

  const sections = [];
  const children = [];

  // Process content
  for (const item of jsonData.content || []) {
    switch (item.type) {
      case 'heading':
        children.push(
          new Paragraph({
            text: item.text,
            heading: HeadingLevel[`HEADING_${item.level || 1}`],
          })
        );
        break;

      case 'paragraph':
        children.push(
          new Paragraph({
            text: item.text,
            alignment: item.align ? AlignmentType[item.align.toUpperCase()] : undefined,
          })
        );
        break;

      case 'bullet':
        children.push(
          new Paragraph({
            text: item.text,
            bullet: { level: item.level || 0 },
          })
        );
        break;

      case 'table':
        if (item.rows) {
          const tableRows = item.rows.map(
            (row) =>
              new TableRow({
                children: row.map(
                  (cell) =>
                    new TableCell({
                      children: [new Paragraph(cell)],
                    })
                ),
              })
          );

          children.push(
            new Table({
              rows: tableRows,
              width: { size: 100, type: WidthType.PERCENTAGE },
            })
          );
        }
        break;
    }
  }

  sections.push({
    properties: {},
    children,
  });

  const doc = new Document({
    creator: jsonData.author || config.params.author || 'AionUi Cowork',
    title: jsonData.title || config.params.title || 'Document',
    description: jsonData.description || '',
    sections,
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(config.output, buffer);

  console.log('\n=== Document Created ===');
  console.log(`Elements: ${jsonData.content?.length || 0}`);
  console.log(`Output: ${config.output}`);
}

// Create report document
async function createReport(config) {
  const doc = new Document({
    creator: config.params.author || 'AionUi Cowork',
    title: config.params.title || 'Report',
    description: 'Automated report document',
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                text: config.params.title || 'Report',
                alignment: AlignmentType.CENTER,
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
                  new TextRun({
                    children: [PageNumber.CURRENT],
                  }),
                  new TextRun(' of '),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Title page
          new Paragraph({
            text: config.params.title || 'Report',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { before: 4000 },
          }),

          new Paragraph({
            text: `Author: ${config.params.author || 'Unknown'}`,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200 },
          }),

          new Paragraph({
            text: `Date: ${new Date().toLocaleDateString()}`,
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 4000 },
          }),

          // Table of Contents placeholder
          new Paragraph({
            text: 'Table of Contents',
            heading: HeadingLevel.HEADING_1,
            pageBreakBefore: true,
          }),

          new Paragraph({
            text: '[Table of Contents will be generated when document is opened in Word]',
            italics: true,
            spacing: { after: 400 },
          }),

          // Executive Summary
          new Paragraph({
            text: 'Executive Summary',
            heading: HeadingLevel.HEADING_1,
            pageBreakBefore: true,
          }),

          new Paragraph({
            text: 'This section provides a high-level overview of the report findings and recommendations.',
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'Key findings:', bold: true }),
              new TextRun('\n• Finding 1\n• Finding 2\n• Finding 3'),
            ],
            spacing: { after: 400 },
          }),

          // Introduction
          new Paragraph({
            text: 'Introduction',
            heading: HeadingLevel.HEADING_1,
            pageBreakBefore: true,
          }),

          new Paragraph({
            text: 'This report provides a comprehensive analysis of...',
            spacing: { after: 400 },
          }),

          // Methodology
          new Paragraph({
            text: 'Methodology',
            heading: HeadingLevel.HEADING_1,
          }),

          new Paragraph({
            text: 'The following approach was used to conduct this analysis:',
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: 'Data Collection',
            heading: HeadingLevel.HEADING_2,
          }),

          new Paragraph({
            text: 'Data was collected from various sources...',
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: 'Analysis',
            heading: HeadingLevel.HEADING_2,
          }),

          new Paragraph({
            text: 'The analysis was performed using...',
            spacing: { after: 400 },
          }),

          // Results
          new Paragraph({
            text: 'Results',
            heading: HeadingLevel.HEADING_1,
            pageBreakBefore: true,
          }),

          new Paragraph({
            text: 'The analysis revealed the following results...',
            spacing: { after: 400 },
          }),

          // Sample table
          new Table({
            rows: [
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'Metric', bold: true })]
                      })
                    ]
                  }),
                  new TableCell({ 
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'Value', bold: true })]
                      })
                    ]
                  }),
                  new TableCell({ 
                    children: [
                      new Paragraph({ 
                        children: [new TextRun({ text: 'Change', bold: true })]
                      })
                    ]
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Revenue')] }),
                  new TableCell({ children: [new Paragraph('$1,000,000')] }),
                  new TableCell({ children: [new Paragraph('+15%')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Customers')] }),
                  new TableCell({ children: [new Paragraph('10,000')] }),
                  new TableCell({ children: [new Paragraph('+20%')] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph('Satisfaction')] }),
                  new TableCell({ children: [new Paragraph('4.5/5')] }),
                  new TableCell({ children: [new Paragraph('+0.3')] }),
                ],
              }),
            ],
            width: { size: 100, type: WidthType.PERCENTAGE },
          }),

          new Paragraph({ text: '', spacing: { after: 400 } }),

          // Conclusions
          new Paragraph({
            text: 'Conclusions',
            heading: HeadingLevel.HEADING_1,
            pageBreakBefore: true,
          }),

          new Paragraph({
            text: 'Based on the analysis, we conclude that...',
            spacing: { after: 400 },
          }),

          // Recommendations
          new Paragraph({
            text: 'Recommendations',
            heading: HeadingLevel.HEADING_1,
          }),

          new Paragraph({
            text: 'We recommend the following actions:',
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: 'Recommendation 1',
            bullet: { level: 0 },
          }),

          new Paragraph({
            text: 'Recommendation 2',
            bullet: { level: 0 },
          }),

          new Paragraph({
            text: 'Recommendation 3',
            bullet: { level: 0 },
            spacing: { after: 400 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(config.output, buffer);

  console.log('\n=== Report Document Created ===');
  console.log(`Title: ${config.params.title || 'Report'}`);
  console.log(`Author: ${config.params.author || 'Unknown'}`);
  console.log(`Output: ${config.output}`);
}

// Create business letter
async function createLetter(config) {
  const today = new Date().toLocaleDateString();

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Sender info
          new Paragraph({
            text: config.params.author || 'Sender Name',
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: 'Company Name',
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: '123 Business St.',
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: 'City, State ZIP',
            spacing: { after: 400 },
          }),

          // Date
          new Paragraph({
            text: today,
            spacing: { after: 400 },
          }),

          // Recipient
          new Paragraph({
            text: 'Recipient Name',
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: 'Company Name',
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: '456 Client Ave.',
            spacing: { after: 100 },
          }),

          new Paragraph({
            text: 'City, State ZIP',
            spacing: { after: 400 },
          }),

          // Salutation
          new Paragraph({
            text: 'Dear Recipient,',
            spacing: { after: 400 },
          }),

          // Body
          new Paragraph({
            text: 'I am writing to...',
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: 'This letter serves to...',
            spacing: { after: 200 },
          }),

          new Paragraph({
            text: 'Please feel free to contact me if you have any questions.',
            spacing: { after: 400 },
          }),

          // Closing
          new Paragraph({
            text: 'Sincerely,',
            spacing: { after: 800 },
          }),

          new Paragraph({
            text: config.params.author || 'Sender Name',
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.writeFile(config.output, buffer);

  console.log('\n=== Business Letter Created ===');
  console.log(`Output: ${config.output}`);
}

// Main function
async function main() {
  const config = parseArgs();

  try {
    switch (config.action) {
      case 'from-json':
        await createFromJSON(config);
        break;
      case 'report':
        await createReport(config);
        break;
      case 'letter':
        await createLetter(config);
        break;
      default:
        console.error(`Unknown action: ${config.action}`);
        console.log('Use --help for usage information');
        process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();
