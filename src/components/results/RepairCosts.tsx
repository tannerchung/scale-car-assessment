import React, { useState } from 'react';
import { RepairCost } from '../../types';
import { DollarSign, ChevronDown, ChevronUp, MapPin } from 'lucide-react';

interface RepairCostsProps {
  repairCost: RepairCost;
}

const RepairCosts: React.FC<RepairCostsProps> = ({ repairCost }) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  // Calculate percentages for pie chart
  const total = repairCost.total;
  const costItems = repairCost.breakdown;
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm h-full">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-white">
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-medium">Repair Cost Estimate</h3>
        </div>
      </div>
      
      <div className="bg-white p-4 h-full flex flex-col">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-500">Total Estimated Cost</p>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(total)}</p>
        </div>

        <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">Regional Cost Factors</h4>
              <p className="text-sm text-blue-800 mt-1">
                {repairCost.region.name}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-blue-600">Labor Rate</p>
                  <p className="font-medium text-blue-900">{formatCurrency(repairCost.region.laborRate)}/hr</p>
                </div>
                <div>
                  <p className="text-blue-600">Parts Index</p>
                  <p className="font-medium text-blue-900">{(repairCost.region.partsCostIndex * 100).toFixed(0)}% of baseline</p>
                </div>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                Regional average: {formatCurrency(repairCost.region.averageCost)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mb-4 relative">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="60" fill="#f3f4f6" />
            
            {/* Generate pie chart segments */}
            {(() => {
              let startAngle = 0;
              return costItems.map((item, index) => {
                const percentage = (item.cost / total) * 100;
                const angle = (percentage / 100) * 360;
                const endAngle = startAngle + angle;
                
                // Convert angles to radians and calculate x,y coordinates
                const x1 = 80 + 60 * Math.cos((startAngle - 90) * Math.PI / 180);
                const y1 = 80 + 60 * Math.sin((startAngle - 90) * Math.PI / 180);
                const x2 = 80 + 60 * Math.cos((endAngle - 90) * Math.PI / 180);
                const y2 = 80 + 60 * Math.sin((endAngle - 90) * Math.PI / 180);
                
                // Determine which arc to draw (large or small)
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                // Create SVG path
                const pathData = [
                  `M 80 80`,
                  `L ${x1} ${y1}`,
                  `A 60 60 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  `Z`
                ].join(' ');
                
                const path = (
                  <path 
                    key={index} 
                    d={pathData} 
                    fill={item.color}
                    className="cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => toggleCategory(item.category)}
                  />
                );
                
                startAngle = endAngle;
                return path;
              });
            })()}
            
            <circle cx="80" cy="80" r="40" fill="white" />
          </svg>
        </div>
        
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-2">Cost Breakdown</p>
          <div className="space-y-2">
            {costItems.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded overflow-hidden">
                <div 
                  className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleCategory(item.category)}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 font-medium">{formatCurrency(item.cost)}</span>
                    {expandedCategory === item.category ? 
                      <ChevronUp className="h-4 w-4 text-gray-500" /> : 
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    }
                  </div>
                </div>
                {expandedCategory === item.category && (
                  <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                    {item.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepairCosts;