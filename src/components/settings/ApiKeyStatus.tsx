import React from 'react';
import { Key, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const ApiKeyStatus: React.FC = () => {

  const keys = {
    anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    googleVision: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY
  };


  const getKeyStatus = (key: string | undefined) => {
    if (!key) return { icon: <XCircle className="h-4 w-4 text-red-500" />, status: 'Missing' };
    return { icon: <CheckCircle className="h-4 w-4 text-green-500" />, status: 'Set' };
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Key className="h-5 w-5 mr-2" />
          API Keys Configuration
        </h3>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Anthropic API Key</h4>
            <div className="flex items-center">
              {getKeyStatus(keys.anthropic).icon}
              <span className="ml-1 text-sm text-gray-600">{getKeyStatus(keys.anthropic).status}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Required for Claude AI functionality</p>
          <code className="text-xs bg-gray-100 p-2 rounded block">
            VITE_ANTHROPIC_API_KEY={keys.anthropic ? '***configured***' : 'not_set'}
          </code>
          {!keys.anthropic && (
            <div className="mt-2 text-sm text-amber-600">
              Get your key from: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline">https://console.anthropic.com/</a>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Supabase URL</h4>
            <div className="flex items-center">
              {getKeyStatus(keys.supabaseUrl).icon}
              <span className="ml-1 text-sm text-gray-600">{getKeyStatus(keys.supabaseUrl).status}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Your Supabase project URL</p>
          <code className="text-xs bg-gray-100 p-2 rounded block">
            VITE_SUPABASE_URL={keys.supabaseUrl ? '***configured***' : 'not_set'}
          </code>
          {!keys.supabaseUrl && (
            <div className="mt-2 text-sm text-amber-600">
              Get from your Supabase project settings: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">https://supabase.com/dashboard</a>
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Supabase Anon Key</h4>
            <div className="flex items-center">
              {getKeyStatus(keys.supabaseAnonKey).icon}
              <span className="ml-1 text-sm text-gray-600">{getKeyStatus(keys.supabaseAnonKey).status}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Public anonymous key for Supabase</p>
          <code className="text-xs bg-gray-100 p-2 rounded block">
            VITE_SUPABASE_ANON_KEY={keys.supabaseAnonKey ? '***configured***' : 'not_set'}
          </code>
          {!keys.supabaseAnonKey && (
            <div className="mt-2 text-sm text-amber-600">
              Get from your Supabase project API settings
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Google Vision API Key</h4>
            <div className="flex items-center">
              {getKeyStatus(keys.googleVision).icon}
              <span className="ml-1 text-sm text-gray-600">{getKeyStatus(keys.googleVision).status}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">Required for Google Vision API functionality</p>
          <code className="text-xs bg-gray-100 p-2 rounded block">
            VITE_GOOGLE_CLOUD_API_KEY={keys.googleVision ? '***configured***' : 'not_set'}
          </code>
          {!keys.googleVision && (
            <div className="mt-2 text-sm text-amber-600">
              Get from Google Cloud Console: <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">https://console.cloud.google.com/</a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Setup Instructions</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Add these keys to your <code className="bg-blue-100 px-1 rounded">.env</code> file:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Create a <code className="bg-blue-100 px-1 rounded">.env</code> file in your project root</li>
                <li>Add each key on a new line (see format above)</li>
                <li>Restart your development server after adding keys</li>
                <li>Deploy the Supabase Edge Function for Claude integration</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyStatus;