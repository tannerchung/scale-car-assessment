// Browser-compatible mock for langsmith library main module

// Re-export components from sub-modules to make this a comprehensive mock
export { RunTree, convertToDottedOrderFormat, isRunTree } from './run_trees';
export { traceable } from './traceable';
export { getCurrentRunTree } from './singletons/traceable';

export function getDefaultProjectName(): string {
  // Mock implementation - returns a default project name
  return 'default-project';
}

class Client {
  constructor(config?: any) {
    // No-op constructor
  }

  async createRun(runData: any): Promise<any> {
    // No-op implementation
    return Promise.resolve({});
  }
}

export { Client };

// Performance monitoring
export interface PerformanceMetrics {
  agentName: string;
  executionTime: number;
  confidence: number;
  success: boolean;
  errorMessage?: string;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
}

export class LangSmithMonitor {
  private metrics: PerformanceMetrics[] = [];

  async logAgentPerformance(metrics: PerformanceMetrics) {
    this.metrics.push({
      ...metrics,
      timestamp: Date.now()
    } as any);

    // Log to LangSmith (mock - does nothing)
    try {
      await langsmithClient.createRun({
        name: `agent_performance_${metrics.agentName}`,
        run_type: 'llm',
        inputs: { context: 'agent_performance_tracking' },
        outputs: { metrics },
        start_time: Date.now() - metrics.executionTime,
        end_time: Date.now(),
        tags: ['agent_performance', metrics.agentName],
        extra: {
          confidence: metrics.confidence,
          success: metrics.success,
          cost: metrics.cost
        }
      });
    } catch (error) {
      console.warn('Failed to log to LangSmith:', error);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  getAverageConfidence(agentName?: string): number {
    const filteredMetrics = agentName 
      ? this.metrics.filter(m => m.agentName === agentName)
      : this.metrics;
    
    if (filteredMetrics.length === 0) return 0;
    
    return filteredMetrics.reduce((sum, m) => sum + m.confidence, 0) / filteredMetrics.length;
  }

  getSuccessRate(agentName?: string): number {
    const filteredMetrics = agentName 
      ? this.metrics.filter(m => m.agentName === agentName)
      : this.metrics;
    
    if (filteredMetrics.length === 0) return 0;
    
    return filteredMetrics.filter(m => m.success).length / filteredMetrics.length;
  }

  getAverageExecutionTime(agentName?: string): number {
    const filteredMetrics = agentName 
      ? this.metrics.filter(m => m.agentName === agentName)
      : this.metrics;
    
    if (filteredMetrics.length === 0) return 0;
    
    return filteredMetrics.reduce((sum, m) => sum + m.executionTime, 0) / filteredMetrics.length;
  }
}

// Singleton monitor instance
export const performanceMonitor = new LangSmithMonitor();

// LangSmith configuration
export const langsmithClient = new Client({
  apiUrl: import.meta.env.VITE_LANGSMITH_API_URL || 'https://api.smith.langchain.com',
  apiKey: import.meta.env.VITE_LANGSMITH_API_KEY,
});