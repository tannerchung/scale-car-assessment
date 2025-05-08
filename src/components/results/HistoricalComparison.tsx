import React from 'react';
import { HistoricalComparison as HistoricalComparisonType } from '../../types';
import { BarChart3 } from 'lucide-react';

interface HistoricalComparisonProps {
  historicalComparison: HistoricalComparisonType;
  totalCost: number;
}

const HistoricalComparison: React.FC<HistoricalComparisonProps> = ({ 
  historicalComparison, 
  totalCost 
}) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Determine if current cost is higher or lower than average
  const costDifference = totalCost - historicalComparison.averageCost;
  const costDifferencePercent = Math.round((costDifference / historicalComparison.averageCost) * 100);
  
  // Determine color based on cost comparison
  const comparisonColor = costDifference > 0 
    ? 'text-red-600' 
    : costDifference < 0 
      ? 'text-green-600' 
      : 'text-gray-600';
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 text-white">
        <div className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          <h3 className="text-lg font-medium">Historical Comparison</h3>
        </div>
      </div>
      
      <div className="bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Average Cost</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(historicalComparison.averageCost)}</p>
            <p className="text-sm text-gray-500">for similar claims</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Cost Difference</p>
            <p className={`text-xl font-bold ${comparisonColor}`}>
              {costDifference > 0 ? '+' : ''}{formatCurrency(costDifference)} ({costDifferencePercent}%)
            </p>
            <p className="text-sm text-gray-500">compared to average</p>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Percentile Rank</p>
            <p className="text-xl font-bold text-gray-900">{historicalComparison.percentileRank}%</p>
            <p className="text-sm text-gray-500">out of {historicalComparison.similarClaims} similar claims</p>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
            <div className="relative w-full h-full">
              {/* Percentile scale */}
              {[0, 25, 50, 75, 100].map((percentile) => (
                <div 
                  key={percentile}
                  className="absolute top-0 h-full border-l border-gray-300"
                  style={{ left: `${percentile}%` }}
                >
                  <span className="absolute top-full text-xs text-gray-500 mt-1 transform -translate-x-1/2">
                    {percentile}%
                  </span>
                </div>
              ))}
              
              {/* Current percentile marker */}
              <div 
                className="absolute top-0 h-full w-2 bg-purple-500"
                style={{ left: `${historicalComparison.percentileRank}%`, marginLeft: '-4px' }}
              />
              
              {/* Gradient background */}
              <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 opacity-40" />
            </div>
          </div>
          
          <p className="mt-4 text-sm text-gray-600 text-center">
            Based on analysis of {historicalComparison.similarClaims} similar vehicle damage claims processed in the last 12 months.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoricalComparison;