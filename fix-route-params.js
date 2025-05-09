const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, 'src', 'app', 'api');

// Function to update route files
function updateRouteFiles(dir) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      updateRouteFiles(fullPath);
    } else if (entry.name === 'route.ts' || entry.name.endsWith('route.ts.bak')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('props: { params: { id: string } }')) {
        content = content.replace(/props: { params: { id: string } }/g, '{ params }: { params: { id: string } }');
        content = content.replace(/props.params.id/g, 'params.id');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  });
}

// Start the update process
updateRouteFiles(apiDir);
console.log('Finished updating route files.');
