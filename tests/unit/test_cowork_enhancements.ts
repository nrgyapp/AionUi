/**
 * Tests for Chrome automation and Office document enhancement features
 */

import { describe, it, expect } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';

describe('Chrome Automation Skill', () => {
  const chromeSkillPath = path.join(__dirname, '../../skills/chrome');
  
  it('should have chrome skill directory', () => {
    expect(fs.existsSync(chromeSkillPath)).toBe(true);
  });

  it('should have README documentation', () => {
    const readmePath = path.join(chromeSkillPath, 'README.md');
    expect(fs.existsSync(readmePath)).toBe(true);
  });

  it('should have config.json', () => {
    const configPath = path.join(chromeSkillPath, 'config.json');
    expect(fs.existsSync(configPath)).toBe(true);
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    expect(config).toHaveProperty('headless');
    expect(config).toHaveProperty('timeout');
    expect(config).toHaveProperty('monitoring');
  });

  it('should have monitoring script', () => {
    const monitorPath = path.join(chromeSkillPath, 'scripts/monitor_dashboard.js');
    expect(fs.existsSync(monitorPath)).toBe(true);
  });

  it('should have GTM check script', () => {
    const gtmPath = path.join(chromeSkillPath, 'scripts/check_gtm.js');
    expect(fs.existsSync(gtmPath)).toBe(true);
  });

  it('should have data extraction script', () => {
    const extractPath = path.join(chromeSkillPath, 'scripts/extract_data.js');
    expect(fs.existsSync(extractPath)).toBe(true);
  });
});

describe('Advanced Office Document Skills', () => {
  describe('Excel Advanced Features', () => {
    const excelScriptPath = path.join(__dirname, '../../skills/xlsx/excel_advanced.js');
    
    it('should have advanced Excel script', () => {
      expect(fs.existsSync(excelScriptPath)).toBe(true);
    });

    it('should contain analyze action', () => {
      const content = fs.readFileSync(excelScriptPath, 'utf-8');
      expect(content).toContain('analyze');
      expect(content).toContain('analyzeData');
    });

    it('should contain autofilter action', () => {
      const content = fs.readFileSync(excelScriptPath, 'utf-8');
      expect(content).toContain('autofilter');
      expect(content).toContain('addAutofilter');
    });

    it('should contain compare action', () => {
      const content = fs.readFileSync(excelScriptPath, 'utf-8');
      expect(content).toContain('compare');
      expect(content).toContain('compareFiles');
    });
  });

  describe('PowerPoint Advanced Features', () => {
    const pptxScriptPath = path.join(__dirname, '../../skills/pptx/scripts/pptx_advanced.js');
    const examplesPath = path.join(__dirname, '../../skills/pptx/examples/sample_presentation.json');
    
    it('should have advanced PowerPoint script', () => {
      expect(fs.existsSync(pptxScriptPath)).toBe(true);
    });

    it('should have sample presentation example', () => {
      expect(fs.existsSync(examplesPath)).toBe(true);
      
      const example = JSON.parse(fs.readFileSync(examplesPath, 'utf-8'));
      expect(example).toHaveProperty('slides');
      expect(example).toHaveProperty('theme');
      expect(Array.isArray(example.slides)).toBe(true);
    });

    it('should contain from-json action', () => {
      const content = fs.readFileSync(pptxScriptPath, 'utf-8');
      expect(content).toContain('from-json');
      expect(content).toContain('createFromJSON');
    });

    it('should contain title-slide action', () => {
      const content = fs.readFileSync(pptxScriptPath, 'utf-8');
      expect(content).toContain('title-slide');
      expect(content).toContain('createTitleSlide');
    });

    it('should contain theme support', () => {
      const content = fs.readFileSync(pptxScriptPath, 'utf-8');
      expect(content).toContain('blue');
      expect(content).toContain('green');
      expect(content).toContain('red');
      expect(content).toContain('purple');
    });
  });

  describe('Word Advanced Features', () => {
    const docxScriptPath = path.join(__dirname, '../../skills/docx/scripts/docx_advanced.js');
    const examplesPath = path.join(__dirname, '../../skills/docx/examples/sample_document.json');
    
    it('should have advanced Word script', () => {
      expect(fs.existsSync(docxScriptPath)).toBe(true);
    });

    it('should have sample document example', () => {
      expect(fs.existsSync(examplesPath)).toBe(true);
      
      const example = JSON.parse(fs.readFileSync(examplesPath, 'utf-8'));
      expect(example).toHaveProperty('content');
      expect(example).toHaveProperty('title');
      expect(Array.isArray(example.content)).toBe(true);
    });

    it('should contain from-json action', () => {
      const content = fs.readFileSync(docxScriptPath, 'utf-8');
      expect(content).toContain('from-json');
      expect(content).toContain('createFromJSON');
    });

    it('should contain report action', () => {
      const content = fs.readFileSync(docxScriptPath, 'utf-8');
      expect(content).toContain('report');
      expect(content).toContain('createReport');
    });

    it('should contain letter action', () => {
      const content = fs.readFileSync(docxScriptPath, 'utf-8');
      expect(content).toContain('letter');
      expect(content).toContain('createLetter');
    });
  });
});

describe('Cowork Skills Documentation', () => {
  const skillsPath = path.join(__dirname, '../../assistant/cowork/cowork-skills.md');
  
  it('should have updated skills documentation', () => {
    expect(fs.existsSync(skillsPath)).toBe(true);
  });

  it('should include chrome skill', () => {
    const content = fs.readFileSync(skillsPath, 'utf-8');
    expect(content).toContain('id: chrome');
    expect(content).toContain('Chrome Browser Automation');
    expect(content).toContain('monitor_dashboard.js');
    expect(content).toContain('check_gtm.js');
  });

  it('should include advanced Excel automation', () => {
    const content = fs.readFileSync(skillsPath, 'utf-8');
    expect(content).toContain('excel_advanced.js');
    expect(content).toContain('analyze');
    expect(content).toContain('autofilter');
  });

  it('should include advanced PowerPoint generation', () => {
    const content = fs.readFileSync(skillsPath, 'utf-8');
    expect(content).toContain('pptx_advanced.js');
    expect(content).toContain('from-json');
    expect(content).toContain('sample_presentation.json');
  });

  it('should include advanced Word document generation', () => {
    const content = fs.readFileSync(skillsPath, 'utf-8');
    expect(content).toContain('docx_advanced.js');
    expect(content).toContain('report');
    expect(content).toContain('sample_document.json');
  });
});

describe('Package Dependencies', () => {
  const packageJsonPath = path.join(__dirname, '../../package.json');
  
  it('should have playwright dependency', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.dependencies).toHaveProperty('playwright');
  });

  it('should have existing office document dependencies', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.dependencies).toHaveProperty('docx');
    expect(packageJson.dependencies).toHaveProperty('mammoth');
  });
});
