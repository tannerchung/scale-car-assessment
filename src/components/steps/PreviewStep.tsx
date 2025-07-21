import React from 'react';
import { ImageData } from '../../types';
import { ArrowLeft, ArrowRight, Brain, Workflow, Cpu } from 'lucide-react';

interface PreviewStepProps {
  imageData: ImageData;
  onConfirm: () => void;
  onBack: () => void;
  useAgenticProcessing?: boolean;
  setUseAgenticProcessing?: (value: boolean) => void;
  useLangGraph?: boolean;
  setUseLangGraph?: (value: boolean) => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ 
  imageData, 
  onConfirm, 
  onBack, 
  useAgenticProcessing = false,
  setUseAgenticProcessing,
  useLangGraph = false,
  setUseLangGraph
}) => {
  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Confirm Image</h2>
        <p className="mt-2 text-gray-600">
          Please verify this is the correct image before proceeding
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative max-w-lg w-full rounded-lg overflow-hidden shadow-lg">
          <img 
            src={imageData.url} 
            alt="Vehicle damage" 
            className="w-full h-auto max-h-[500px] object-contain bg-black/5"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white px-4 py-2 text-sm truncate">
            {imageData.name}
          </div>
        </div>
      </div>

      {/* Processing Mode Selection */}
      {setUseAgenticProcessing && setUseLangGraph && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Processing Mode</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Traditional Processing */}
            <div 
              className={`relative rounded-lg border-2 cursor-pointer transition-all ${
                !useAgenticProcessing ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setUseAgenticProcessing(false)}
            >
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Cpu className={`h-6 w-6 ${!useAgenticProcessing ? 'text-blue-600' : 'text-gray-400'}`} />
                  <h4 className={`font-medium ${!useAgenticProcessing ? 'text-blue-900' : 'text-gray-900'}`}>
                    Traditional
                  </h4>
                </div>
                <p className="text-sm text-gray-600">
                  Standard AI processing with individual model analysis
                </p>
              </div>
            </div>

            {/* Agentic Processing */}
            <div 
              className={`relative rounded-lg border-2 cursor-pointer transition-all ${
                useAgenticProcessing && !useLangGraph ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setUseAgenticProcessing(true);
                setUseLangGraph(false);
              }}
            >
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Brain className={`h-6 w-6 ${useAgenticProcessing && !useLangGraph ? 'text-green-600' : 'text-gray-400'}`} />
                  <h4 className={`font-medium ${useAgenticProcessing && !useLangGraph ? 'text-green-900' : 'text-gray-900'}`}>
                    Agentic
                  </h4>
                </div>
                <p className="text-sm text-gray-600">
                  Multi-agent collaboration with iterative processing
                </p>
              </div>
            </div>

            {/* LangGraph Processing */}
            <div 
              className={`relative rounded-lg border-2 cursor-pointer transition-all ${
                useLangGraph ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                setUseAgenticProcessing(true);
                setUseLangGraph(true);
              }}
            >
              <div className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Workflow className={`h-6 w-6 ${useLangGraph ? 'text-purple-600' : 'text-gray-400'}`} />
                  <h4 className={`font-medium ${useLangGraph ? 'text-purple-900' : 'text-gray-900'}`}>
                    LangGraph
                  </h4>
                </div>
                <p className="text-sm text-gray-600">
                  State-based workflow orchestration with advanced agents
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-800 mb-1">What happens next?</h3>
        <p className="text-blue-700 text-sm">
          {useLangGraph 
            ? 'LangGraph will orchestrate specialized AI agents through a state-based workflow to analyze your image comprehensively.'
            : useAgenticProcessing 
              ? 'Multiple AI agents will collaborate to analyze this image, iterating until high confidence is achieved.'
              : 'Our AI system will analyze this image to identify vehicle details, assess damage, and estimate repair costs.'
          } The analysis typically takes 10-15 seconds.
        </p>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Proceed to Analysis
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default PreviewStep;