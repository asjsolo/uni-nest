const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.jsx') || file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

const dirPath = path.join(__dirname, 'src', 'pages', 'SmartBorrowing');
const allFiles = walk(dirPath);

// Include components if standalone
const componentsPath = path.join(__dirname, 'src', 'components');
if (fs.existsSync(componentsPath)) {
    allFiles.push(...walk(componentsPath));
}

let changedCount = 0;

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Green modern theme adjustments
    content = content.replace(/blue-/g, 'emerald-');
    content = content.replace(/indigo-/g, 'teal-');
    content = content.replace(/cyan-/g, 'green-');
    content = content.replace(/slate-/g, 'gray-');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
    }
});

console.log(`Updated ${changedCount} files with the new green theme.`);
