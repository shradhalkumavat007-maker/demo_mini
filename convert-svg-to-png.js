const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

const diagramsDir = path.join(__dirname, 'diagrams');

const files = [
  '01_system_architecture.svg',
  '02_use_case_diagram.svg',
  '03_class_diagram.svg',
  '04_sequence_diagram.svg',
  '05_activity_diagram.svg',
  '06_state_machine_diagram.svg',
  '07_component_diagram.svg',
  '08_deployment_diagram.svg',
  '09_entity_relationship_diagram.svg',
  '10_object_diagram.svg'
];

console.log('Rendering high-resolution PNG images (2400px width, crisp white background)...');

files.forEach(file => {
  const svgPath = path.join(diagramsDir, file);
  const pngName = file.replace('.svg', '.png');
  const pngPath = path.join(diagramsDir, pngName);

  if (fs.existsSync(svgPath)) {
    const svgContent = fs.readFileSync(svgPath, 'utf8');
    const opts = {
      background: '#FFFFFF',
      fitTo: {
        mode: 'width',
        value: 2400 // High-resolution 2400px width for crystal clear print & college report
      }
    };
    try {
      const resvg = new Resvg(svgContent, opts);
      const pngData = resvg.render();
      fs.writeFileSync(pngPath, pngData.asPng());
      console.log(`✓ Rendered ${pngName} (${pngData.width}x${pngData.height} px, ${(pngData.asPng().length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`Error rendering ${file}:`, err);
    }
  } else {
    console.warn(`File not found: ${svgPath}`);
  }
});

console.log('\nAll professional PNG diagrams generated successfully in diagrams/ folder!');
