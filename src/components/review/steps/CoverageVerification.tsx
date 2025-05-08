import React, { useState } from 'react';
import { AssessmentResult } from '../../../types';

interface CoverageVerificationProps {
  claim: AssessmentResult;
  onComplete: (data: {
    coverageReview: {
      coverageVerified: boolean;
      exclusions: string[];
      notes: string;
    }
  }) => void;
}

const CoverageVerification: React.FC<CoverageVerificationProps> = ({ claim, onComplete }) => {
  const [coverageVerified, setCoverageVerified] = useState(false);
  const [exclusions, setExclusions] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      coverageReview: {
        coverageVerified,
        exclusions,
        notes
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Coverage Verification</h3>
        <p className="mt-1 text-sm text-gray-500">
          Verify that the damage is covered under the policy terms and conditions.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={coverageVerified}
              onChange={(e) => setCoverageVerified(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-900">
              I confirm that this damage is covered under the policy
            </span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Policy Exclusions
          </label>
          <select
            multiple
            value={exclusions}
            onChange={(e) => setExclusions(Array.from(e.target.selectedOptions, option => option.value))}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="wear-and-tear">Normal Wear and Tear</option>
            <option value="pre-existing">Pre-existing Damage</option>
            <option value="maintenance">Lack of Maintenance</option>
            <option value="modification">Unauthorized Modifications</option>
            <option value="racing">Racing or Competition Use</option>
          </select>
          <p className="mt-2 text-sm text-gray-500">
            Select any applicable policy exclusions
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Add any relevant notes about coverage verification..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default CoverageVerification;