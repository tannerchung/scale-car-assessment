import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Target, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { claimsEvaluator, EvaluationResult } from '../../services/evaluationService';
import { performanceMonitor, PerformanceMetrics } from '../../services/langsmithService';

interface EvaluationStats {
  totalEvaluations: number;
  averageAccuracy: number;
  averageConfidence: number;
  successRate: number;
  averageExecutionTime: number;
}

const EvaluationDashboard: React.FC = () => {
  const [evaluationHistory, setEvaluationHistory] = useState<Array<{
    timestamp: number;
    result: EvaluationResult;
    testCaseId: string;
  }>>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [stats, setStats] = useState<EvaluationStats>({
    totalEvaluations: 0,
    averageAccuracy: 0,
    averageConfidence: 0,
    successRate: 0,
    averageExecutionTime: 0
  });
  const [isRunningEvaluation, setIsRunningEvaluation] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const history = claimsEvaluator.getEvaluationHistory();
    const metrics = performanceMonitor.getMetrics();
    
    setEvaluationHistory(history);
    setPerformanceMetrics(metrics);
    calculateStats(history, metrics);
  };

  const calculateStats = (
    history: Array<{ timestamp: number; result: EvaluationResult; testCaseId: string }>,
    metrics: PerformanceMetrics[]
  ) => {
    if (history.length === 0) {
      setStats({
        totalEvaluations: 0,
        averageAccuracy: 0,
        averageConfidence: 0,
        successRate: 0,
        averageExecutionTime: 0
      });
      return;
    }

    const averageAccuracy = history.reduce((sum, item) => sum + item.result.accuracy, 0) / history.length;
    const averageConfidence = history.reduce((sum, item) => sum + item.result.confidence, 0) / history.length;
    const successRate = metrics.length > 0 ? metrics.filter(m => m.success).length / metrics.length : 0;
    const averageExecutionTime = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length 
      : 0;

    setStats({
      totalEvaluations: history.length,
      averageAccuracy,
      averageConfidence,
      successRate,
      averageExecutionTime
    });
  };

  const runTestSuite = async () => {
    setIsRunningEvaluation(true);
    
    try {
      // Import the processing function
      const { processClaimsWithLangGraph } = await import('../../services/langgraphService');
      
      const result = await claimsEvaluator.evaluateTestSuite(async (imageData) => {
        return await processClaimsWithLangGraph(imageData);
      });

      console.log('Test suite completed:', result);
      loadData(); // Refresh data
    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunningEvaluation(false);
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatTime = (milliseconds: number) => `${milliseconds.toFixed(0)}ms`;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Evaluation Dashboard</h2>
          <p className="text-gray-600 mt-1">Monitor AI agent performance and accuracy metrics</p>
        </div>
        <button
          onClick={runTestSuite}
          disabled={isRunningEvaluation}
          className={`px-4 py-2 rounded-lg font-medium ${
            isRunningEvaluation
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isRunningEvaluation ? 'Running Tests...' : 'Run Test Suite'}
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Evaluations</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEvaluations}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Accuracy</p>
              <p className={`text-2xl font-semibold ${getScoreColor(stats.averageAccuracy)}`}>
                {formatPercentage(stats.averageAccuracy)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Confidence</p>
              <p className={`text-2xl font-semibold ${getScoreColor(stats.averageConfidence)}`}>
                {formatPercentage(stats.averageConfidence)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-emerald-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className={`text-2xl font-semibold ${getScoreColor(stats.successRate * 100)}`}>
                {formatPercentage(stats.successRate * 100)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatTime(stats.averageExecutionTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Performance Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Agent Performance Breakdown</h3>
        
        {performanceMetrics.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No performance data available. Run some evaluations to see metrics.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {['vision_analysis_agent', 'claude_analysis_agent', 'damage_assessment_agent', 'quality_assurance_agent'].map(agentName => {
              const agentMetrics = performanceMetrics.filter(m => m.agentName === agentName);
              if (agentMetrics.length === 0) return null;

              const avgConfidence = agentMetrics.reduce((sum, m) => sum + m.confidence, 0) / agentMetrics.length;
              const successRate = agentMetrics.filter(m => m.success).length / agentMetrics.length;
              const avgTime = agentMetrics.reduce((sum, m) => sum + m.executionTime, 0) / agentMetrics.length;

              return (
                <div key={agentName} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {agentName.replace(/_/g, ' ')}
                    </h4>
                    <span className="text-sm text-gray-500">
                      {agentMetrics.length} executions
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-3 rounded ${getScoreBgColor(avgConfidence)}`}>
                      <p className="text-sm text-gray-600">Confidence</p>
                      <p className={`text-lg font-semibold ${getScoreColor(avgConfidence)}`}>
                        {formatPercentage(avgConfidence)}
                      </p>
                    </div>
                    
                    <div className={`p-3 rounded ${getScoreBgColor(successRate * 100)}`}>
                      <p className="text-sm text-gray-600">Success Rate</p>
                      <p className={`text-lg font-semibold ${getScoreColor(successRate * 100)}`}>
                        {formatPercentage(successRate * 100)}
                      </p>
                    </div>
                    
                    <div className="p-3 rounded bg-gray-100">
                      <p className="text-sm text-gray-600">Avg Time</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {formatTime(avgTime)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Evaluations */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Evaluations</h3>
        
        {evaluationHistory.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No evaluation history available. Run the test suite to generate data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Test Case
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precision
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recall
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    F1 Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {evaluationHistory.slice(0, 10).map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.testCaseId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={getScoreColor(item.result.accuracy)}>
                        {formatPercentage(item.result.accuracy)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={getScoreColor(item.result.precision * 100)}>
                        {formatPercentage(item.result.precision * 100)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={getScoreColor(item.result.recall * 100)}>
                        {formatPercentage(item.result.recall * 100)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={getScoreColor(item.result.f1Score * 100)}>
                        {formatPercentage(item.result.f1Score * 100)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={getScoreColor(item.result.confidence)}>
                        {formatPercentage(item.result.confidence)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationDashboard;