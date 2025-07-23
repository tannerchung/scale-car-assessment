import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';

const EnvDebugger: React.FC = () => {
  // Get all environment variables
  const allEnvVars = import.meta.env;
  
  // Check for specific variables we need
  const expectedVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_ANTHROPIC_API_KEY',
    'VITE_GOOGLE_CLOUD_API_KEY'
  ];

  const checkVariable = (varName: string) => {
    const value = allEnvVars[varName];
    return {
      name: varName,
      exists: value !== undefined,
      hasValue: Boolean(value),
      valueLength: value ? value.length : 0,
      preview: value ? `${value.substring(0, 20)}...` : 'undefined'
    };
  };

  const varStatuses = expectedVars.map(checkVariable);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Variables Debug</h2>
        
        {/* Vite Environment Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Info className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="font-medium text-blue-900">Vite Environment Info</h3>
          </div>
          <div className="text-sm text-blue-800 space-y-1">
            <div>Mode: {import.meta.env.MODE}</div>
            <div>Base URL: {import.meta.env.BASE_URL}</div>
            <div>Production: {import.meta.env.PROD ? 'Yes' : 'No'}</div>
            <div>Development: {import.meta.env.DEV ? 'Yes' : 'No'}</div>
            <div>SSR: {import.meta.env.SSR ? 'Yes' : 'No'}</div>
          </div>
        </div>

        {/* Expected Variables Status */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Expected Variables Status</h3>
          <div className="space-y-2">
            {varStatuses.map((varStatus) => (
              <div key={varStatus.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  {varStatus.exists && varStatus.hasValue ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  ) : varStatus.exists ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  )}
                  <span className="font-medium">{varStatus.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    {varStatus.exists ? (
                      <>
                        <span className="text-green-600">Found</span>
                        {varStatus.hasValue ? (
                          <span className="ml-2">({varStatus.valueLength} chars)</span>
                        ) : (
                          <span className="ml-2 text-yellow-600">(empty)</span>
                        )}
                      </>
                    ) : (
                      <span className="text-red-600">Missing</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    {varStatus.preview}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Available Variables */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">All Available Environment Variables</h3>
          <div className="bg-gray-50 border rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-700">
              {JSON.stringify(allEnvVars, null, 2)}
            </pre>
          </div>
        </div>

        {/* VITE_ Prefixed Variables */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">VITE_ Prefixed Variables</h3>
          <div className="space-y-1">
            {Object.keys(allEnvVars)
              .filter(key => key.startsWith('VITE_'))
              .map(key => (
                <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-mono text-sm">{key}</span>
                  <span className="text-xs text-gray-500">
                    {allEnvVars[key] ? `${String(allEnvVars[key]).length} chars` : 'empty'}
                  </span>
                </div>
              ))}
            {Object.keys(allEnvVars).filter(key => key.startsWith('VITE_')).length === 0 && (
              <div className="text-sm text-red-600">No VITE_ prefixed variables found!</div>
            )}
          </div>
        </div>

        {/* Troubleshooting Steps */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="font-medium text-yellow-900">Troubleshooting Steps</h3>
          </div>
          <div className="text-sm text-yellow-800 space-y-2">
            <div>1. Check that .env file is in the project root (same level as package.json)</div>
            <div>2. Ensure all variable names start with VITE_</div>
            <div>3. No spaces around = signs (VITE_VAR=value, not VITE_VAR = value)</div>
            <div>4. No quotes around values unless they're part of the actual value</div>
            <div>5. Restart the development server after adding/changing .env</div>
            <div>6. Check for hidden characters or encoding issues in .env file</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvDebugger;