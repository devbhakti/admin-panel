const fs = require('fs');
const glob = require('glob');
const utilsImport = "import { parseLocalizedValue } from '@/utils/textUtils';\n";

const files = glob.sync('src/**/*.tsx', { cwd: process.cwd() });
let updatedCounts = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let hasChanges = false;
  
  if (content.includes('{pooja.name}')) {
    content = content.replace(/\{pooja\.name\}/g, '{parseLocalizedValue(pooja.name)}');
    hasChanges = true;
  }
  if (content.match(/alt=\{pooja\.name\}/g)) {
    content = content.replace(/alt=\{pooja\.name\}/g, 'alt={parseLocalizedValue(pooja.name)}');
    hasChanges = true;
  }
  if (content.match(/value=\{pooja\.name\}/g)) {
    content = content.replace(/value=\{pooja\.name\}/g, 'value={parseLocalizedValue(pooja.name)}');
    hasChanges = true;
  }
  
  if (hasChanges) {
    if (!content.includes('import { parseLocalizedValue }') && !content.includes('import {parseLocalizedValue}')) {
        let lines = content.split('\n');
        // find last import
        let lastImport = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith('import ')) {
                lastImport = i;
            }
        }
        if (lastImport !== -1) {
            lines.splice(lastImport + 1, 0, utilsImport.trim());
        } else {
            lines.unshift(utilsImport.trim());
        }
        content = lines.join('\n');
    }
    fs.writeFileSync(file, content, 'utf8');
    updatedCounts++;
    console.log('Fixed', file);
  }
}
console.log('Total fixed:', updatedCounts);
