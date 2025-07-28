#!/usr/bin/env node

import { LinkedInDataImporter } from './import-data.js';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const importer = new LinkedInDataImporter();
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  try {
    switch (command) {
      case 'linkedin-export':
        await handleLinkedInExport(importer, args[1]);
        break;
        
      case 'json':
        await handleJSONImport(importer, args[1]);
        break;
        
      case 'template':
        await handleCreateTemplate(importer, args[1]);
        break;
        
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  } finally {
    await importer.close();
  }
}

async function handleLinkedInExport(importer: LinkedInDataImporter, exportPath?: string) {
  if (!exportPath) {
    console.error('❌ Please provide the path to your LinkedIn export folder');
    console.log('Usage: npm run import linkedin-export /path/to/linkedin/export');
    process.exit(1);
  }

  if (!fs.existsSync(exportPath)) {
    console.error(`❌ Export folder not found: ${exportPath}`);
    console.log('Make sure you downloaded and extracted your LinkedIn data export');
    process.exit(1);
  }

  console.log(`📦 Importing from LinkedIn export: ${exportPath}`);
  await importer.importFromLinkedInExport(exportPath);
  console.log('🎉 LinkedIn export imported successfully!');
}

async function handleJSONImport(importer: LinkedInDataImporter, jsonPath?: string) {
  const defaultPath = path.join(__dirname, '../data/my-data.json');
  const filePath = jsonPath || defaultPath;

  if (!fs.existsSync(filePath)) {
    console.error(`❌ JSON file not found: ${filePath}`);
    console.log('Create a JSON file with your data or use the template:');
    console.log('npm run import template');
    process.exit(1);
  }

  console.log(`📝 Importing from JSON: ${filePath}`);
  await importer.importFromManualJSON(filePath);
  console.log('🎉 JSON data imported successfully!');
}

async function handleCreateTemplate(importer: LinkedInDataImporter, outputPath?: string) {
  const defaultPath = path.join(__dirname, '../data/template.json');
  const filePath = outputPath || defaultPath;
  
  // Ensure data directory exists
  await fs.ensureDir(path.dirname(filePath));
  
  console.log(`📝 Creating template: ${filePath}`);
  await importer.createManualTemplate(filePath);
  console.log(`✅ Template created at: ${filePath}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Edit the template file with your data');
  console.log('2. Save it as my-data.json');
  console.log('3. Run: npm run import json');
}

function showHelp() {
  console.log('LinkedIn Data Importer');
  console.log('');
  console.log('Usage:');
  console.log('  npm run import <command> [options]');
  console.log('');
  console.log('Commands:');
  console.log('  template [output]        Create a template JSON file to fill manually');
  console.log('  json [file]             Import from JSON file (default: ./data/my-data.json)');
  console.log('  linkedin-export <path>  Import from official LinkedIn data export');
  console.log('');
  console.log('Examples:');
  console.log('  npm run import template');
  console.log('  npm run import json ./my-linkedin-data.json');
  console.log('  npm run import linkedin-export ./Downloads/linkedin-export/');
  console.log('');
  console.log('Data sources:');
  console.log('  1. Official LinkedIn export (Settings → Get a copy of your data)');
  console.log('  2. Manual JSON (create from template)');
  console.log('  3. Browser script (run linkedin-extractor.js in console)');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Import interrupted by user');
  process.exit(0);
});

// Run the import
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});