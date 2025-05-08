import React from 'react';
import { ImageData } from '../../types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PreviewStepProps {
  imageData: ImageData;
  onConfirm: () => void;
  onBack: () => void;
}

const PreviewStep: React.FC<PreviewStepProps> = ({ imageData, onConfirm, onBack }) => {
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

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-blue-800 mb-1">What happens next?</h3>
        <p className="text-blue-700 text-sm">
          Our AI system will analyze this image to identify vehicle details, assess damage, 
          and estimate repair costs. The analysis typically takes 10-15 seconds.
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