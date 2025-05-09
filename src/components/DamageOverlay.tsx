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
        // Calculate relative position and size
        const x = Math.min(Math.max(area.coordinates.x, 0), 100);
        const y = Math.min(Math.max(area.coordinates.y, 0), 100);
        const width = Math.min(area.coordinates.width, 100 - x);
        const height = Math.min(area.coordinates.height, 100 - y);

        const style = {
          left: `${x}%`,
          top: `${y}%`,
          width: `${width}%`,
          height: `${height}%`,
        };

        const confidenceColor = area.confidence >= 85 
          ? 'border-green-500 bg-green-500/20'
          : area.confidence >= 70
            ? 'border-yellow-500 bg-yellow-500/20'
            : 'border-red-500 bg-red-500/20';

        const labelColor = area.confidence >= 85
          ? 'bg-green-500'
          : area.confidence >= 70
            ? 'bg-yellow-500'
            : 'bg-red-500';

        return (
          <div
            key={index}
            className={`absolute border-2 ${confidenceColor} rounded-md transition-all duration-200`}
            style={style}
          >
            <div className={`absolute -top-6 left-0 ${labelColor} text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10`}>
              {area.name} ({area.confidence}%)
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DamageOverlay;