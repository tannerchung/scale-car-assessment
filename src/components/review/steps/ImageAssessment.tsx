import React, { useState } from 'react';
import { AssessmentResult } from '../../../types';
import { AlertCircle, CheckCircle, ImageOff } from 'lucide-react';

interface ImageAssessmentProps {
  claim: AssessmentResult;
  onComplete: (data: {
    imageAssessment: {
      imagesVerified: boolean;
      qualityIssues: string[];
      notes: string;
    }
  }) => void;
}

const ImageAssessment: React.FC<ImageAssessmentProps> = ({ claim, onComplete }) => {
  const [qualityIssues, setQualityIssues] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [imagesVerified, setImagesVerified] = useState(false);

  const qualityOptions = [
    'Poor lighting',
    'Blurry image',
    'Incomplete coverage',
    'Obstructed view',
    'Wrong angle',
    'Distance too far',
  ];

  const handleSubmit = () => {
    onComplete({
      imageAssessment: {
        imagesVerified,
        qualityIssues,
        notes
      }
    });
  };

  const toggleQualityIssue = (issue: string) => {
    setQualityIssues(prev => 
      prev.includes(issue)
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Image Assessment</h3>
        <p className="mt-1 text-sm text-gray-500">
          Review the submitted images and verify they adequately show the claimed damage.
        </p>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-2 gap-4">
        {!claim.images || claim.images.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <ImageOff className="w-12 h-12 text-gray-400 mb-2" />
            <p className="text-gray-600 text-sm">No images available for review</p>
          </div>
        ) : (
          claim.images.map((image, index) => (
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
          ))
        )}
      </div>

      {/* Quality Issues */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Image Quality Issues</h4>
        <div className="grid grid-cols-2 gap-2">
          {qualityOptions.map(issue => (
            <button
              key={issue}
              onClick={() => toggleQualityIssue(issue)}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                qualityIssues.includes(issue)
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200'
              }`}
            >
              {qualityIssues.includes(issue) ? (
                <AlertCircle className="w-4 h-4 mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {issue}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          id="notes"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Add any additional notes about image quality or visibility..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Verification */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="verify"
          checked={imagesVerified}
          onChange={(e) => setImagesVerified(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          disabled={!claim.images || claim.images.length === 0}
        />
        <label htmlFor="verify" className="text-sm text-gray-700">
          I verify that the images adequately show the claimed damage
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!imagesVerified}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            imagesVerified
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ImageAssessment;