import React from 'react';
import { AssessmentResult } from '../../../types';
import { AlertTriangle, Info } from 'lucide-react';

interface InitialOverviewProps {
  claim: AssessmentResult;
  onComplete: (data: any) => void;
}

const InitialOverview: React.FC<InitialOverviewProps> = ({ claim, onComplete }) => {
  const handleContinue = () => {
    onComplete({});
  };

  const getEstimatedReviewTime = () => {
    if (claim.aiConfidence.score < 70) return '15-20 minutes';
    if (claim.aiConfidence.score < 85) return '10-15 minutes';
    return '5-10 minutes';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900">Claim Overview</h3>
          
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Vehicle Information</h4>
              <div className="mt-2 border rounded-md divide-y">
                <div className="px-4 py-3">
                  <div className="text-sm text-gray-500">Make & Model</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {claim.vehicle.year} {claim.vehicle.make} {claim.vehicle.model}
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-sm text-gray-500">Color</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {claim.vehicle.color}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">AI Assessment</h4>
              <div className="mt-2 border rounded-md divide-y">
                <div className="px-4 py-3">
                  <div className="text-sm text-gray-500">Confidence Score</div>
                  <div className="mt-1 flex items-center">
                    <div
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        claim.aiConfidence.score >= 85
                          ? 'bg-green-100 text-green-800'
                          : claim.aiConfidence.score >= 70
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {claim.aiConfidence.score}%
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="text-sm text-gray-500">Review Type</div>
                  <div className="mt-1 text-sm font-medium text-gray-900">
                    {claim.aiConfidence.reviewType.charAt(0).toUpperCase() + 
                     claim.aiConfidence.reviewType.slice(1)} Review
                  </div>
                </div>
              </div>
            </div>
          </div>

          {claim.aiConfidence.escalationReason && (
            <div className="mt-6">
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Review Required
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>
                        This claim requires review due to: {claim.aiConfidence.escalationReason.split('_').join(' ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Estimated Review Time
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      This review is expected to take approximately {getEstimatedReviewTime()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Begin Review
        </button>
      </div>
    </div>
  );
};

export default InitialOverview;