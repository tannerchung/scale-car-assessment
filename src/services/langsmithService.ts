import { Client, traceable, performanceMonitor, langsmithClient } from 'langsmith';

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