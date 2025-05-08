import React from 'react';
import { DamageArea } from '../types';

interface DamageOverlayProps {
  areas: DamageArea[];
  containerWidth: number;
  containerHeight: number;
}

const DamageOverlay: React.FC<DamageOverlayProps> = ({ areas, containerWidth, containerHeight }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {areas.map((area, index) => {
        const style = {
          left: `${area.coordinates.x}%`,
          top: `${area.coordinates.y}%`,
          width: `${area.coordinates.width}%`,
          height: `${area.coordinates.height}%`,
        };

        return (
          <div
            key={index}
            className="absolute border-2 border-red-500 bg-red-500/20 rounded-md"
            style={style}
          >
            <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {area.name} ({area.confidence}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DamageOverlay;