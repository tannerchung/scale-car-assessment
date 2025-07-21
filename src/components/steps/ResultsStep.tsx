import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AssessmentResult, ImageData, DamageArea } from '../../types';
import { generateMockResult } from '../../mockData';
import VehicleMetadata from '../results/VehicleMetadata';
import DamageAssessment from '../results/DamageAssessment';
import RepairCosts from '../results/RepairCosts';
import HistoricalComparison from '../results/HistoricalComparison';
import { ArrowLeft, Download, Share2, CheckCircle, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { useClaims } from '../../context/ClaimsContext';
import { claimsEvaluator, EvaluationResult } from '../../services/evaluationService';
import { performanceMonitor } from '../../services/langsmithService';

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
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
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
    
    // Run evaluation if possible
    runEvaluation(baseResult);
  }, [imageData, aiResults, activeAiProvider]);

  const runEvaluation = async (assessmentResult: AssessmentResult) => {
    try {
      // Check if we have sample test cases for evaluation
      const testCases = claimsEvaluator.getTestCases();
      if (testCases.length === 0) {
        // Generate sample test cases if none exist
        claimsEvaluator.addTestCases(claimsEvaluator.generateSampleTestCases());
      }

      // For demo purposes, evaluate against the first test case
      const testCase = testCases[0];
      if (testCase) {
        const evaluationResult = await claimsEvaluator.evaluateAssessment(
          assessmentResult,
          testCase.groundTruth,
          `result_${assessmentResult.id}`
        );
        setEvaluation(evaluationResult);
      }
    } catch (error) {
      console.warn('Evaluation failed:', error);
    }
  };

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

      {/* Evaluation Metrics Section */}
      {evaluation && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-medium text-gray-900">AI Evaluation Metrics</h3>
                </div>
                <button
                  onClick={() => setShowEvaluation(!showEvaluation)}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  {showEvaluation ? 'Hide Details' : 'Show Details'}
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">
                      {evaluation.accuracy.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Overall Accuracy</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-600">
                      {(evaluation.precision * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Precision</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    <span className="text-2xl font-bold text-purple-600">
                      {(evaluation.recall * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Recall</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <CheckCircle className="h-4 w-4 text-orange-600" />
                    <span className="text-2xl font-bold text-orange-600">
                      {(evaluation.f1Score * 100).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">F1 Score</p>
                </div>
              </div>

              {/* Detailed Metrics */}
              {showEvaluation && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Detailed Performance Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-3">Component Accuracy</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Vehicle ID</span>
                          <span className="text-sm font-medium">{evaluation.details.vehicleIdentificationAccuracy.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Damage Detection</span>
                          <span className="text-sm font-medium">{evaluation.details.damageDetectionAccuracy.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cost Estimation</span>
                          <span className="text-sm font-medium">{evaluation.details.costEstimationAccuracy.toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Coordinate Accuracy</span>
                          <span className="text-sm font-medium">{evaluation.details.coordinateAccuracy.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-medium text-gray-700 mb-3">Detection Matrix</h5>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">True Positives</span>
                          <span className="text-sm font-medium text-green-600">{evaluation.details.truePositives}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">False Positives</span>
                          <span className="text-sm font-medium text-red-600">{evaluation.details.falsePositives}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">False Negatives</span>
                          <span className="text-sm font-medium text-yellow-600">{evaluation.details.falseNegatives}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Model Confidence</span>
                          <span className="text-sm font-medium">{evaluation.confidence.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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