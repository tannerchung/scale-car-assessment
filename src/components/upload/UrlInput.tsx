import React, { useState } from 'react';
import { Image, ArrowRight } from 'lucide-react';

interface UrlInputProps {
  onUrlSubmit: (url: string) => void;
}

const UrlInput: React.FC<UrlInputProps> = ({ onUrlSubmit }) => {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) return;
    
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
      setIsSubmitting(false);
      onUrlSubmit(url);
    }, 800);
  };

  return (
    <div className="border-2 border-gray-300 rounded-lg p-6">
      <div className="space-y-4">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
          <Image className="h-8 w-8 text-blue-600" />
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mt-1 flex rounded-md shadow-sm">
            <div className="relative flex items-stretch flex-grow">
              <input
                type="text"
                name="image-url"
                id="image-url"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-l-md border-gray-300 pl-3 pr-12 sm:text-sm"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!url || isSubmitting}
            >
              {isSubmitting ? 'Processing...' : (
                <>
                  Submit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </form>
        
        <p className="text-sm text-gray-500 mt-2">
          Enter the URL of an image you'd like to analyze.
        </p>
        
        <div className="bg-yellow-50 border border-yellow-100 rounded p-3 text-sm text-yellow-800">
          <p className="font-medium">Note:</p>
          <p>The URL must point directly to an image file (ending in .jpg, .png, etc.)</p>
        </div>
      </div>
    </div>
  );
};

export default UrlInput;