import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentResult, ImageData, DamageArea } from '../../types';
import { generateMockResult } from '../../mockData';
import VehicleMetadata from '../results/VehicleMetadata';
import DamageAssessment from '../results/DamageAssessment';
import RepairCosts from '../results/RepairCosts';
import HistoricalComparison from '../results/HistoricalComparison';
import { ArrowLeft, Download, Share2, CheckCircle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useClaims } from '../../context/ClaimsContext';

interface ResultsStepProps {
  imageData: ImageData;
  aiResults?: {
    vision?: any;
    claude?: any;
  };
  onReset: () => void;
}

const ResultsStep: React.FC<ResultsStepProps> = ({ imageData, aiResults, onReset }) => {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const { activeAiProvider } = useSettingsStore();
  const { addClaim } = useClaims();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Generate base result
    const baseResult = generateMockResult();
    baseResult.imageUrl = imageData.url;

    // If we have AI results, merge them into the result
    if (aiResults) {
      if (activeAiProvider === 'vision' && aiResults.vision) {
        mergeVisionResults(baseResult, aiResults.vision);
      } else if (activeAiProvider === 'claude' && aiResults.claude) {
        mergeClaudeResults(baseResult, aiResults.claude);
      } else if (activeAiProvider === 'both' && aiResults.vision && aiResults.claude) {
        // Merge both results, giving preference to Claude's analysis
        mergeVisionResults(baseResult, aiResults.vision);
        mergeClaudeResults(baseResult, aiResults.claude);
      }
    }

    setResult(baseResult);
  }, [imageData, aiResults, activeAiProvider]);

  const mergeVisionResults = (baseResult: AssessmentResult, visionResults: any) => {
    if (visionResults.vehicleData) {
      baseResult.vehicle = {
        ...baseResult.vehicle,
        ...visionResults.vehicleData,
      };
    }

    if (visionResults.damageAssessment) {
      baseResult.damage = {
        ...baseResult.damage,
        ...visionResults.damageAssessment,
      };
    }
  };

  const mergeClaudeResults = (baseResult: AssessmentResult, claudeResults: any) => {
    if (claudeResults.vehicle) {
      baseResult.vehicle = {
        ...baseResult.vehicle,
        make: claudeResults.vehicle.make || baseResult.vehicle.make,
        model: claudeResults.vehicle.model || baseResult.vehicle.model,
        confidence: Math.round(claudeResults.vehicle.confidence * 100) || baseResult.vehicle.confidence,
      };
    }

    if (claudeResults.damage) {
      // Ensure coordinates are properly formatted
      const affectedAreas: DamageArea[] = claudeResults.damage.affectedAreas.map((area: any) => ({
        name: area.name,
        confidence: Math.round(area.confidence * 100),
        coordinates: {
          x: Math.min(Math.max(area.coordinates?.x ?? 0, 0), 100),
          y: Math.min(Math.max(area.coordinates?.y ?? 0, 0), 100),
          width: Math.min(Math.max(area.coordinates?.width ?? 20, 0), 100 - (area.coordinates?.x ?? 0)),
          height: Math.min(Math.max(area.coordinates?.height ?? 20, 0), 100 - (area.coordinates?.y ?? 0))
        }
      }));

      baseResult.damage = {
        description: claudeResults.damage.description || baseResult.damage.description,
        severity: claudeResults.damage.severity || baseResult.damage.severity,
        confidence: Math.round(claudeResults.damage.confidence * 100) || baseResult.damage.confidence,
        affectedAreas
      };
    }

    if (claudeResults.repairCost?.estimate) {
      const estimatedCost = claudeResults.repairCost.estimate;
      baseResult.repairCost.total = estimatedCost;
      
      // Distribute the cost across categories
      baseResult.repairCost.breakdown = baseResult.repairCost.breakdown.map((item, index) => {
        const percentages = [0.4, 0.35, 0.15, 0.1]; // Parts, Labor, Paint, Misc
        return {
          ...item,
          cost: Math.round(estimatedCost * percentages[index])
        };
      });

      // Update historical comparison
      baseResult.historicalComparison.averageCost = Math.round(estimatedCost * 0.9);
    }
  };

  const handleDone = () => {
    if (result) {
      // Add the claim to the context
      addClaim(result);
      // Navigate to the claim details page
      navigate(`/claims/${result.id}`);
    }
  };
  
  if (!result) {
    return <div className="p-6 text-center">Loading results...</div>;
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Assessment Results</h2>
        <p className="mt-2 text-gray-600">
          AI analysis complete
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
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex-1 sm:flex-none justify-center"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Report
          </button>
          <button
            type="button"
            onClick={handleDone}
            className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex-1 sm:flex-none justify-center"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsStep;