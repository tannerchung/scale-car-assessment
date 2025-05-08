import React from 'react';
import { Clock, TrendingUp, Users, CheckCircle, BarChart3, ThumbsUp } from 'lucide-react';

const Metrics = () => {
  const metrics = {
    processingTime: {
      current: 12,
      previous: 48,
      reduction: 75
    },
    autoApproval: {
      rate: 52,
      trend: '+5%',
      total: 1250
    },
    adjusterProductivity: {
      current: 28,
      previous: 8,
      increase: 350
    },
    decisionAccuracy: {
      rate: 96.5,
      audited: 500,
      trend: '+1.2%'
    },
    costAccuracy: {
      rate: 94.8,
      deviation: 3.2,
      samples: 750
    },
    satisfaction: {
      overall: 4.6,
      responses: 890,
      trend: '+0.3'
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Metrics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Key performance indicators and system efficiency metrics
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Processing Time */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Processing Time</h2>
                <p className="text-sm text-gray-500">Average claim processing duration</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="text-4xl font-bold text-gray-900">{metrics.processingTime.current}min</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-green-600 text-sm font-semibold">
                  {metrics.processingTime.reduction}% reduction
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  vs. {metrics.processingTime.previous}min manual
                </span>
              </div>
            </div>
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      Target Met
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-green-200">
                  <div
                    style={{ width: "75%" }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Approval Rate */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Auto-Approval Rate</h2>
                <p className="text-sm text-gray-500">Claims automatically processed</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="text-4xl font-bold text-gray-900">{metrics.autoApproval.rate}%</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-green-600 text-sm font-semibold">
                  {metrics.autoApproval.trend}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  from last month
                </span>
              </div>
            </div>
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      Target Met
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                  <div
                    style={{ width: `${metrics.autoApproval.rate}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Adjuster Productivity */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Adjuster Productivity</h2>
                <p className="text-sm text-gray-500">Claims processed per hour</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="text-4xl font-bold text-gray-900">{metrics.adjusterProductivity.current}</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-green-600 text-sm font-semibold">
                  {metrics.adjusterProductivity.increase}% increase
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  vs. {metrics.adjusterProductivity.previous} manual
                </span>
              </div>
            </div>
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      Target Met
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-200">
                  <div
                    style={{ width: "87%" }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Decision Accuracy */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Decision Accuracy</h2>
                <p className="text-sm text-gray-500">Based on {metrics.decisionAccuracy.audited} audited claims</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="text-4xl font-bold text-gray-900">{metrics.decisionAccuracy.rate}%</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-green-600 text-sm font-semibold">
                  {metrics.decisionAccuracy.trend}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  from previous quarter
                </span>
              </div>
            </div>
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      High Accuracy
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-green-200">
                  <div
                    style={{ width: `${metrics.decisionAccuracy.rate}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Estimation Accuracy */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Cost Accuracy</h2>
                <p className="text-sm text-gray-500">Estimate vs. actual repair costs</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="text-4xl font-bold text-gray-900">{metrics.costAccuracy.rate}%</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-amber-600 text-sm font-semibold">
                  ±{metrics.costAccuracy.deviation}%
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  average deviation
                </span>
              </div>
            </div>
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-600 bg-amber-200">
                      Near Target
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-amber-200">
                  <div
                    style={{ width: `${metrics.costAccuracy.rate}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-4">
                <ThumbsUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">Customer Satisfaction</h2>
                <p className="text-sm text-gray-500">Based on {metrics.satisfaction.responses} responses</p>
              </div>
            </div>
            <div className="mt-6">
              <div className="text-4xl font-bold text-gray-900">{metrics.satisfaction.overall}/5</div>
              <div className="mt-1 flex items-baseline">
                <span className="text-green-600 text-sm font-semibold">
                  +{metrics.satisfaction.trend}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  from last quarter
                </span>
              </div>
            </div>
            <div className="mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                      Excellent
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-yellow-200">
                  <div
                    style={{ width: `${(metrics.satisfaction.overall / 5) * 100}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;