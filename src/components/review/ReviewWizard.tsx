import React, { useState } from 'react';
import { AssessmentResult } from '../../types';
import InitialOverview from './steps/InitialOverview';
import ImageAssessment from './steps/ImageAssessment';
import DamageReview from './steps/DamageReview';
import CostEstimateReview from './steps/CostEstimateReview';
import CoverageVerification from './steps/CoverageVerification';
import DecisionStep from './steps/DecisionStep';
import FinalReview from './steps/FinalReview';
import { X } from 'lucide-react';

interface ReviewWizardProps {
  claim: AssessmentResult;
  onClose: () => void;
  onComplete: (updatedClaim: AssessmentResult) => void;
}

export type ReviewStep = {
  id: number;
  title: string;
  description: string;
};

const steps: ReviewStep[] = [
  {
    id: 0,
    title: 'Overview',
    description: 'Review claim details and AI assessment'
  },
  {
    id: 1,
    title: 'Images',
    description: 'Verify damage visibility and image quality'
  },
  {
    id: 2,
    title: 'Damage',
    description: 'Review and validate damage assessment'
  },
  {
    id: 3,
    title: 'Costs',
    description: 'Verify repair cost estimates'
  },
  {
    id: 4,
    title: 'Coverage',
    description: 'Confirm policy coverage'
  },
  {
    id: 5,
    title: 'Decision',
    description: 'Make final decision and document'
  },
  {
    id: 6,
    title: 'Summary',
    description: 'Review and submit'
  }
];

const ReviewWizard: React.FC<ReviewWizardProps> = ({ claim, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [reviewData, setReviewData] = useState({
    imageAssessment: {
      imagesVerified: false,
      qualityIssues: [],
      notes: ''
    },
    damageReview: {
      verifiedDamage: [],
      severity: claim.damage.severity,
      notes: ''
    },
    costReview: {
      verifiedCosts: [],
      adjustments: [],
      notes: ''
    },
    coverageReview: {
      coverageVerified: false,
      exclusions: [],
      notes: ''
    },
    decision: {
      status: '' as 'approved' | 'rejected' | 'escalated',
      reason: '',
      notes: ''
    }
  });

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepComplete = (stepData: any) => {
    setReviewData(prev => ({
      ...prev,
      ...stepData
    }));
    handleNext();
  };

  const handleFinalSubmit = () => {
    const updatedClaim = {
      ...claim,
      status: reviewData.decision.status,
      reviewNotes: reviewData.decision.notes,
    };
    onComplete(updatedClaim);
  };

  const renderImages = () => {
    if (!claim.images || claim.images.length === 0) return null;

    return (
      <div className="mb-6 grid grid-cols-2 gap-4">
        {claim.images.map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image.url}
              alt={`Damage view ${index + 1}`}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              View {index + 1}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Review Claim #{claim.id}</h2>
            <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep > index
                      ? 'bg-blue-600 text-white'
                      : currentStep === index
                        ? 'bg-blue-100 text-blue-600 border-2 border-blue-600'
                        : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {currentStep > index ? '✓' : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > index ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            {steps.map(step => (
              <div
                key={step.id}
                className={`w-8 text-center ${
                  currentStep >= step.id ? 'text-blue-600' : ''
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {currentStep !== 1 && renderImages()}
          
          {currentStep === 0 && (
            <InitialOverview
              claim={claim}
              onComplete={handleStepComplete}
            />
          )}
          {currentStep === 1 && (
            <ImageAssessment
              claim={claim}
              onComplete={handleStepComplete}
            />
          )}
          {currentStep === 2 && (
            <DamageReview
              claim={claim}
              onComplete={handleStepComplete}
            />
          )}
          {currentStep === 3 && (
            <CostEstimateReview
              claim={claim}
              onComplete={handleStepComplete}
            />
          )}
          {currentStep === 4 && (
            <CoverageVerification
              claim={claim}
              onComplete={handleStepComplete}
            />
          )}
          {currentStep === 5 && (
            <DecisionStep
              claim={claim}
              onComplete={handleStepComplete}
            />
          )}
          {currentStep === 6 && (
            <FinalReview
              claim={claim}
              reviewData={reviewData}
              onComplete={handleFinalSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewWizard;