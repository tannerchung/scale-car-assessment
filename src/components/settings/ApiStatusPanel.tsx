import React, { useState, useEffect } from 'react';
import { config } from '../../config';
import { CheckCircle, XCircle, AlertTriangle, Settings2, Bug, Loader2 } from 'lucide-react';
import visionApiService from '../../services/visionApiService';

const ApiStatusPanel: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(config.vision.useRealApi);
  const [debugMode, setDebugMode] = useState(config.vision.debugMode);
  const [isVerifying, setIsVerifying] = useState(false);
  const [apiStatus, setApiStatus] = useState<{
    verified: boolean;
    error?: string;
  }>({ verified: false });
  const isConfigured = Boolean(config.vision.apiKey);

  useEffect(() => {
    if (isEnabled && isConfigured) {
      verifyApiKey();
    }
  }, [isEnabled, isConfigured]);

  const verifyApiKey = async () => {
    setIsVerifying(true);
    try {
      const result = await visionApiService.verifyApiKey();
      setApiStatus({ verified: result.valid, error: result.error });
    } catch (error) {
      setApiStatus({ 
        verified: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleToggle = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    localStorage.setItem('useRealVisionApi', newValue.toString());
    window.location.reload(); // Reload to apply changes
  };

  const handleDebugToggle = () => {
    const newValue = !debugMode;
    setDebugMode(newValue);
    localStorage.setItem('visionApiDebug', newValue.toString());
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex items-center">
          <Settings2 className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Vision API Configuration
          </h3>
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-gray-500">API Status</dt>
              <dd className="flex items-center">
                {isEnabled ? (
                  isVerifying ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Verifying
                    </span>
                  ) : isConfigured ? (
                    apiStatus.verified ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        <XCircle className="h-4 w-4 mr-1" />
                        Error
                      </span>
                    )
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Not Configured
                    </span>
                  )
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    <XCircle className="h-4 w-4 mr-1" />
                    Disabled
                  </span>
                )}
              </dd>
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-gray-500">Use Real API</dt>
              <dd>
                <button
                  type="button"
                  onClick={handleToggle}
                  className={`${
                    isEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  role="switch"
                  aria-checked={isEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`${
                      isEnabled ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </dd>
            </div>
          </div>

          <div className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <dt className="text-sm font-medium text-gray-500">Debug Mode</dt>
              <dd>
                <button
                  type="button"
                  onClick={handleDebugToggle}
                  className={`${
                    debugMode ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  role="switch"
                  aria-checked={debugMode}
                >
                  <span
                    aria-hidden="true"
                    className={`${
                      debugMode ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </dd>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Show API response logs during image processing
            </p>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">Mode</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {isEnabled ? 'Live API' : 'Mock Data'}
            </dd>
          </div>

          <div>
            <dt className="text-sm font-medium text-gray-500">API Key Status</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {isConfigured ? (
                apiStatus.verified ? (
                  <span className="text-green-600">Valid</span>
                ) : (
                  <span className="text-red-600">Invalid</span>
                )
              ) : (
                <span className="text-red-600">Not Configured</span>
              )}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Supported Image Types</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {config.ui.supportedImageTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Max Image Size</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {(config.ui.maxImageSize / (1024 * 1024)).toFixed(0)}MB
            </dd>
          </div>
        </dl>

        {isEnabled && !isConfigured && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  API Key Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    The Vision API is enabled but no API key is configured. Please add your API key to the .env file:
                  </p>
                  <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded">
                    VITE_GOOGLE_CLOUD_API_KEY=your_api_key_here
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEnabled && isConfigured && apiStatus.error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  API Key Verification Failed
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{apiStatus.error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {debugMode && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Bug className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Debug Mode Enabled
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    API response logs will be shown during image processing. This may include sensitive information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isEnabled && isConfigured && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={verifyApiKey}
              disabled={isVerifying}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isVerifying
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Verifying...
                </>
              ) : (
                'Verify API Key'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiStatusPanel;