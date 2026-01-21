#!/usr/bin/env node

/**
 * Advanced PowerPoint Automation Script
 * Generate presentations with charts, images, and advanced layouts
 */

const pptxgen = require('pptxgenjs');
const fs = require('fs').promises;
const path = require('path');

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    action: null,
    input: null,
    output: 'presentation.pptx',
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
      case '--subtitle':
        config.params.subtitle = args[++i];
        break;
      case '--theme':
        config.params.theme = args[++i];
        break;
      case '--author':
        config.params.author = args[++i];
        break;
      case '--help':
        console.log(`
Advanced PowerPoint Automation

Usage: node pptx_advanced.js --action <action> [options]

Actions:
  from-json        Create presentation from JSON configuration
  from-data        Create data-driven presentation with charts
  title-slide      Create title slide
  agenda           Create agenda slide
  bullet-slide     Create bullet point slide
  chart-slide      Create slide with chart
  image-slide      Create slide with image
  comparison       Create comparison slide (two columns)

Options:
  --input <file>       Input JSON file with configuration
  --output <file>      Output PowerPoint file (default: presentation.pptx)
  --title <text>       Slide title
  --subtitle <text>    Subtitle text
  --theme <name>       Color theme: blue, green, red, purple
  --author <name>      Presentation author
  --help               Show this help

Examples:
  node pptx_advanced.js --action from-json --input slides.json --output output.pptx
  node pptx_advanced.js --action title-slide --title "My Presentation" --subtitle "Subtitle" --output title.pptx
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

// Color themes
const themes = {
  blue: {
    primary: '4472C4',
    secondary: '5B9BD5',
    accent: '70AD47',
    background: 'FFFFFF',
    text: '363636',
  },
  green: {
    primary: '70AD47',
    secondary: '9DC3E6',
    accent: 'FFC000',
    background: 'FFFFFF',
    text: '363636',
  },
  red: {
    primary: 'C5504B',
    secondary: 'ED7D31',
    accent: '4472C4',
    background: 'FFFFFF',
    text: '363636',
  },
  purple: {
    primary: '7030A0',
    secondary: 'BF8FCC',
    accent: '4472C4',
    background: 'FFFFFF',
    text: '363636',
  },
};

// Create presentation from JSON
async function createFromJSON(config) {
  if (!config.input) {
    console.error('Error: --input parameter required for from-json action');
    process.exit(1);
  }

  const jsonData = JSON.parse(await fs.readFile(config.input, 'utf-8'));
  const pptx = new pptxgen();

  // Set presentation properties
  if (jsonData.author) pptx.author = jsonData.author;
  if (jsonData.title) pptx.title = jsonData.title;
  if (jsonData.subject) pptx.subject = jsonData.subject;
  if (jsonData.company) pptx.company = jsonData.company;

  const theme = themes[jsonData.theme || 'blue'];

  // Process each slide
  for (const slideConfig of jsonData.slides || []) {
    const slide = pptx.addSlide();

    // Add background
    if (slideConfig.background) {
      slide.background = { color: slideConfig.background };
    }

    // Add elements
    for (const element of slideConfig.elements || []) {
      switch (element.type) {
        case 'text':
          slide.addText(element.text, {
            x: element.x || 0.5,
            y: element.y || 0.5,
            w: element.w || '90%',
            h: element.h || 1,
            fontSize: element.fontSize || 18,
            color: element.color || theme.text,
            bold: element.bold || false,
            align: element.align || 'left',
          });
          break;

        case 'title':
          slide.addText(element.text, {
            x: 0.5,
            y: 0.5,
            w: '90%',
            fontSize: element.fontSize || 44,
            color: theme.primary,
            bold: true,
            align: 'center',
          });
          break;

        case 'bullet':
          slide.addText(element.items, {
            x: element.x || 0.5,
            y: element.y || 1.5,
            w: element.w || '90%',
            fontSize: element.fontSize || 18,
            bullet: true,
          });
          break;

        case 'image':
          if (element.path) {
            slide.addImage({
              path: element.path,
              x: element.x || 0.5,
              y: element.y || 1.5,
              w: element.w || 4,
              h: element.h || 3,
            });
          }
          break;

        case 'chart':
          if (element.data) {
            slide.addChart(pptx.ChartType[element.chartType] || pptx.ChartType.bar, element.data, {
              x: element.x || 0.5,
              y: element.y || 1.5,
              w: element.w || 6,
              h: element.h || 4,
              title: element.title,
              showTitle: !!element.title,
            });
          }
          break;

        case 'table':
          if (element.rows) {
            slide.addTable(element.rows, {
              x: element.x || 0.5,
              y: element.y || 1.5,
              w: element.w || '90%',
              h: element.h || 3,
              border: { pt: 1, color: 'CFCFCF' },
            });
          }
          break;
      }
    }
  }

  await pptx.writeFile({ fileName: config.output });

  console.log('\n=== Presentation Created ===');
  console.log(`Slides: ${jsonData.slides?.length || 0}`);
  console.log(`Output: ${config.output}`);
}

// Create title slide
async function createTitleSlide(config) {
  const pptx = new pptxgen();
  const theme = themes[config.params.theme || 'blue'];

  pptx.author = config.params.author || 'AionUi Cowork';
  pptx.title = config.params.title || 'Presentation';

  const slide = pptx.addSlide();
  slide.background = { color: 'FFFFFF' };

  // Title
  slide.addText(config.params.title || 'Presentation Title', {
    x: 0.5,
    y: 2.5,
    w: '90%',
    fontSize: 44,
    bold: true,
    color: theme.primary,
    align: 'center',
  });

  // Subtitle
  if (config.params.subtitle) {
    slide.addText(config.params.subtitle, {
      x: 0.5,
      y: 3.5,
      w: '90%',
      fontSize: 24,
      color: theme.secondary,
      align: 'center',
    });
  }

  // Date and author at bottom
  const date = new Date().toLocaleDateString();
  slide.addText(`${config.params.author || 'Author'} | ${date}`, {
    x: 0.5,
    y: 6.5,
    w: '90%',
    fontSize: 12,
    color: '666666',
    align: 'center',
  });

  await pptx.writeFile({ fileName: config.output });

  console.log('\n=== Title Slide Created ===');
  console.log(`Title: ${config.params.title || 'Presentation Title'}`);
  console.log(`Output: ${config.output}`);
}

// Create agenda slide
async function createAgendaSlide(config) {
  const pptx = new pptxgen();
  const theme = themes[config.params.theme || 'blue'];

  const slide = pptx.addSlide();

  // Title
  slide.addText('Agenda', {
    x: 0.5,
    y: 0.5,
    w: '90%',
    fontSize: 36,
    bold: true,
    color: theme.primary,
  });

  // Sample agenda items
  const agendaItems = [
    { text: 'Introduction', options: { bullet: { code: '2022' } } },
    { text: 'Current Situation', options: { bullet: { code: '2022' } } },
    { text: 'Proposed Solution', options: { bullet: { code: '2022' } } },
    { text: 'Implementation Plan', options: { bullet: { code: '2022' } } },
    { text: 'Q&A', options: { bullet: { code: '2022' } } },
  ];

  slide.addText(agendaItems, {
    x: 1,
    y: 1.5,
    w: '80%',
    fontSize: 24,
    color: theme.text,
  });

  await pptx.writeFile({ fileName: config.output });

  console.log('\n=== Agenda Slide Created ===');
  console.log(`Output: ${config.output}`);
}

// Create comparison slide
async function createComparisonSlide(config) {
  const pptx = new pptxgen();
  const theme = themes[config.params.theme || 'blue'];

  const slide = pptx.addSlide();

  // Title
  slide.addText(config.params.title || 'Comparison', {
    x: 0.5,
    y: 0.5,
    w: '90%',
    fontSize: 32,
    bold: true,
    color: theme.primary,
  });

  // Left column
  slide.addText('Before', {
    x: 0.5,
    y: 1.5,
    w: 4,
    fontSize: 24,
    bold: true,
    color: theme.secondary,
    align: 'center',
  });

  slide.addText(
    [
      { text: 'Old process', options: { bullet: true } },
      { text: 'Manual work', options: { bullet: true } },
      { text: 'Time consuming', options: { bullet: true } },
    ],
    {
      x: 0.5,
      y: 2.3,
      w: 4,
      fontSize: 18,
    }
  );

  // Right column
  slide.addText('After', {
    x: 5.5,
    y: 1.5,
    w: 4,
    fontSize: 24,
    bold: true,
    color: theme.accent,
    align: 'center',
  });

  slide.addText(
    [
      { text: 'New process', options: { bullet: true } },
      { text: 'Automated', options: { bullet: true } },
      { text: 'Efficient', options: { bullet: true } },
    ],
    {
      x: 5.5,
      y: 2.3,
      w: 4,
      fontSize: 18,
    }
  );

  await pptx.writeFile({ fileName: config.output });

  console.log('\n=== Comparison Slide Created ===');
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
      case 'title-slide':
        await createTitleSlide(config);
        break;
      case 'agenda':
        await createAgendaSlide(config);
        break;
      case 'comparison':
        await createComparisonSlide(config);
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
