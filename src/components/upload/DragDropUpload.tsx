import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { config } from '../../config';

interface DragDropUploadProps {
  onFileUpload: (file: File) => void;
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({ onFileUpload }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): string | null => {
    if (!config.ui.supportedImageTypes.includes(file.type)) {
      return 'Please upload a supported image format (JPG, PNG, or WebP)';
    }
    if (file.size > config.ui.maxImageSize) {
      return 'File size exceeds 5MB limit';
    }
    return null;
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsUploading(true);
    
    // Simulate network delay for file processing
    setTimeout(() => {
      setIsUploading(false);
      onFileUpload(file);
    }, 1000);
  }, [onFileUpload]);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ease-in-out ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="space-y-4">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
          <Upload className="h-8 w-8 text-blue-600" />
        </div>
        
        <div className="text-center">
          <p className="text-gray-700 font-medium">
            {isDragging ? 'Drop your image here' : 'Drag and drop your image here'}
          </p>
          <p className="text-sm text-gray-500 mt-1">or</p>
        </div>
        
        <div>
          <label htmlFor="file-upload" className="relative cursor-pointer">
            <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              {isUploading ? 'Uploading...' : 'Browse Files'}
            </span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              onChange={handleFileInput}
              accept="image/*"
              disabled={isUploading}
            />
          </label>
        </div>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        
        <p className="text-xs text-gray-500">
          Supported formats: JPG, PNG, WEBP, GIF (Max 5MB)
        </p>
      </div>
    </div>
  );
};

export default DragDropUpload;