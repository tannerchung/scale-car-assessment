import React, { useState, useCallback } from 'react';
import { Upload, Link, X } from 'lucide-react';
import { ImageData } from '../../types';
import DragDropUpload from '../upload/DragDropUpload';
import UrlInput from '../upload/UrlInput';

interface UploadStepProps {
  onImageUpload: (imageData: ImageData) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ onImageUpload }) => {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((file: File) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File size exceeds 5MB limit');
      return;
    }

    setError(null);
    
    // Create object URL for preview
    const url = URL.createObjectURL(file);
    onImageUpload({
      file,
      url,
      type: 'file',
      name: file.name
    });
  }, [onImageUpload]);

  const handleUrlUpload = useCallback((url: string) => {
    // Basic URL validation
    if (!url.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i)) {
      setError('Please enter a valid image URL (ending with jpg, jpeg, png, webp, or gif)');
      return;
    }

    setError(null);
    
    // Extract filename from URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    onImageUpload({
      url,
      type: 'url',
      name: fileName
    });
  }, [onImageUpload]);

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Upload Vehicle Photo</h2>
        <p className="mt-2 text-gray-600">
          Upload a clear photo of your vehicle damage to get an assessment
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex p-1 rounded-lg bg-gray-100">
          <button
            className={`px-4 py-2 rounded-lg ${
              uploadMethod === 'file' 
                ? 'bg-white shadow text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setUploadMethod('file')}
          >
            <div className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              <span>Upload File</span>
            </div>
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              uploadMethod === 'url' 
                ? 'bg-white shadow text-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setUploadMethod('url')}
          >
            <div className="flex items-center">
              <Link className="h-5 w-5 mr-2" />
              <span>Image URL</span>
            </div>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <X className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {uploadMethod === 'file' ? (
        <DragDropUpload onFileUpload={handleFileUpload} />
      ) : (
        <UrlInput onUrlSubmit={handleUrlUpload} />
      )}

      <div className="mt-8 bg-blue-50 rounded-lg p-4 border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-2">Tips for the best assessment:</h3>
        <ul className="text-blue-700 text-sm space-y-1 ml-6 list-disc">
          <li>Take photos in good lighting</li>
          <li>Capture the damage from multiple angles</li>
          <li>Include the entire damaged area in the frame</li>
          <li>Ensure the photos are clear and in focus</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadStep;