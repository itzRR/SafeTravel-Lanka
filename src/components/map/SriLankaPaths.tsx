import React from 'react';

interface SriLankaPathsProps {
  activeId: string | null;
  onDistrictClick: (id: string) => void;
  getDistrictColor: (id: string) => string;
}

export function SriLankaPaths({ activeId, onDistrictClick, getDistrictColor }: SriLankaPathsProps) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      ${svgContent}
    </div>
  );
}
