import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Stepper from '../components/Stepper';
import UploadStep from '../components/steps/UploadStep';
import PreviewStep from '../components/steps/PreviewStep';
import ProcessingStep from '../components/steps/ProcessingStep';
import AgenticProcessingStep from '../components/steps/AgenticProcessingStep';
import AgentReviewStep from '../components/steps/AgentReviewStep';
import ResultsStep from '../components/steps/ResultsStep';
import { ImageData } from '../types';
import { useSettingsStore } from '../store/settingsStore';

const NewClaim: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [aiResults, setAiResults] = useState<{
    vision?: any;
    claude?: any;
  } | null>(null);
  const navigate = useNavigate();
  const { activeAiProvider } = useSettingsStore();
  const [useAgenticProcessing, setUseAgenticProcessing] = useState(activeAiProvider === 'both');
  const [useLangGraph, setUseLangGraph] = useState(false);

  const steps = [
    { id: 0, label: 'Upload Photo', icon: '📸' },
    { id: 1, label: 'Preview', icon: '👁️' },
    { id: 2, label: 'Processing', icon: '⚙️' },
    { id: 3, label: 'Agent Review', icon: '🤖' },
    { id: 4, label: 'Results', icon: '📊' },
  ];

  const handleImageUpload = (newImageData: ImageData) => {
    setImageData(newImageData);
    setCurrentStep(1);
  };

  const handleConfirm = () => {
    setCurrentStep(2);
    setProcessingComplete(false);
  };

  const handleProcessingComplete = (results: { vision?: any; claude?: any }) => {
    setAiResults(results);
    setProcessingComplete(true);
    setCurrentStep(3);
  };

  const handleAgentReviewComplete = () => {
    setCurrentStep(4);
  };

  const handleReset = () => {
    navigate('/');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-10">
        <Stepper steps={steps} currentStep={currentStep} />
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {currentStep === 0 && (
          <UploadStep onImageUpload={handleImageUpload} />
        )}
        
        {currentStep === 1 && imageData && (
          <PreviewStep 
            imageData={imageData} 
            onConfirm={handleConfirm}
            onBack={() => setCurrentStep(0)}
            useAgenticProcessing={useAgenticProcessing}
            setUseAgenticProcessing={setUseAgenticProcessing}
            useLangGraph={useLangGraph}
            setUseLangGraph={setUseLangGraph}
          />
        )}
        
        {currentStep === 2 && imageData && (
          useAgenticProcessing ? (
            <AgenticProcessingStep 
              imageData={imageData}
              onComplete={handleProcessingComplete}
              useLangGraph={useLangGraph}
            />
          ) : (
            <ProcessingStep 
              imageData={imageData}
              onComplete={handleProcessingComplete}
            />
          )
        )}
        
        {currentStep === 3 && processingComplete && imageData && (
          <AgentReviewStep 
            imageData={imageData}
            aiResults={aiResults}
            onContinue={handleAgentReviewComplete}
            onBack={() => setCurrentStep(2)}
          />
        )}
        
        {currentStep === 4 && processingComplete && imageData && (
          <ResultsStep 
            imageData={imageData}
            aiResults={aiResults}
            onReset={handleReset} 
          />
        )}
      </div>
    </main>
  );
};

export default NewClaim;