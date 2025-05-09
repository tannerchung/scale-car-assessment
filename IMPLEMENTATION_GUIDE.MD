# Implementation Guide for Auto Insurance Claims Assessment

This document provides a technical overview of how the AI-powered claims assessment system is implemented, highlighting key design decisions and the reasoning behind them.

## System Overview

The Auto Insurance Claims Assessment system is designed as a React single-page application with advanced AI capabilities. The system integrates multiple AI models (Claude and Google Vision API) to provide comprehensive damage assessment of vehicle images.

## Frontend Architecture

### Component Structure

The application follows a well-organized component structure:

```
src/
├── components/          # Reusable UI components
│   ├── layout/          # Layout-related components (Header, Navigation)
│   ├── results/         # Assessment result visualization components
│   ├── steps/           # Claim submission workflow steps
│   └── upload/          # File upload related components
├── context/             # React Context for state management
├── pages/               # Route-level page components
├── store/               # Zustand stores for state management
├── services/            # API services for Vision API and Claude
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Key Design Patterns

1. **Multi-step Form**: The claim submission process is broken down into discrete steps (upload, preview, processing, results), making the complex process more manageable.

2. **Component Composition**: UI components are designed to be composable, with larger components built from smaller, reusable pieces.

3. **Context API & Zustand**: State management is handled with both React Context and Zustand, providing a clean way to share claim data across components without prop drilling.

4. **Provider Selection**: The system supports using Claude AI, Google Vision API, or both together, configurable via the Settings UI.

5. **Mock Services**: AI functionality can be simulated with mock data generation, allowing the UI to be developed and tested without real backend services.

## AI Implementation Details

### Multi-model AI Architecture

The system is designed to work with multiple AI models, with three configuration options:

1. **Claude AI Only**: Uses only Claude for image analysis
2. **Google Vision API Only**: Uses only Google Vision API 
3. **Both Models**: Combines results from both services for enhanced accuracy

This architecture is implemented in the settings store:

```typescript
// src/store/settingsStore.ts
export const useSettingsStore = create<SettingsState>((set) => ({
  activeAiProvider: config.aiProviders.active as AIProvider,
  setActiveAiProvider: (provider) => {
    localStorage.setItem('activeAiProvider', provider);
    set({ activeAiProvider: provider });
  },
  // Other settings...
}));
```

And the provider selection is used during image processing:

```typescript
// src/components/steps/ProcessingStep.tsx (simplified)
if (activeAiProvider === 'vision' || activeAiProvider === 'both') {
  results.vision = await analyzeImage(imageData);
}

