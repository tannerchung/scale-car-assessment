import React, { useState, useEffect } from 'react';
import { config, AIProvider } from '../../config';
import { CheckCircle, XCircle, AlertTriangle, Settings2, Bug, Loader2, Brain, Eye, RefreshCw, TestTube } from 'lucide-react';
import visionApiService from '../../services/visionApiService';
import aiService from '../../services/aiService';
import { testSupabaseProxy } from '../../services/testSupabaseProxy';
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
    supabaseProxy: boolean;
  }>({
    vision: false,
    claude: false,
    supabaseProxy: false
  });

  const [apiStatus, setApiStatus] = useState<{
    vision: { verified: boolean; lastCheck?: number };
    claude: { verified: boolean; lastCheck?: number };
    supabaseProxy: { verified: boolean; lastCheck?: number };
  }>({
    vision: { verified: false },
    claude: { verified: false },
    supabaseProxy: { verified: false }
  });

  const [proxyTestResult, setProxyTestResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const isVisionConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLOUD_API_KEY || 'AIzaSyBr9T7hFPxNqfPzInbunIPDvs8picr-xxA');
  const isClaudeConfigured = Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY) && Boolean(import.meta.env.VITE_SUPABASE_URL);

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
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      setApiError('claude', { message: 'Anthropic API key not configured' });
      return;
    }
    
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setApiError('claude', { message: 'Supabase not configured - using mock responses' });
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

  const testSupabaseProxyConnection = async () => {
    setIsVerifying(prev => ({ ...prev, supabaseProxy: true }));
    setProxyTestResult(null);
    
    try {
      const result = await testSupabaseProxy();
      setProxyTestResult(result);
      setApiStatus(prev => ({
        ...prev,
        supabaseProxy: { 
          verified: result.success,
          lastCheck: Date.now()
        }
      }));
    } catch (error) {
      const errorResult = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };
      setProxyTestResult(errorResult);
      setApiStatus(prev => ({
        ...prev,
        supabaseProxy: { verified: false, lastCheck: Date.now() }
      }));
    } finally {
      setIsVerifying(prev => ({ ...prev, supabaseProxy: false }));
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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderErrorDetailsWithDebug = (
    error: typeof apiErrors.vision | typeof apiErrors.claude,
    showDebug: boolean
  ) => {
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
                {error.details && showDebug && (
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
                   'Both Providers (Agentic Mode)'}
                </option>
              ))}
            </select>
            {activeAiProvider === 'both' && (
              <p className="mt-2 text-sm text-blue-600">
                🤖 Agentic mode enabled: Multiple AI agents will collaborate autonomously
              </p>
            )}
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

                {apiErrors.vision && renderErrorDetailsWithDebug(apiErrors.vision, visionApiDebug)}

                {!isVisionConfigured && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Google Vision API Setup Required
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>To use the Vision API, you need to:</p>
                          <ol className="list-decimal list-inside mt-1 space-y-1">
                            <li>Create a Google Cloud project</li>
                            <li>Enable the Vision API</li>
                            <li>Create an API key</li>
                            <li>Add VITE_GOOGLE_CLOUD_API_KEY to your environment variables</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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

                {apiErrors.claude && renderErrorDetailsWithDebug(apiErrors.claude, anthropicApiDebug)}

                {!isClaudeConfigured && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Claude AI Setup Required
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>To use Claude AI, you need to:</p>
                          <ol className="list-decimal list-inside mt-1 space-y-1">
                            <li>Get an Anthropic API key</li>
                            <li>Configure Supabase with the claude-proxy Edge Function</li>
                            <li>Add VITE_ANTHROPIC_API_KEY to your environment variables</li>
                            <li>Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show deployment instructions when getting 404 errors */}
                {apiErrors.claude?.message?.includes('not deployed') && (
                  <div className="mt-4 bg-orange-50 border border-orange-200 rounded-md p-4">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-orange-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-orange-800">
                          Edge Function Deployment Required
                        </h3>
                        <div className="mt-2 text-sm text-orange-700">
                          <p>The Claude proxy Edge Function needs to be deployed to your Supabase project:</p>
                          <ol className="list-decimal list-inside mt-2 space-y-1">
                            <li>Install Supabase CLI: <code className="bg-orange-100 px-1 rounded">npm install -g supabase</code></li>
                            <li>Login to Supabase: <code className="bg-orange-100 px-1 rounded">supabase login</code></li>
                            <li>Link your project: <code className="bg-orange-100 px-1 rounded">supabase link --project-ref YOUR_PROJECT_ID</code></li>
                            <li>Deploy the function: <code className="bg-orange-100 px-1 rounded">supabase functions deploy claude-proxy</code></li>
                            <li>Set your Anthropic API key: <code className="bg-orange-100 px-1 rounded">supabase secrets set ANTHROPIC_API_KEY=your_key_here</code></li>
                          </ol>
                          <p className="mt-2">The Edge Function code is already included in your project at <code className="bg-orange-100 px-1 rounded">supabase/functions/claude-proxy/index.ts</code></p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Supabase Proxy Test */}
          {(activeAiProvider === 'claude' || activeAiProvider === 'both') && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <TestTube className="h-5 w-5 text-green-500 mr-2" />
                  <h4 className="text-lg font-medium text-gray-900">Supabase Proxy Test</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={testSupabaseProxyConnection}
                    disabled={isVerifying.supabaseProxy}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {isVerifying.supabaseProxy ? (
                      <>
                        <Loader2 className="animate-spin h-4 w-4 mr-2" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <TestTube className="h-4 w-4 mr-2" />
                        Test Proxy
                      </>
                    )}
                  </button>
                  {apiStatus.supabaseProxy.lastCheck && (
                    <span className="text-xs text-gray-500">
                      Last tested: {format(apiStatus.supabaseProxy.lastCheck, 'HH:mm:ss')}
                    </span>
                  )}
                </div>
              </div>

              {proxyTestResult && (
                <div className={`mt-4 p-4 rounded-md ${
                  proxyTestResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex">
                    {proxyTestResult.success ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                    <div className="ml-3">
                      <h3 className={`text-sm font-medium ${
                        proxyTestResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {proxyTestResult.success ? 'Proxy Test Successful' : 'Proxy Test Failed'}
                      </h3>
                      <div className={`mt-2 text-sm ${
                        proxyTestResult.success ? 'text-green-700' : 'text-red-700'
                      }`}>
                        <p>{proxyTestResult.message}</p>
                        {proxyTestResult.details && (
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(proxyTestResult.details, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-blue-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      About the Proxy Test
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>This test verifies that:</p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Supabase Edge Function is deployed and accessible</li>
                        <li>Anthropic API key is configured correctly</li>
                        <li>Claude API is responding to requests</li>
                        <li>The proxy is properly forwarding requests and responses</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiStatusPanel;