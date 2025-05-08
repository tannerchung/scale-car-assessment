import React, { useState } from 'react';
import { AssessmentResult } from '../../../types';

interface DecisionStepProps {
  claim: AssessmentResult;
  onComplete: (data: {
    decision: {
      status: 'approved' | 'rejected' | 'escalated';
      reason: string;
      notes: string;
    }
  }) => void;
}

const DecisionStep: React.FC<DecisionStepProps> = ({ claim, onComplete }) => {
  const [status, setStatus] = useState<'approved' | 'rejected' | 'escalated'>('approved');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({
      decision: {
        status,
        reason,
        notes
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Final Decision</h3>
        <p className="mt-1 text-sm text-gray-500">
          Make your final decision on this claim based on the previous assessments.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Decision</label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="decision"
                value="approved"
                checked={status === 'approved'}
                onChange={(e) => setStatus(e.target.value as 'approved')}
              />
              <span className="ml-2">Approve</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="decision"
                value="rejected"
                checked={status === 'rejected'}
                onChange={(e) => setStatus(e.target.value as 'rejected')}
              />
              <span className="ml-2">Reject</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                className="form-radio text-blue-600"
                name="decision"
                value="escalated"
                checked={status === 'escalated'}
                onChange={(e) => setStatus(e.target.value as 'escalated')}
              />
              <span className="ml-2">Escalate</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reason for Decision
          </label>
          <div className="mt-1">
            <textarea
              rows={3}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the reasoning behind your decision..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <div className="mt-1">
            <textarea
              rows={3}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or observations..."
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
    </div>
  );
};

export default DecisionStep;