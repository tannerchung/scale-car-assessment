import React, { useState, useCallback } from 'react';
import { Upload, Link, X } from 'lucide-react';
import { ImageData } from '../../types';
import DragDropUpload from '../upload/DragDropUpload';
import UrlInput from '../upload/UrlInput';
import { analyzeDamageWithClaude } from '../../services/aiService';

interface UploadStepProps {
  onImageUpload: (imageData: ImageData) => void;
}

const UploadStep: React.FC<UploadStepProps> = ({ onImageUpload }) => {
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = async (imageData: ImageData) => {
    try {
      setIsProcessing(true);
      setError(null);

      // Convert image to base64 if it's a file
      let base64Data: string;
      let mediaType = 'image/jpeg'; // default
      if (imageData.type === 'file' && imageData.file) {
        mediaType = imageData.file.type || 'image/jpeg';
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageData.file);
        });
      } else {
        // For URLs, fetch and convert to base64
        const response = await fetch(imageData.url);
        const blob = await response.blob();
        mediaType = blob.type || 'image/jpeg';
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      // Analyze image with Claude
      // Extract base64 data without data URL prefix for Claude
      const cleanBase64 = base64Data.includes('base64,') 
        ? base64Data.split('base64,')[1]
        : base64Data;
      await analyzeDamageWithClaude(cleanBase64, mediaType);

      // If successful, proceed with the upload
      onImageUpload(imageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
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
    await processImage({
      file,
      url,
      type: 'file',
      name: file.name
    });
  }, []);

  const handleUrlUpload = useCallback(async (url: string) => {
    // Basic URL validation
    if (!url.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i)) {
      setError('Please enter a valid image URL (ending with jpg, jpeg, png, webp, or gif)');
      return;
    }

    setError(null);
    
    // Extract filename from URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    await processImage({
      url,
      type: 'url',
      name: fileName
    });
  }, []);

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
            disabled={isProcessing}
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
            disabled={isProcessing}
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

      {isProcessing && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-700 mr-2"></div>
            <p>Processing image with AI...</p>
          </div>
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