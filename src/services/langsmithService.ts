import { Client } from 'langsmith';
import { traceable } from 'langsmith/traceable';

// LangSmith configuration
const langsmithClient = new Client({
  apiUrl: import.meta.env.VITE_LANGSMITH_API_URL || 'https://api.smith.langchain.com',
  apiKey: import.meta.env.VITE_LANGSMITH_API_KEY,
});

// Trace wrapper for AI service calls
export const traceableClaudeCall = traceable(
  async (
    imageBase64: string, 
    prompt: string, 
    model: string = "claude-3-opus-20240229"
  ) => {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageBase64
                }
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze image');
    }

    return await response.json();
  },
  {
    name: "claude_damage_analysis",
    client: langsmithClient,
  }
);

// Trace wrapper for Vision API calls
export const traceableVisionCall = traceable(
  async (imageData: any) => {
    // This would wrap the existing Vision API call
    const visionService = await import('./visionApiService');
    return await visionService.analyzeImage(imageData);
  },
  {
    name: "vision_api_analysis",
    client: langsmithClient,
  }
);

// Trace wrapper for agent execution
export const traceableAgentExecution = traceable(
  async (
    agentName: string,
    agentFunction: () => Promise<any>,
    context: any
  ) => {
    return await agentFunction();
  },
  {
    name: "agent_execution",
    client: langsmithClient,
  }
);

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

    // Log to LangSmith
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

// Helper function to wrap any async function with tracing
export function withTracing<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
  tags: string[] = []
): T {
  return traceable(fn, {
    name,
    client: langsmithClient,
    tags
  }) as T;
}

// Export the client for direct use
export { langsmithClient };