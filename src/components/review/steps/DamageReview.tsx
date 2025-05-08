import React, { useState } from 'react';
import { AssessmentResult, DamageArea } from '../../../types';
import DamageOverlay from '../../DamageOverlay';

interface DamageReviewProps {
  claim: AssessmentResult;
  onComplete: (data: {
    damageReview: {
      verifiedDamage: DamageArea[];
      severity: string;
      notes: string;
    }
  }) => void;
}

const DamageReview: React.FC<DamageReviewProps> = ({ claim, onComplete }) => {
  const [verifiedDamage, setVerifiedDamage] = useState<DamageArea[]>(claim.damage.affectedAreas);
  const [severity, setSeverity] = useState(claim.damage.severity);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    onComplete({
      damageReview: {
        verifiedDamage,
        severity,
        notes
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Damage Assessment Review</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please verify the AI-detected damage and adjust if necessary.
        </p>
      </div>

      <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={claim.imageUrl}
          alt="Vehicle damage"
          className="w-full h-full object-cover"
        />
        <DamageOverlay
          areas={verifiedDamage}
          containerWidth={100}
          containerHeight={100}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Detected Damage Areas
          </label>
          <div className="mt-2 space-y-2">
            {verifiedDamage.map((area, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={area.confidence > 0}
                    onChange={(e) => {
                      const updatedAreas = [...verifiedDamage];
                      updatedAreas[index] = {
                        ...area,
                        confidence: e.target.checked ? 100 : 0
                      };
                      setVerifiedDamage(updatedAreas);
                    }}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <label className="ml-2 text-sm text-gray-700">{area.name}</label>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Confidence:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={area.confidence}
                    onChange={(e) => {
                      const updatedAreas = [...verifiedDamage];
                      updatedAreas[index] = {
                        ...area,
                        confidence: parseInt(e.target.value) || 0
                      };
                      setVerifiedDamage(updatedAreas);
                    }}
                    className="w-20 text-sm border-gray-300 rounded-md"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Damage Severity
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as 'Minor' | 'Moderate' | 'Severe')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="Minor">Minor</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Add any additional observations or concerns..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Confirm Review
        </button>
      </div>
    </div>
  );
};

export default DamageReview;