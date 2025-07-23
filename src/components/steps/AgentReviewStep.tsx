import React from 'react';
import { ImageData } from '../../types';
import { ArrowLeft, ArrowRight, Brain, Eye, Calculator, Shield, CheckCircle, Bug, AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';

interface AgentReviewStepProps {
  imageData: ImageData;
  aiResults?: {
    vision?: any;
    claude?: any;
    agentic?: any;
  };
  onContinue: () => void;
  onBack: () => void;
}

const AgentReviewStep: React.FC<AgentReviewStepProps> = ({ 
  imageData, 
  aiResults, 
  onContinue, 
  onBack 
}) => {
  const { activeAiProvider, visionApiDebug, anthropicApiDebug } = useSettingsStore();

  const renderAgentCard = (
    title: string,
    icon: React.ReactNode,
    data: any,
    color: string,
    isEnabled: boolean
  ) => {
    if (!isEnabled) return null;

    return (
      <div className={`border-2 ${color} rounded-lg p-6 bg-white shadow-sm`}>
        <div className="flex items-center mb-4">
          <div className={`p-2 rounded-lg ${color.replace('border-', 'bg-').replace('500', '100')} mr-3`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        
        {data ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </span>
            </div>
            
            {/* Vehicle Data */}
            {data.vehicleData && (
              <div>
                <span className="text-sm font-medium text-gray-700">Vehicle Identified:</span>
                <div className="mt-1 text-sm text-gray-600">
                  {data.vehicleData.year} {data.vehicleData.make} {data.vehicleData.model} ({data.vehicleData.color})
                  <span className="ml-2 text-xs text-gray-500">
                    {data.vehicleData.confidence}% confidence
                  </span>
                </div>
              </div>
            )}

            {/* Claude Vehicle Data */}
            {data.vehicle && (
              <div>
                <span className="text-sm font-medium text-gray-700">Vehicle Identified:</span>
                <div className="mt-1 text-sm text-gray-600">
                  {data.vehicle.make} {data.vehicle.model}
                  <span className="ml-2 text-xs text-gray-500">
                    {Math.round(data.vehicle.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            )}
            
            {/* Damage Assessment */}
            {data.damageAssessment && (
              <div>
                <span className="text-sm font-medium text-gray-700">Damage Found:</span>
                <div className="mt-1 text-sm text-gray-600">
                  {data.damageAssessment.affectedAreas?.length || 0} affected areas
                  <span className="ml-2 text-xs text-gray-500">
                    {data.damageAssessment.confidence}% confidence
                  </span>
                </div>
              </div>
            )}

            {/* Claude Damage Data */}
            {data.damage && (
              <div>
                <span className="text-sm font-medium text-gray-700">Damage Assessment:</span>
                <div className="mt-1 text-sm text-gray-600">
                  {data.damage.severity} severity, {data.damage.affectedAreas?.length || 0} areas
                  <span className="ml-2 text-xs text-gray-500">
                    {Math.round(data.damage.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            )}

            {/* Cost Estimation */}
            {data.repairCost && (
              <div>
                <span className="text-sm font-medium text-gray-700">Cost Estimate:</span>
                <div className="mt-1 text-sm text-gray-600">
                  ${data.repairCost.estimate?.toLocaleString() || 'N/A'}
                  <span className="ml-2 text-xs text-gray-500">
                    {Math.round(data.repairCost.confidence * 100)}% confidence
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center text-gray-500">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm">No data available</span>
          </div>
        )}
      </div>
    );
  };

  const renderAgenticSummary = () => {
    if (!aiResults?.agentic) return null;

    return (
      <div className="border-2 border-purple-500 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-purple-100 mr-3">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Agentic Processing Summary</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{aiResults.agentic.confidence}%</div>
            <div className="text-sm text-gray-600">Overall Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{aiResults.agentic.iterations}</div>
            <div className="text-sm text-gray-600">Iterations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{aiResults.agentic.agentsUsed}</div>
            <div className="text-sm text-gray-600">Agents Used</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{aiResults.agentic.processingTime}</div>
            <div className="text-sm text-gray-600">Processing Time</div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Quality Score:</span>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {aiResults.agentic.qualityScore}
            </span>
          </div>
          <p className="text-sm text-gray-600">{aiResults.agentic.reasoning}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Agent Analysis Review</h2>
        <p className="mt-2 text-gray-600">
          Review the AI agent outputs before proceeding to final results
        </p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Agentic Processing Summary (if available) */}
        {activeAiProvider === 'both' && renderAgenticSummary()}

        {/* Individual Agent Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vision API Agent */}
          {(activeAiProvider === 'vision' || activeAiProvider === 'both') && 
            renderAgentCard(
              'Vision Analysis Agent',
              <Eye className="h-6 w-6 text-blue-600" />,
              aiResults?.vision,
              'border-blue-500',
              true
            )
          }

          {/* Claude AI Agent */}
          {(activeAiProvider === 'claude' || activeAiProvider === 'both') && 
            renderAgentCard(
              'Claude AI Agent',
              <Brain className="h-6 w-6 text-purple-600" />,
              aiResults?.claude,
              'border-purple-500',
              true
            )
          }
        </div>

        {/* Debug Information */}
        {(visionApiDebug || anthropicApiDebug) && (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <div className="bg-gray-800 px-4 py-3 flex items-center">
              <Bug className="h-5 w-5 text-green-400 mr-2" />
              <h3 className="text-lg font-medium text-green-400">Raw Agent Outputs</h3>
            </div>
            
            <div className="p-4 space-y-6">
              {visionApiDebug && aiResults && aiResults.vision && (
                <div>
                  <div className="flex items-center mb-3">
                    <Eye className="h-4 w-4 text-blue-400 mr-2" />
                    <h4 className="text-sm font-medium text-blue-400">Vision API Raw Output</h4>
                  </div>
                  <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded-lg overflow-auto max-h-64">
                    {JSON.stringify(aiResults.vision, null, 2)}
                  </pre>
                </div>
              )}

              {anthropicApiDebug && aiResults && aiResults.claude && (
                <div>
                  <div className="flex items-center mb-3">
                    <Brain className="h-4 w-4 text-purple-400 mr-2" />
                    <h4 className="text-sm font-medium text-purple-400">Claude AI Raw Output</h4>
                  </div>
                  <pre className="text-xs text-gray-300 bg-gray-800 p-3 rounded-lg overflow-auto max-h-64">
                    {JSON.stringify(aiResults.claude, null, 2)}
                  </pre>
                </div>
              )}
              
              {/* Show debug info even if no data for troubleshooting */}
              {(visionApiDebug || anthropicApiDebug) && (!aiResults || (!aiResults.vision && !aiResults.claude)) && (
                <div className="text-yellow-400 text-sm">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  No agent data available. Check that processing completed successfully.
                  {aiResults && (
                    <div className="mt-2 text-xs text-gray-400">
                      Available keys: {Object.keys(aiResults).join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Processing
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue to Results
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default AgentReviewStep;