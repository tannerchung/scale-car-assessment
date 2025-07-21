import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, Brain, Eye, Target, Shield, FileCheck } from 'lucide-react';
import { processClaimsWithLangGraph } from '../../services/langgraphService';
import { performanceMonitor } from '../../services/langsmithService';
import { AssessmentResult, ImageData } from '../../types';

interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'thinking' | 'working' | 'completed' | 'failed';
  currentTask?: string;
  confidence?: number;
  reasoning?: string;
  icon: React.ReactNode;
  executionTime?: number;
}

interface LangGraphProcessingStepProps {
  imageData: ImageData;
  onComplete: (result: AssessmentResult) => void;
  onError: (error: string) => void;
}

const LangGraphProcessingStep: React.FC<LangGraphProcessingStepProps> = ({
  imageData,
  onComplete,
  onError
}) => {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: 'vision_analysis',
      name: 'Vision Analysis Agent',
      status: 'idle',
      icon: <Eye className="h-5 w-5" />
    },
    {
      id: 'claude_analysis',
      name: 'Claude Analysis Agent', 
      status: 'idle',
      icon: <Brain className="h-5 w-5" />
    },
    {
      id: 'damage_assessment',
      name: 'Damage Assessment Agent',
      status: 'idle',
      icon: <Target className="h-5 w-5" />
    },
    {
      id: 'quality_assurance',
      name: 'Quality Assurance Agent',
      status: 'idle',
      icon: <Shield className="h-5 w-5" />
    },
    {
      id: 'final_compilation',
      name: 'Final Compilation Agent',
      status: 'idle',
      icon: <FileCheck className="h-5 w-5" />
    }
  ]);

  const [processingState, setProcessingState] = useState<{
    stage: string;
    progress: number;
    isProcessing: boolean;
    error?: string;
  }>({
    stage: 'Initializing LangGraph workflow...',
    progress: 0,
    isProcessing: false
  });

  const [performanceMetrics, setPerformanceMetrics] = useState<{
    totalTime: number;
    agentTimes: Record<string, number>;
    confidenceScores: Record<string, number>;
  }>({
    totalTime: 0,
    agentTimes: {},
    confidenceScores: {}
  });

  useEffect(() => {
    startProcessing();
  }, [imageData]);

  const updateAgentStatus = (agentId: string, updates: Partial<AgentStatus>) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, ...updates } : agent
    ));
  };

  const simulateAgentProgress = async () => {
    const agentSequence = [
      'vision_analysis',
      'claude_analysis', 
      'damage_assessment',
      'quality_assurance',
      'final_compilation'
    ];

    for (let i = 0; i < agentSequence.length; i++) {
      const agentId = agentSequence[i];
      const agent = agents.find(a => a.id === agentId);
      
      if (!agent) continue;

      // Mark agent as working
      updateAgentStatus(agentId, {
        status: 'thinking',
        currentTask: `Analyzing ${agent.name.toLowerCase()}...`
      });

      setProcessingState(prev => ({
        ...prev,
        stage: `${agent.name} is processing...`,
        progress: ((i + 0.5) / agentSequence.length) * 100
      }));

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

      // Mark as working
      updateAgentStatus(agentId, {
        status: 'working',
        currentTask: `Executing ${agent.name.toLowerCase()}...`
      });

      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

      // Mark as completed with mock confidence
      const confidence = 75 + Math.random() * 20; // 75-95%
      updateAgentStatus(agentId, {
        status: 'completed',
        confidence,
        reasoning: `Completed with ${confidence.toFixed(1)}% confidence`,
        executionTime: 2000 + Math.random() * 3000
      });

      setProcessingState(prev => ({
        ...prev,
        progress: ((i + 1) / agentSequence.length) * 100
      }));
    }
  };

  const startProcessing = async () => {
    const startTime = Date.now();

    setProcessingState({
      stage: 'Starting LangGraph workflow...',
      progress: 0,
      isProcessing: true
    });

    try {
      // Start the visual progress simulation
      const progressPromise = simulateAgentProgress();

      // Start the actual LangGraph processing
      const result = await processClaimsWithLangGraph(imageData);

      // Wait for the visual progress to complete
      await progressPromise;

      const totalTime = Date.now() - startTime;

      // Get performance metrics
      const metrics = performanceMonitor.getMetrics();
      const recentMetrics = metrics.slice(-5); // Get last 5 agent executions
      
      const agentTimes: Record<string, number> = {};
      const confidenceScores: Record<string, number> = {};

      recentMetrics.forEach(metric => {
        agentTimes[metric.agentName] = metric.executionTime;
        confidenceScores[metric.agentName] = metric.confidence;
      });

      setPerformanceMetrics({
        totalTime,
        agentTimes,
        confidenceScores
      });

      setProcessingState({
        stage: 'Processing completed successfully!',
        progress: 100,
        isProcessing: false
      });

      setTimeout(() => {
        onComplete(result);
      }, 1000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setProcessingState({
        stage: 'Processing failed',
        progress: 0,
        isProcessing: false,
        error: errorMessage
      });

      // Mark all incomplete agents as failed
      setAgents(prev => prev.map(agent => 
        agent.status !== 'completed' 
          ? { ...agent, status: 'failed' as const }
          : agent
      ));

      onError(errorMessage);
    }
  };

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'idle': return 'text-gray-400';
      case 'thinking': return 'text-blue-500';
      case 'working': return 'text-yellow-500';
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusBg = (status: AgentStatus['status']) => {
    switch (status) {
      case 'idle': return 'bg-gray-100';
      case 'thinking': return 'bg-blue-100';
      case 'working': return 'bg-yellow-100';
      case 'completed': return 'bg-green-100';
      case 'failed': return 'bg-red-100';
      default: return 'bg-gray-100';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          LangGraph Multi-Agent Processing
        </h2>
        <p className="text-gray-600">
          Advanced workflow orchestration with specialized AI agents
        </p>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {processingState.isProcessing ? (
              <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
            ) : processingState.error ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            <span className="font-medium text-gray-900">{processingState.stage}</span>
          </div>
          <span className="text-sm text-gray-500">
            {processingState.progress.toFixed(0)}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${processingState.progress}%` }}
          />
        </div>

        {processingState.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{processingState.error}</p>
          </div>
        )}
      </div>

      {/* Agent Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <div 
            key={agent.id}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              agent.status === 'working' ? 'border-blue-300 shadow-md' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className={`p-2 rounded-full ${getStatusBg(agent.status)}`}>
                <div className={getStatusColor(agent.status)}>
                  {agent.icon}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm">{agent.name}</h3>
                <p className={`text-xs capitalize ${getStatusColor(agent.status)}`}>
                  {agent.status === 'thinking' || agent.status === 'working' ? (
                    <span className="flex items-center">
                      <span className="animate-pulse mr-1">●</span>
                      {agent.status}
                    </span>
                  ) : (
                    agent.status
                  )}
                </p>
              </div>
            </div>

            {agent.currentTask && (
              <div className="mb-2">
                <p className="text-xs text-gray-600">{agent.currentTask}</p>
              </div>
            )}

            {agent.confidence !== undefined && (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Confidence</span>
                  <span className={`font-medium ${
                    agent.confidence >= 90 ? 'text-green-600' :
                    agent.confidence >= 75 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {agent.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className={`h-1 rounded-full ${
                      agent.confidence >= 90 ? 'bg-green-500' :
                      agent.confidence >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${agent.confidence}%` }}
                  />
                </div>
              </div>
            )}

            {agent.executionTime && (
              <div className="text-xs text-gray-500">
                Execution: {agent.executionTime.toFixed(0)}ms
              </div>
            )}

            {agent.reasoning && (
              <div className="mt-2 text-xs text-gray-600 italic">
                {agent.reasoning}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      {performanceMetrics.totalTime > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {(performanceMetrics.totalTime / 1000).toFixed(1)}s
              </p>
              <p className="text-sm text-gray-500">Total Processing Time</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {Object.keys(performanceMetrics.agentTimes).length}
              </p>
              <p className="text-sm text-gray-500">Agents Executed</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {Object.values(performanceMetrics.confidenceScores).length > 0
                  ? (Object.values(performanceMetrics.confidenceScores).reduce((a, b) => a + b, 0) / 
                     Object.values(performanceMetrics.confidenceScores).length).toFixed(1)
                  : '0'}%
              </p>
              <p className="text-sm text-gray-500">Average Confidence</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LangGraphProcessingStep;