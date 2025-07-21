import React, { useState } from 'react';
import { Save, AlertTriangle } from 'lucide-react';
import ApiStatusPanel from '../components/settings/ApiStatusPanel';
import EvaluationDashboard from '../components/evaluation/EvaluationDashboard';

const Settings = () => {
  const [settings, setSettings] = useState({
    confidenceThresholds: {
      autoApproval: 90,
      quickReview: 80,
      detailedReview: 70
    },
    costThresholds: {
      deviationPercent: 20,
      maxAutoApproval: 5000
    },
    apiKeys: {
      openai: '',
      azure: '',
      googleCloud: '',
      claude: ''
    },
    retraining: {
      schedule: 'weekly',
      minSamples: 1000,
      accuracyThreshold: 95
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save settings logic would go here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure AI model behavior, integration settings, and system parameters.
          </p>
        </div>

        {/* API Status Panel */}
        <section className="space-y-12">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-4">
            API Status
          </h2>
          <ApiStatusPanel />
        </section>

        {/* Evaluation Dashboard */}
        <section className="space-y-12">
          <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-4">
            AI Evaluation & Performance
          </h2>
          <EvaluationDashboard />
        </section>

        <form onSubmit={handleSubmit} className="space-y-24">
          {/* Confidence Thresholds */}
          <section className="space-y-12">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-4">
              Confidence Thresholds
            </h2>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto-Approval Threshold
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.confidenceThresholds.autoApproval}
                      onChange={(e) => setSettings({
                        ...settings,
                        confidenceThresholds: {
                          ...settings.confidenceThresholds,
                          autoApproval: parseInt(e.target.value)
                        }
                      })}
                      className="block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Minimum confidence for automatic approval</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quick Review Threshold
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.confidenceThresholds.quickReview}
                      onChange={(e) => setSettings({
                        ...settings,
                        confidenceThresholds: {
                          ...settings.confidenceThresholds,
                          quickReview: parseInt(e.target.value)
                        }
                      })}
                      className="block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Minimum confidence for quick review</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Review Threshold
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.confidenceThresholds.detailedReview}
                      onChange={(e) => setSettings({
                        ...settings,
                        confidenceThresholds: {
                          ...settings.confidenceThresholds,
                          detailedReview: parseInt(e.target.value)
                        }
                      })}
                      className="block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Minimum confidence for detailed review</p>
                </div>
              </div>
            </div>
          </section>

          {/* Cost Thresholds */}
          <section className="space-y-12">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-4">
              Cost Thresholds
            </h2>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Deviation Threshold
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      value={settings.costThresholds.deviationPercent}
                      onChange={(e) => setSettings({
                        ...settings,
                        costThresholds: {
                          ...settings.costThresholds,
                          deviationPercent: parseInt(e.target.value)
                        }
                      })}
                      className="block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Maximum allowed deviation from historical average</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Auto-Approval Amount
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={settings.costThresholds.maxAutoApproval}
                      onChange={(e) => setSettings({
                        ...settings,
                        costThresholds: {
                          ...settings.costThresholds,
                          maxAutoApproval: parseInt(e.target.value)
                        }
                      })}
                      className="block w-full rounded-md border-gray-300 pl-7 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">Maximum claim amount for automatic approval</p>
                </div>
              </div>
            </div>
          </section>

          {/* API Integration */}
          <section className="space-y-12">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-4">
              API Integration
            </h2>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OpenAI API Key
                  </label>
                  <input
                    type="password"
                    value={settings.apiKeys.openai}
                    onChange={(e) => setSettings({
                      ...settings,
                      apiKeys: {
                        ...settings.apiKeys,
                        openai: e.target.value
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Azure Computer Vision API Key
                  </label>
                  <input
                    type="password"
                    value={settings.apiKeys.azure}
                    onChange={(e) => setSettings({
                      ...settings,
                      apiKeys: {
                        ...settings.apiKeys,
                        azure: e.target.value
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Google Cloud Vision API Key
                  </label>
                  <input
                    type="password"
                    value={settings.apiKeys.googleCloud}
                    onChange={(e) => setSettings({
                      ...settings,
                      apiKeys: {
                        ...settings.apiKeys,
                        googleCloud: e.target.value
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anthropic Claude API Key
                  </label>
                  <input
                    type="password"
                    value={settings.apiKeys.claude}
                    onChange={(e) => setSettings({
                      ...settings,
                      apiKeys: {
                        ...settings.apiKeys,
                        claude: e.target.value
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* AI Retraining */}
          <section className="space-y-12">
            <h2 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-4">
              AI Model Retraining
            </h2>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retraining Schedule
                  </label>
                  <select
                    value={settings.retraining.schedule}
                    onChange={(e) => setSettings({
                      ...settings,
                      retraining: {
                        ...settings.retraining,
                        schedule: e.target.value
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Training Samples
                  </label>
                  <input
                    type="number"
                    value={settings.retraining.minSamples}
                    onChange={(e) => setSettings({
                      ...settings,
                      retraining: {
                        ...settings.retraining,
                        minSamples: parseInt(e.target.value)
                      }
                    })}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accuracy Threshold
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      value={settings.retraining.accuracyThreshold}
                      onChange={(e) => setSettings({
                        ...settings,
                        retraining: {
                          ...settings.retraining,
                          accuracyThreshold: parseInt(e.target.value)
                        }
                      })}
                      className="block w-full rounded-md border-gray-300 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="text-gray-500 sm:text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset to Defaults
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;