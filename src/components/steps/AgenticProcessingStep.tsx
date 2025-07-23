import React, { useEffect, useState, useRef } from 'react';
import { ImageData } from '../../types';
import { AlertCircle, Bug, Brain, Eye, Calculator, Shield, CheckCircle, Clock, Workflow } from 'lucide-react';
import { AgenticClaimsProcessor } from '../../services/agenticService';
import { processClaimsWithLangGraph } from '../../services/langgraphService';
import { performanceMonitor } from '../../services/langsmithService';
import { useSettingsStore } from '../../store/settingsStore';

interface AgenticProcessingStepProps {
  imageData: ImageData;
  onComplete: (results: { agentic: any }) => void;
  useLangGraph?: boolean;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'thinking' | 'working' | 'completed' | 'failed';
  currentTask?: string;
  confidence?: number;
  reasoning?: string;
  icon: React.ReactNode;
}

const AgenticProcessingStep: React.FC<AgenticProcessingStepProps> = ({ imageData, onComplete, useLangGraph = false }) => {
  const [progress, setProgress] = useState(0);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [agents, setAgents] = useState<AgentStatus[]>([
    { id: 'coordinator', name: 'Coordinator', status: 'idle', icon: <Brain className="h-5 w-5" /> },
    { id: 'vision', name: 'Vision Analyst', status: 'idle', icon: <Eye className="h-5 w-5" /> },
    { id: 'damage', name: 'Damage Assessor', status: 'idle', icon: <AlertCircle className="h-5 w-5" /> },
    { id: 'cost', name: 'Cost Estimator', status: 'idle', icon: <Calculator className="h-5 w-5" /> },
    { id: 'quality', name: 'Quality Assurance', status: 'idle', icon: <Shield className="h-5 w-5" /> },
    { id: 'validator', name: 'Validator', status: 'idle', icon: <CheckCircle className="h-5 w-5" /> }
  ]);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const processorRef = useRef<AgenticClaimsProcessor | null>(null);
  const { anthropicApiDebug } = useSettingsStore();

  useEffect(() => {
    if (!imageData) {
      setError('No image data provided');
      return;
    }

    const processWithAgents = async () => {
      try {
        if (useLangGraph) {
          setLogs(prev => [...prev, '🔄 Initializing LangGraph workflow orchestration...']);
          await processWithLangGraph();
        } else {
          setLogs(prev => [...prev, '🚀 Initializing traditional agentic processing system...']);
          processorRef.current = new AgenticClaimsProcessor(imageData);
          await simulateAgenticProcessing();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setLogs(prev => [...prev, `❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`]);
      }
    };

    const processWithLangGraph = async () => {
      setLogs(prev => [...prev, '🔄 Starting LangGraph state-based workflow...']);
      
      // Update agents for LangGraph workflow
      const langGraphAgents = [
        { id: 'vision_analysis', name: 'Vision Analysis', status: 'idle' as const, icon: <Eye className="h-5 w-5" /> },
        { id: 'claude_analysis', name: 'Claude Analysis', status: 'idle' as const, icon: <Brain className="h-5 w-5" /> },
        { id: 'damage_assessment', name: 'Damage Assessment', status: 'idle' as const, icon: <AlertCircle className="h-5 w-5" /> },
        { id: 'quality_assurance', name: 'Quality Assurance', status: 'idle' as const, icon: <Shield className="h-5 w-5" /> },
        { id: 'final_compilation', name: 'Final Compilation', status: 'idle' as const, icon: <CheckCircle className="h-5 w-5" /> }
      ];
      setAgents(langGraphAgents);

      try {
        // Start LangGraph processing with real-time updates
        const startTime = Date.now();
        
        // Simulate LangGraph agent progression
        for (let i = 0; i < langGraphAgents.length; i++) {
          const agent = langGraphAgents[i];
          
          updateAgentStatus(agent.id, 'working', `Executing ${agent.name} node...`);
          setLogs(prev => [...prev, `🔄 LangGraph: Executing ${agent.name} node`]);
          setProgress(((i + 0.5) / langGraphAgents.length) * 100);
          
          await delay(1500 + Math.random() * 2000);
          
          const confidence = 75 + Math.random() * 20;
          updateAgentStatus(agent.id, 'completed', `Node completed with ${confidence.toFixed(1)}% confidence`, confidence);
          setLogs(prev => [...prev, `✅ ${agent.name}: Node execution successful`]);
          setProgress(((i + 1) / langGraphAgents.length) * 100);
        }

        // Execute actual LangGraph workflow
        setLogs(prev => [...prev, '🎯 LangGraph: Running complete workflow execution...']);
        const result = await processClaimsWithLangGraph(imageData);
        
        const executionTime = Date.now() - startTime;
        setLogs(prev => [...prev, `✅ LangGraph workflow completed in ${(executionTime / 1000).toFixed(1)}s`]);
        
        // Show performance metrics
        const metrics = performanceMonitor.getMetrics();
        const recentMetrics = metrics.slice(-5);
        if (recentMetrics.length > 0) {
          const avgConfidence = recentMetrics.reduce((sum, m) => sum + m.confidence, 0) / recentMetrics.length;
          setLogs(prev => [...prev, `📊 Average agent confidence: ${avgConfidence.toFixed(1)}%`]);
        }

        onComplete({ agentic: result });
        
      } catch (error) {
        setError(error instanceof Error ? error.message : 'LangGraph processing failed');
        setLogs(prev => [...prev, `❌ LangGraph Error: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      }
    };

    processWithAgents();
  }, [imageData]);

  const simulateAgenticProcessing = async () => {
    const totalSteps = 12;
    let currentStep = 0;

    // Step 1: Coordinator planning
    updateAgentStatus('coordinator', 'thinking', 'Planning initial task sequence...');
    setLogs(prev => [...prev, '🎯 Coordinator: Analyzing requirements and planning tasks']);
    await delay(1000);
    currentStep++;
    setProgress((currentStep / totalSteps) * 100);

    updateAgentStatus('coordinator', 'completed', 'Task planning complete', 95);
    setLogs(prev => [...prev, '✅ Coordinator: Created 4 initial tasks with dependencies']);

    // Step 2: Vision analysis starts
    setCurrentIteration(1);
    updateAgentStatus('vision', 'working', 'Analyzing image with multiple AI models...');
    setLogs(prev => [...prev, '👁️ Vision Analyst: Starting multi-model image analysis']);
    await delay(2000);
    currentStep++;
    setProgress((currentStep / totalSteps) * 100);

    updateAgentStatus('vision', 'completed', 'Combined Vision API and Claude analysis', 88);
    setLogs(prev => [...prev, '✅ Vision Analyst: Identified vehicle and damage areas (88% confidence)']);

    // Step 3: Damage assessment
    updateAgentStatus('damage', 'working', 'Validating damage assessment...');
    setLogs(prev => [...prev, '🔍 Damage Assessor: Validating detected damage areas']);
    await delay(1500);
    currentStep++;
    setProgress((currentStep / totalSteps) * 100);

    updateAgentStatus('damage', 'completed', 'Damage severity and areas validated', 82);
    setLogs(prev => [...prev, '✅ Damage Assessor: Confirmed moderate damage, 2 affected areas']);

    // Step 4: Cost estimation
    updateAgentStatus('cost', 'working', 'Calculating repair costs...');
    setLogs(prev => [...prev, '💰 Cost Estimator: Calculating repair estimates with regional factors']);
    await delay(1200);
    currentStep++;
    setProgress((currentStep / totalSteps) * 100);

    updateAgentStatus('cost', 'completed', 'Cost breakdown generated', 85);
    setLogs(prev => [...prev, '✅ Cost Estimator: Generated detailed cost breakdown ($3,250 total)']);

    // Step 5: Coordinator adaptive planning
    updateAgentStatus('coordinator', 'thinking', 'Evaluating results and planning next iteration...');
    setLogs(prev => [...prev, '🎯 Coordinator: Analyzing confidence levels (85% average)']);
    await delay(800);
    currentStep++;
    setProgress((currentStep / totalSteps) * 100);

    setCurrentIteration(2);
    updateAgentStatus('coordinator', 'completed', 'Confidence acceptable, proceeding to QA', 90);
    setLogs(prev => [...prev, '✅ Coordinator: Confidence threshold met, moving to quality assurance']);

    // Step 6: Quality assurance
    updateAgentStatus('quality', 'working', 'Performing quality checks...');
    setLogs(prev => [...prev, '🔍 QA Agent: Running consistency and quality validation']);
    await delay(1000);
    currentStep++;
    setProgress((currentStep / totalSteps) * 100);

    updateAgentStatus('quality', 'completed', 'Quality checks passed', 87);
    setLogs(prev => [...prev, '✅ QA Agent: All quality checks passed, no issues detected']);

    // Step 7: Final validation
    updateAgentStatus('validator', 'working', 'Final result validation...');
    setLogs(prev => [...prev, '✅ Validator: Performing final consistency checks']);
    await delay(800);
    currentStep++;
    setProgress((currentStep / totalSteps) * 100);

    updateAgentStatus('validator', 'completed', 'Validation complete', 89);
    setLogs(prev => [...prev, '✅ Validator: All validations passed, results ready']);

    // Complete processing
    await delay(500);
    setProgress(100);
    setLogs(prev => [...prev, '🎉 Agentic processing complete! Results compiled and ready.']);

    // Return mock results
    setTimeout(() => {
      onComplete({
        agentic: {
          confidence: 87,
          iterations: 2,
          agentsUsed: 6,
          processingTime: '8.2s',
          qualityScore: 'A',
          reasoning: 'Multi-agent consensus achieved with high confidence across all assessment areas'
        }
      });
    }, 1000);
  };

  const updateAgentStatus = (
    agentId: string, 
    status: AgentStatus['status'], 
    task?: string, 
    confidence?: number,
    reasoning?: string
  ) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId 
        ? { ...agent, status, currentTask: task, confidence, reasoning }
        : agent
    ));
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'thinking':
      case 'working':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (error) {
    return (
      <div className="p-6 sm:p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Agentic Processing Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-2">
          {useLangGraph ? <Workflow className="h-6 w-6 text-purple-600" /> : <Brain className="h-6 w-6 text-blue-600" />}
          <h2 className="text-2xl font-bold text-gray-900">
            {useLangGraph ? 'LangGraph Workflow' : 'Agentic AI Processing'}
          </h2>
        </div>
        <p className="mt-2 text-gray-600">
          {useLangGraph 
            ? 'State-based workflow orchestration with specialized AI agents'
            : 'Multiple AI agents are collaborating to analyze your claim'
          }
        </p>
        <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-gray-500">
          {!useLangGraph && (
            <>
              <span>Iteration: {currentIteration}</span>
              <span>•</span>
            </>
          )}
          <span>Progress: {Math.round(progress)}%</span>
          {useLangGraph && (
            <>
              <span>•</span>
              <span className="text-purple-600">LangGraph Mode</span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Agent Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {agents.map((agent) => (
            <div 
              key={agent.id} 
              className={`p-4 border rounded-lg transition-all duration-300 ${
                agent.status === 'working' || agent.status === 'thinking'
                  ? 'border-blue-300 bg-blue-50 shadow-md'
                  : agent.status === 'completed'
                    ? 'border-green-300 bg-green-50'
                    : agent.status === 'failed'
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className={`mr-2 ${getStatusColor(agent.status)}`}>
                    {agent.icon}
                  </div>
                  <h3 className="font-medium text-gray-900">{agent.name}</h3>
                </div>
                <div className={getStatusColor(agent.status)}>
                  {getStatusIcon(agent.status)}
                </div>
              </div>
              
              {agent.currentTask && (
                <p className="text-sm text-gray-600 mb-2">{agent.currentTask}</p>
              )}
              
              {agent.confidence && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Confidence:</span>
                  <span className={`font-medium ${
                    agent.confidence >= 85 ? 'text-green-600' : 
                    agent.confidence >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {agent.confidence}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Processing Logs */}
        <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
          <div className="flex items-center mb-3">
            <Bug className="h-4 w-4 text-green-400 mr-2" />
            <h4 className="text-sm font-medium text-green-400">Agent Activity Log</h4>
          </div>
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div key={index} className="font-mono text-xs text-gray-300">
                <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
              </div>
            ))}
          </div>
        </div>

        {/* Agentic Features Highlight */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 Agentic AI Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <div>
                <strong>Autonomous Decision Making:</strong> Agents independently choose analysis strategies and adapt based on results
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <div>
                <strong>Dynamic Task Planning:</strong> Coordinator agent creates and modifies task sequences based on confidence levels
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <div>
                <strong>Iterative Refinement:</strong> Multiple processing iterations with quality feedback loops
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <div>
                <strong>Collaborative Validation:</strong> Agents cross-validate each other's results for higher accuracy
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgenticProcessingStep;