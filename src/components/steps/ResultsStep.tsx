import React, { useEffect, useState } from 'react';
import { ImageData, AssessmentResult } from '../../types';
import { generateMockResult } from '../../mockData';
import VehicleMetadata from '../results/VehicleMetadata';
import DamageAssessment from '../results/DamageAssessment';
import RepairCosts from '../results/RepairCosts';
import HistoricalComparison from '../results/HistoricalComparison';
import { ArrowLeft, Download, Share2 } from 'lucide-react';

interface ResultsStepProps {
  imageData: ImageData;
  onReset: () => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ imageData, onReset }) => {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  
  useEffect(() => {
    // Generate mock result for the demo
    const mockResult = generateMockResult();
    // Override the image URL with the uploaded image
    mockResult.imageUrl = imageData.url;
    setResult(mockResult);
  }, [imageData]);
  
  if (!result) {
    return <div className="p-6 text-center">Loading results...</div>;
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Assessment Results</h2>
        <p className="mt-2 text-gray-600">
          Our AI has analyzed your vehicle damage
        </p>
      </div>

      <div className="mb-8 flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2">
          <div className="relative overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <img 
              src={imageData.url} 
              alt="Vehicle damage" 
              className="w-full h-auto object-contain bg-gray-50"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center text-white">
                <span className="text-sm font-medium mr-2">Claim ID:</span>
                <span className="text-sm">{result.id}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="lg:w-1/2">
          <VehicleMetadata vehicle={result.vehicle} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DamageAssessment damage={result.damage} imageUrl={imageData.url} />
        <RepairCosts repairCost={result.repairCost} />
      </div>

      <div className="mb-8">
        <HistoricalComparison 
          historicalComparison={result.historicalComparison} 
          totalCost={result.repairCost.total}
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          New Assessment
        </button>
        
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 sm:flex-none justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 sm:flex-none justify-center"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep;