#!/usr/bin/env node

/**
 * Professional Presentation Generator
 * Creates PowerPoint presentations with advanced features
 * 
 * Usage: node create_presentation.js <config.json> <output.pptx>
 */

const PptxGenJS = require('pptxgenjs');
const fs = require('fs');

async function createPresentation(configPath, outputPath) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = config.author || 'Cowork Assistant';
    pptx.title = config.title || 'Presentation';
    pptx.subject = config.subject || '';
    pptx.company = config.company || '';
    
    // Define master slide if custom branding provided
    if (config.branding) {
      pptx.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: config.branding.backgroundColor || 'FFFFFF' },
        objects: [
          {
            text: {
              text: config.branding.footerText || '',
              options: {
                x: 0.5,
                y: 7.0,
                w: 9,
                h: 0.3,
                fontSize: 10,
                color: config.branding.footerColor || '666666',
                align: 'center'
              }
            }
          }
        ]
      });
    }
    
    // Title slide
    if (config.includeTitle !== false) {
      const titleSlide = pptx.addSlide();
      
      titleSlide.background = { color: config.titleSlide?.backgroundColor || '4472C4' };
      
      titleSlide.addText(config.title || 'Presentation Title', {
        x: 0.5,
        y: 2.5,
        w: '90%',
        h: 1.5,
        fontSize: 44,
        bold: true,
        color: config.titleSlide?.titleColor || 'FFFFFF',
        align: 'center',
        valign: 'middle'
      });
      
      if (config.subtitle) {
        titleSlide.addText(config.subtitle, {
          x: 0.5,
          y: 4.0,
          w: '90%',
          fontSize: 24,
          color: config.titleSlide?.subtitleColor || 'E0E0E0',
          align: 'center'
        });
      }
      
      if (config.author) {
        titleSlide.addText(`Presented by: ${config.author}`, {
          x: 0.5,
          y: 6.5,
          w: '90%',
          fontSize: 14,
          color: config.titleSlide?.authorColor || 'FFFFFF',
          align: 'center'
        });
      }
      
      // Add speaker notes to title slide
      if (config.titleSlide?.notes) {
        titleSlide.addNotes(config.titleSlide.notes);
      }
    }
    
    // Content slides
    if (config.slides) {
      config.slides.forEach((slideConfig, idx) => {
        const slide = pptx.addSlide();
        
        // Slide background
        if (slideConfig.backgroundColor) {
          slide.background = { color: slideConfig.backgroundColor };
        }
        
        // Slide title
        if (slideConfig.title) {
          slide.addText(slideConfig.title, {
            x: 0.5,
            y: 0.5,
            w: '90%',
            h: 0.8,
            fontSize: 32,
            bold: true,
            color: slideConfig.titleColor || '2C3E50',
            align: slideConfig.titleAlign || 'left'
          });
        }
        
        // Content
        let contentY = 1.5;
        
        // Text content
        if (slideConfig.content) {
          slide.addText(slideConfig.content, {
            x: 0.5,
            y: contentY,
            w: '90%',
            h: 4.5,
            fontSize: 18,
            color: '333333',
            align: 'left',
            valign: 'top'
          });
        }
        
        // Bullet points
        if (slideConfig.bullets) {
          const bulletText = slideConfig.bullets.map(bullet => ({
            text: bullet,
            options: { bullet: true, fontSize: 18, color: '333333' }
          }));
          
          slide.addText(bulletText, {
            x: 1.0,
            y: contentY,
            w: 8.0,
            h: 4.5
          });
        }
        
        // Two-column layout
        if (slideConfig.columns) {
          const col1 = slideConfig.columns[0];
          const col2 = slideConfig.columns[1];
          
          // Left column
          if (col1.bullets) {
            slide.addText(
              col1.bullets.map(b => ({ text: b, options: { bullet: true } })),
              { x: 0.5, y: contentY, w: 4.25, h: 4.5, fontSize: 16 }
            );
          } else if (col1.text) {
            slide.addText(col1.text, {
              x: 0.5, y: contentY, w: 4.25, h: 4.5, fontSize: 16
            });
          }
          
          // Right column
          if (col2.bullets) {
            slide.addText(
              col2.bullets.map(b => ({ text: b, options: { bullet: true } })),
              { x: 5.25, y: contentY, w: 4.25, h: 4.5, fontSize: 16 }
            );
          } else if (col2.text) {
            slide.addText(col2.text, {
              x: 5.25, y: contentY, w: 4.25, h: 4.5, fontSize: 16
            });
          }
        }
        
        // Charts
        if (slideConfig.chart) {
          const chartConfig = slideConfig.chart;
          const chartData = [];
          
          if (chartConfig.data) {
            chartData.push({
              name: chartConfig.seriesName || 'Series 1',
              labels: chartConfig.data.labels,
              values: chartConfig.data.values
            });
          }
          
          slide.addChart(chartConfig.type || pptx.ChartType.bar, chartData, {
            x: 1.0,
            y: 2.0,
            w: 8.0,
            h: 4.0,
            title: chartConfig.title,
            showTitle: !!chartConfig.title,
            showLegend: true,
            legendPos: 'r'
          });
        }
        
        // Table
        if (slideConfig.table) {
          const tableData = slideConfig.table.rows || [];
          
          slide.addTable(tableData, {
            x: 0.5,
            y: contentY,
            w: 9.0,
            colW: slideConfig.table.columnWidths || undefined,
            border: { type: 'solid', pt: 1, color: 'CFCFCF' },
            fill: { color: 'F7F7F7' },
            fontSize: 14
          });
        }
        
        // Images
        if (slideConfig.image) {
          slide.addImage({
            path: slideConfig.image.path,
            x: slideConfig.image.x || 2.0,
            y: slideConfig.image.y || 2.0,
            w: slideConfig.image.w || 5.0,
            h: slideConfig.image.h || 3.0
          });
        }
        
        // Speaker notes
        if (slideConfig.notes) {
          slide.addNotes(slideConfig.notes);
        }
        
        // Slide transition
        if (slideConfig.transition) {
          // Note: PptxGenJS has limited transition support
          // Full transition support may require additional configuration
        }
      });
    }
    
    // Save presentation
    await pptx.writeFile({ fileName: outputPath });
    console.log(`Presentation created: ${outputPath}`);
    console.log(`Total slides: ${config.slides?.length + 1 || 1}`);
    
  } catch (error) {
    console.error('Error creating presentation:', error.message);
    process.exit(1);
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node create_presentation.js <config.json> <output.pptx>');
    process.exit(1);
  }
  
  const [configPath, outputPath] = args;
  createPresentation(configPath, outputPath);
}

module.exports = { createPresentation };
