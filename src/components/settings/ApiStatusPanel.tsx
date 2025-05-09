import React, { useState, useEffect } from 'react';
import { config, AIProvider } from '../../config';
import { CheckCircle, XCircle, AlertTriangle, Settings2, Bug, Loader2, Brain, Eye, RefreshCw } from 'lucide-react';
import visionApiService from '../../services/visionApiService';
import aiService from '../../services/aiService';
import { useSettingsStore } from '../../store/settingsStore';
import { format } from 'date-fns';

const ApiStatusPanel: React.FC = () => {
  const {
    activeAiProvider,
    setActiveAiProvider,
    visionApiDebug,
    setVisionApiDebug,
    anthropicApiDebug,
    setAnthropicApiDebug,
    apiErrors,
    setApiError
  } = useSettingsStore();
  
  const [isVerifying, setIsVerifying] = useState<{
    vision: boolean;
    claude: boolean;
  }>({
    vision: false,
    claude: false
  });

  const [apiStatus, setApiStatus] = useState<{
    vision: { verified: boolean; lastCheck?: number };
    claude: { verified: boolean; lastCheck?: number };
  }>({
    vision: { verified: false },
    claude: { verified: false }
  });

  const isVisionConfigured = Boolean(config.vision.apiKey);
  const isClaudeConfigured = Boolean(config.anthropic.apiKey);

  useEffect(() => {
    if (activeAiProvider === 'vision' || activeAiProvider === 'both') {
      verifyVisionApiKey();
    }
    if (activeAiProvider === 'claude' || activeAiProvider === 'both') {
      verifyClaudeApiKey();
    }
  }, [activeAiProvider]);

  const verifyVisionApiKey = async () => {
    if (!isVisionConfigured) {
      setApiError('vision', { message: 'API key not configured' });
      return;
    }

    setIsVerifying(prev => ({ ...prev, vision: true }));
    try {
      const result = await visionApiService.verifyApiKey();
      setApiStatus(prev => ({
        ...prev,
        vision: { 
          verified: result.valid,
          lastCheck: Date.now()
        }
      }));
      
      if (!result.valid) {
        setApiError('vision', { 
          message: result.error || 'Verification failed',
          details: result
        });
      } else {
        setApiError('vision', null);
      }
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        vision: { verified: false, lastCheck: Date.now() }
      }));
      setApiError('vision', { 
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      });
    } finally {
      setIsVerifying(prev => ({ ...prev, vision: false }));
    }
  };

  const verifyClaudeApiKey = async () => {
    if (!isClaudeConfigured) {
      setApiError('claude', { message: 'API key not configured' });
      return;
    }

    setIsVerifying(prev => ({ ...prev, claude: true }));
    try {
      const result = await aiService.verifyAnthropicApiKey();
      setApiStatus(prev => ({
        ...prev,
        claude: { 
          verified: result.valid,
          lastCheck: Date.now()
        }
      }));
      
      if (!result.valid) {
        setApiError('claude', { 
          message: result.error || 'Verification failed',
          details: result
        });
      } else {
        setApiError('claude', null);
      }
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        claude: { verified: false, lastCheck: Date.now() }
      }));
      setApiError('claude', { 
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error
      });
    } finally {
      setIsVerifying(prev => ({ ...prev, claude: false }));
    }
  };

  const renderApiStatus = (
    provider: 'vision' | 'claude',
    isConfigured: boolean,
    status: { verified: boolean; lastCheck?: number },
    error: typeof apiErrors.vision | typeof apiErrors.claude,
    isVerifying: boolean
  ) => {
    let statusColor = 'bg-gray-100 text-gray-800';
    let statusText = 'Not Configured';

    if (isConfigured) {
      if (isVerifying) {
        statusColor = 'bg-blue-100 text-blue-800';
        statusText = 'Verifying...';
      } else if (status.verified) {
        statusColor = 'bg-green-100 text-green-800';
        statusText = 'Active';
      } else {
        statusColor = 'bg-red-100 text-red-800';
        statusText = 'Error';
      }
    }

    return (
      <div className="flex items-center space-x-2">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}>
          {statusText}
        </span>
        {status.lastCheck && (
          <span className="text-xs text-gray-500">
            Last checked: {format(status.lastCheck, 'HH:mm:ss')}
          </span>
        )}
        {isConfigured && !isVerifying && (
          <button
            onClick={() => provider === 'vision' ? verifyVisionApiKey() : verifyClaudeApiKey()}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  };

  const renderErrorDetails = (error: typeof apiErrors.vision | typeof apiErrors.claude) => {
    if (!error) return null;

    return (
      <div className="mt-4 space-y-2">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Details</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error.message}</p>
                {error.timestamp && (
                  <p className="mt-1 text-xs">
                    Occurred at: {format(error.timestamp, 'HH:mm:ss')}
                  </p>
                )}
                {error.details && visionApiDebug && (
                  <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <div className="flex items-center">
          <Settings2 className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            AI Provider Configuration
          </h3>
        </div>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        <div className="space-y-6">
          {/* AI Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active AI Provider
            </label>
            <select
              value={activeAiProvider}
              onChange={(e) => setActiveAiProvider(e.target.value as AIProvider)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              {config.aiProviders.available.map((provider) => (
                <option key={provider} value={provider}>
                  {provider === 'vision' ? 'Google Vision API Only' :
                   provider === 'claude' ? 'Claude AI Only' :
                   'Both Providers'}
                </option>
              ))}
            </select>
          </div>

          {/* Vision API Status */}
          {(activeAiProvider === 'vision' || activeAiProvider === 'both') && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Eye className="h-5 w-5 text-blue-500 mr-2" />
                  <h4 className="text-lg font-medium text-gray-900">Vision API Status</h4>
                </div>
                {renderApiStatus('vision', isVisionConfigured, apiStatus.vision, apiErrors.vision, isVerifying.vision)}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={visionApiDebug}
                      onChange={(e) => setVisionApiDebug(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable Debug Mode</span>
                  </label>
                </div>

                {apiErrors.vision && renderErrorDetails(apiErrors.vision)}
              </div>
            </div>
          )}

          {/* Claude AI Status */}
          {(activeAiProvider === 'claude' || activeAiProvider === 'both') && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Brain className="h-5 w-5 text-purple-500 mr-2" />
                  <h4 className="text-lg font-medium text-gray-900">Claude AI Status</h4>
                </div>
                {renderApiStatus('claude', isClaudeConfigured, apiStatus.claude, apiErrors.claude, isVerifying.claude)}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={anthropicApiDebug}
                      onChange={(e) => setAnthropicApiDebug(e.target.checked)}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Enable Debug Mode</span>
                  </label>
                </div>

                {apiErrors.claude && renderErrorDetails(apiErrors.claude)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiStatusPanel;