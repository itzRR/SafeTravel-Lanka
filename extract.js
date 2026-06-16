const fs = require('fs');
const content = fs.readFileSync('src/components/map/SriLankaSvgMap.tsx', 'utf8');

const start = content.indexOf('<svg');
const end = content.lastIndexOf('</svg>') + 6;
let svgContent = content.substring(start, end);

// Replace class names and add dynamic fill color based on district
svgContent = svgContent.replace(
  /className=\{`district-shape \$\{activeId === '([^']+)' \? 'active' : ''\}`\}/g,
  'className={`district-shape transition-all duration-300 ${activeId === \'$1\' ? \'drop-shadow-xl stroke-[3px] stroke-primary z-10 relative\' : \'\'}`} style={{ fill: getDistrictColor(\'$1\'), cursor: \'pointer\', stroke: \'#ffffff30\', strokeWidth: 1 }}'
);

// Replace click handlers
svgContent = svgContent.replace(
  /onClick=\{\(\) => handleDistrictClick\('([^']+)'\)\}/g,
  'onClick={() => onDistrictClick(\'$1\')}'
);

// Remove mouse enter/move/leave completely
svgContent = svgContent.replace(/onMouseEnter=\{[^\}]+\}/g, '');
svgContent = svgContent.replace(/onMouseMove=\{[a-zA-Z]+\}/g, '');
svgContent = svgContent.replace(/onMouseLeave=\{[a-zA-Z]+\}/g, '');

const componentCode = `import React from 'react';

interface SriLankaPathsProps {
  activeId: string | null;
  onDistrictClick: (id: string) => void;
  getDistrictColor: (id: string) => string;
}

export function SriLankaPaths({ activeId, onDistrictClick, getDistrictColor }: SriLankaPathsProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      \${svgContent}
    </div>
  );
}
`;

fs.writeFileSync('src/components/map/SriLankaPaths.tsx', componentCode);
console.log('Successfully extracted SVG component');
