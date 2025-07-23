// Browser-compatible mock for langsmith library
// This prevents Node.js-specific APIs from being used in the browser

export class Client {
  constructor(config?: any) {
    // No-op constructor
  }

  async createRun(runData: any): Promise<any> {
    // No-op implementation
    return Promise.resolve({});
  }
}

export function traceable<T extends (...args: any[]) => any>(
  fn: T,
  config?: any
): T {
  // Return the original function without tracing in browser
  return fn;
}

// Mock performance monitoring
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
    // No-op in browser - just store locally
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

// Export mock implementations
export const performanceMonitor = new LangSmithMonitor();
export const langsmithClient = new Client();

// Mock traceable functions
export const traceableClaudeCall = traceable(
  async (imageBase64: string, prompt: string, model: string = "claude-3-opus-20240229") => {
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
  }
);

export const traceableVisionCall = traceable(
  async (imageData: any) => {
    const visionService = await import('./visionApiService');
    return await visionService.analyzeImage(imageData);
  }
);

export const traceableAgentExecution = traceable(
  async (agentName: string, agentFunction: () => Promise<any>, context: any) => {
    return await agentFunction();
  }
);

export function withTracing<T extends (...args: any[]) => Promise<any>>(
  name: string,
  fn: T,
  tags: string[] = []
): T {
  return traceable(fn) as T;
}