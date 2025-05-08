import React from 'react';
import { AssessmentResult } from '../../../types';

interface FinalReviewProps {
  claim: AssessmentResult;
  reviewData: {
    imageAssessment: {
      imagesVerified: boolean;
      qualityIssues: string[];
      notes: string;
    };
    damageReview: {
      verifiedDamage: Array<{ name: string; confidence: number; coordinates: any }>;
      severity: string;
      notes: string;
    };
    costReview: {
      verifiedCosts: Array<{ category: string; amount: number }>;
      adjustments: Array<{ type: string; amount: number }>;
      notes: string;
    };
    coverageReview: {
      coverageVerified: boolean;
      exclusions: Array<{ reason: string; details: string }>;
      notes: string;
    };
    decision: {
      status: 'approved' | 'rejected' | 'escalated';
      reason: string;
      notes: string;
    };
  };
  onComplete: () => void;
}

const FinalReview: React.FC<FinalReviewProps> = ({ claim, reviewData, onComplete }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Final Review Summary</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please review all information before submitting the final assessment.
        </p>
      </div>

      {/* Image Assessment Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900">Image Assessment</h4>
        <div className="mt-2 space-y-2">
          <p className="text-sm">
            Images Verified: <span className="font-medium">{reviewData.imageAssessment.imagesVerified ? 'Yes' : 'No'}</span>
          </p>
          {reviewData.imageAssessment.qualityIssues.length > 0 && (
            <div>
              <p className="text-sm font-medium">Quality Issues:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {reviewData.imageAssessment.qualityIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          {reviewData.imageAssessment.notes && (
            <p className="text-sm text-gray-600">Notes: {reviewData.imageAssessment.notes}</p>
          )}
        </div>
      </div>

      {/* Damage Review Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900">Damage Assessment</h4>
        <div className="mt-2 space-y-2">
          <p className="text-sm">
            Severity: <span className="font-medium">{reviewData.damageReview.severity}</span>
          </p>
          {reviewData.damageReview.verifiedDamage.length > 0 && (
            <div>
              <p className="text-sm font-medium">Verified Damage:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {reviewData.damageReview.verifiedDamage.map((damage, index) => (
                  <li key={index}>
                    {damage.name} (Confidence: {Math.round(damage.confidence * 100)}%)
                  </li>
                ))}
              </ul>
            </div>
          )}
          {reviewData.damageReview.notes && (
            <p className="text-sm text-gray-600">Notes: {reviewData.damageReview.notes}</p>
          )}
        </div>
      </div>

      {/* Cost Review Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900">Cost Assessment</h4>
        <div className="mt-2 space-y-2">
          {reviewData.costReview.verifiedCosts.length > 0 && (
            <div>
              <p className="text-sm font-medium">Verified Costs:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {reviewData.costReview.verifiedCosts.map((cost, index) => (
                  <li key={index}>
                    {cost.category}: ${typeof cost.amount === 'number' ? cost.amount.toFixed(2) : '0.00'}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {reviewData.costReview.adjustments.length > 0 && (
            <div>
              <p className="text-sm font-medium">Adjustments:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {reviewData.costReview.adjustments.map((adjustment, index) => (
                  <li key={index}>
                    {adjustment.type}: ${typeof adjustment.amount === 'number' ? adjustment.amount.toFixed(2) : '0.00'}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {reviewData.costReview.notes && (
            <p className="text-sm text-gray-600">Notes: {reviewData.costReview.notes}</p>
          )}
        </div>
      </div>

      {/* Coverage Review Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900">Coverage Verification</h4>
        <div className="mt-2 space-y-2">
          <p className="text-sm">
            Coverage Verified: <span className="font-medium">{reviewData.coverageReview.coverageVerified ? 'Yes' : 'No'}</span>
          </p>
          {reviewData.coverageReview.exclusions.length > 0 && (
            <div>
              <p className="text-sm font-medium">Exclusions:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {reviewData.coverageReview.exclusions.map((exclusion, index) => (
                  <li key={index}>
                    {exclusion.reason}: {exclusion.details}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {reviewData.coverageReview.notes && (
            <p className="text-sm text-gray-600">Notes: {reviewData.coverageReview.notes}</p>
          )}
        </div>
      </div>

      {/* Final Decision Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900">Final Decision</h4>
        <div className="mt-2 space-y-2">
          <p className="text-sm">
            Status: <span className="font-medium capitalize">{reviewData.decision.status}</span>
          </p>
          {reviewData.decision.reason && (
            <p className="text-sm">
              Reason: <span className="text-gray-600">{reviewData.decision.reason}</span>
            </p>
          )}
          {reviewData.decision.notes && (
            <p className="text-sm text-gray-600">Notes: {reviewData.decision.notes}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onComplete}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Confirm and Submit
        </button>
      </div>
    </div>
  );
};

export default FinalReview;