if (activeAiProvider === 'claude' || activeAiProvider === 'both') {
  results.claude = await analyzeDamageWithClaude(base64Data);
}
```

### Claude AI Integration

Claude is integrated via a Supabase Edge Function that proxies requests to Anthropic's API:

```typescript
// supabase/functions/claude-proxy/index.ts
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('Missing Anthropic API key');
    }

    // Process request and forward to Anthropic
    const body = await req.json();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    // Return response
    // ...
  } catch (error) {
    // Handle errors
    // ...
  }
});
```

The frontend service that calls Claude:

```typescript
// src/services/aiService.ts
export async function analyzeDamageWithClaude(imageBase64: string): Promise<ClaudeAnalysisResult> {
  try {
    // Remove data URL prefix if present
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/claude-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Please analyze this car image for damage...` // Detailed prompt here
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Data
                }
              }
            ]
          }
        ]
      })
    });

    // Process and validate response
    // ...
    
    return parsedData;
  } catch (error) {
    console.error("Error analyzing image with Claude:", error);
    throw error;
  }
}
```

### Damage Detection & Classification

In production, damage detection uses one or both AI models:

#### Vision API Implementation

```typescript
// src/services/visionApiService.ts
export const analyzeImage = async (imageData: ImageData): Promise<{
  vehicleData: { make: string; model: string; year: number; color: string; confidence: number };
  damageAssessment: DamageAssessment;
}> => {
  // If real API is disabled, return mock data with simulated delay
  if (!config.vision.useRealApi) {
    console.log('Using mock Vision API data (real API disabled)');
    await new Promise(resolve => setTimeout(resolve, config.vision.mockDelay));
    return getMockVisionData();
  }

  // Real API implementation
  // ...
}
```

#### Claude AI Implementation

Claude analyzes the image with detailed instructions and returns a structured JSON result:

```typescript
// Response structure from Claude
{
  "vehicle": {
    "make": string,
    "model": string,
    "confidence": number // 0-1
  },
  "damage": {
    "description": string,
    "severity": "Minor" | "Moderate" | "Severe",
    "confidence": number, // 0-1
    "affectedAreas": [{
      "name": string,
      "confidence": number, // 0-1
      "coordinates": {
        "x": number, // 0-100
        "y": number, // 0-100
        "width": number, // 0-100
        "height": number // 0-100
      }
    }]
  },
  "repairCost": {
    "estimate": number,
    "confidence": number // 0-1
  }
}
```

### Debug Mode Features

The system includes debug features for both AI models:

```typescript
// src/store/settingsStore.ts
export const useSettingsStore = create<SettingsState>((set) => ({
  // AI provider selection
  // ...
  
  visionApiDebug: config.vision.debugMode,
  setVisionApiDebug: (enabled) => {
    localStorage.setItem('visionApiDebug', enabled.toString());
    set({ visionApiDebug: enabled });
  },
  
  anthropicApiDebug: config.anthropic.debugMode,
  setAnthropicApiDebug: (enabled) => {
    localStorage.setItem('anthropicApiDebug', enabled.toString());
    set({ anthropicApiDebug: enabled });
  },
  
  // Error tracking
  apiErrors: {
    vision: null,
    claude: null
  },
  setApiError: (provider, error) => set((state) => ({
    apiErrors: {
      ...state.apiErrors,
      [provider]: error ? {
        ...error,
        timestamp: Date.now()
      } : null
    }
  }))
}));
```

These debug modes show detailed logging in the UI:

```typescript
// src/components/results/DamageAssessment.tsx
{anthropicApiDebug && aiResults?.claude && (
  <div className="mt-4 border-t border-gray-200 pt-4">
    <div className="flex items-center mb-2">
      <Bug className="h-4 w-4 text-purple-500 mr-2" />
      <h4 className="text-sm font-medium text-gray-900">Claude Analysis Debug</h4>
    </div>
    <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-auto max-h-48">
      {JSON.stringify(aiResults.claude, null, 2)}
    </pre>
  </div>
)}
```

### Confidence Scoring System

The confidence scoring system determines how claims are routed:

```typescript
// src/utils/confidenceUtils.ts
export const getReviewType = (
  confidenceScore: number,
  claim: AssessmentResult
): { type: ReviewType; escalationReason?: EscalationReason } => {
  // Auto-approve high confidence claims with no issues
  if (confidenceScore > CONFIDENCE_THRESHOLDS.HIGH && 
      claim.damage.confidence >= 85 && 
      !claim.damage.affectedAreas.some(area => area.confidence < 85)) {
    return { type: 'auto' };
  }

  // Check for image quality issues
  const hasImageQualityIssues = claim.damage.affectedAreas.some(area => area.confidence < 75);
  if (hasImageQualityIssues) {
    return {
      type: 'specialist',
      escalationReason: 'data_quality'
    };
  }

  // Check for other escalation scenarios
  // ...

  // Confidence-based routing
  if (confidenceScore > CONFIDENCE_THRESHOLDS.MEDIUM) {
    return { type: 'quick' };
  }
  return { type: 'detailed' };
};
```

### Merging Multi-model Results

When both AI models are enabled, the results are merged:

```typescript
// src/components/steps/ResultsStep.tsx
const mergeVisionResults = (baseResult: AssessmentResult, visionResults: any) => {
  if (visionResults.vehicleData) {
    baseResult.vehicle = {
      ...baseResult.vehicle,
      ...visionResults.vehicleData,
    };
  }

  if (visionResults.damageAssessment) {
    baseResult.damage = {
      ...baseResult.damage,
      ...visionResults.damageAssessment,
    };
  }
};

const mergeClaudeResults = (baseResult: AssessmentResult, claudeResults: any) => {
  if (claudeResults.vehicle) {
    baseResult.vehicle = {
      ...baseResult.vehicle,
      make: claudeResults.vehicle.make || baseResult.vehicle.make,
      model: claudeResults.vehicle.model || baseResult.vehicle.model,
      confidence: Math.round(claudeResults.vehicle.confidence * 100) || baseResult.vehicle.confidence,
    };
  }

  if (claudeResults.damage) {
    // Ensure coordinates are properly formatted
    const affectedAreas: DamageArea[] = claudeResults.damage.affectedAreas.map((area: any) => ({
      name: area.name,
      confidence: Math.round(area.confidence * 100),
      coordinates: {
        x: Math.min(Math.max(area.coordinates?.x ?? 0, 0), 100),
        y: Math.min(Math.max(area.coordinates?.y ?? 0, 0), 100),
        width: Math.min(Math.max(area.coordinates?.width ?? 20, 0), 100 - (area.coordinates?.x ?? 0)),
        height: Math.min(Math.max(area.coordinates?.height ?? 20, 0), 100 - (area.coordinates?.y ?? 0))
      }
    }));

    baseResult.damage = {
      description: claudeResults.damage.description || baseResult.damage.description,
      severity: claudeResults.damage.severity || baseResult.damage.severity,
      confidence: Math.round(claudeResults.damage.confidence * 100) || baseResult.damage.confidence,
      affectedAreas
    };
  }

  // Merge cost estimation data
  // ...
};
```

## Cost Estimation Model

The cost estimation component integrates Claude's cost prediction:

```typescript
if (claudeResults.repairCost?.estimate) {
  const estimatedCost = claudeResults.repairCost.estimate;
  baseResult.repairCost.total = estimatedCost;
  
  // Distribute the cost across categories
  baseResult.repairCost.breakdown = baseResult.repairCost.breakdown.map((item, index) => {
    const percentages = [0.4, 0.35, 0.15, 0.1]; // Parts, Labor, Paint, Misc
    return {
      ...item,
      cost: Math.round(estimatedCost * percentages[index])
    };
  });

  // Update historical comparison
  baseResult.historicalComparison.averageCost = Math.round(estimatedCost * 0.9);
}
```

## Data Visualization

The application includes several data visualization components:

1. **Damage Overlay**: Highlights detected damage areas on the vehicle image with color-coded confidence indicators

```typescript
// src/components/DamageOverlay.tsx
return (
  <div className="absolute inset-0 pointer-events-none">
    {areas.map((area, index) => {
      // ...
      const confidenceColor = area.confidence >= 85 
        ? 'border-green-500 bg-green-500/20'
        : area.confidence >= 70
          ? 'border-yellow-500 bg-yellow-500/20'
          : 'border-red-500 bg-red-500/20';

      const labelColor = area.confidence >= 85
        ? 'bg-green-500'
        : area.confidence >= 70
          ? 'bg-yellow-500'
          : 'bg-red-500';

      return (
        <div
          key={index}
          className={`absolute border-2 ${confidenceColor} rounded-md transition-all duration-200`}
          style={style}
        >
          <div className={`absolute -top-6 left-0 ${labelColor} text-white text-xs px-2 py-1 rounded whitespace-nowrap`}>
            {area.name} ({area.confidence}%)
          </div>
        </div>
      );
    })}
  </div>
);
```

2. **Cost Breakdown**: Displays repair costs by category with interactive pie chart

3. **Historical Comparison**: Shows how the current claim compares to similar historical claims

4. **Confidence Indicators**: Visual indicators of AI confidence levels

## Mock Data Strategy

The system uses a sophisticated mock data generation approach for development and testing:

```typescript
// src/mockData.ts
export const generateMockResult = (overrideStatus?: ClaimStatus, overrideConfidence?: number): AssessmentResult => {
  // Generate a random ID
  const id = Math.random().toString(36).substring(2, 15);
  
  // Generate vehicle data
  // ...
  
  // Generate damage data with realistic confidence scores
  // ...
  
  // Generate repair cost estimate with regional factors
  // ...
  
  return claim;
};
```

The mock mode can be enabled in the configuration:

```typescript
// src/config.ts
export const config = {
  vision: {
    useRealApi: true, // Set to false for mock mode
    apiKey: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY,
    // ...
  },
  anthropic: {
    useRealApi: true, // Set to false for mock mode
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    // ...
  },
  // ...
};
```

## Future Implementation Considerations

### Enhanced Claude Integration

1. **Multi-image Analysis**: Process multiple views of the same damage
   ```typescript
   // Future implementation:
   export async function analyzeMultipleImages(images: string[]): Promise<ClaudeAnalysisResult> {
     // Create a multi-image prompt for Claude
     // Return comprehensive result
   }
   ```

2. **Improved Prompting**: Fine-tune the prompts for Claude to provide more accurate results
   ```typescript
   const enhancedPrompt = `
     You are an expert auto damage assessor. Analyze these ${images.length} images of vehicle damage.
     For each image, identify the specific damage areas with precise coordinates...
   `;
   ```

3. **Streaming Results**: Implement streaming response from Claude for faster initial results
   ```typescript
   // Future implementation with streaming
   const streamingResponse = await fetch(`${SUPABASE_URL}/functions/v1/claude-stream`, {
     // Streaming configuration
   });
   ```

### Combined Model Improvements

1. **Weighted Confidence Scoring**: Implement a smarter algorithm to combine confidence scores from both models
   ```typescript
   function getWeightedConfidence(visionResult, claudeResult) {
     // Use weighted average based on each model's strengths
     return (visionResult.confidence * 0.4) + (claudeResult.confidence * 0.6);
   }
   ```

2. **Enhanced Vision API Integration**: Use Vision API's specialized features to complement Claude
   ```typescript
   // Use Vision API's object detection to guide Claude's analysis
   const detectedParts = await detectVehicleParts(imageData);
   const enhancedClaudeResult = await analyzeWithClaude(imageData, detectedParts);
   ```

3. **Progressive Enhancement**: Fall back gracefully when services are unavailable
   ```typescript
   try {
     result = await analyzeWithClaude(imageData);
   } catch (error) {
     console.error("Claude API error:", error);
     result = await fallbackToVisionAPI(imageData);
   }
   ```

## Technical Debt and Improvements

Current areas that would need enhancement for production:

1. **Error Handling**: More robust error handling throughout the application
2. **API Reliability**: Implement retries and circuit breakers for API calls
3. **Progressive Loading**: Show partial results as they become available
4. **API Cost Optimization**: Implement caching and request batching to reduce API costs
5. **Integration Testing**: Comprehensive tests for the integration between multiple AI models

## Deployment Strategy

For a production deployment, consider:

1. **API Security**: Properly secure all API keys using environment variables and server-side proxying
2. **Edge Functions**: Deploy Supabase Edge Functions for secure API proxying
3. **State Management**: Consider server-state management solutions like React Query for API data
4. **Model Caching**: Implement caching for AI model responses to reduce costs and improve performance
5. **A/B Testing**: Test different confidence thresholds and model combinations to optimize accuracy
