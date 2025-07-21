import { ClaudeAnalysisResult } from '../types';
import { config } from '../config';
import { traceableClaudeCall, performanceMonitor } from './langsmithService';

export async function analyzeDamageWithClaude(
  imageBase64: string,
  visionResults?: any
): Promise<ClaudeAnalysisResult> {
  const startTime = Date.now();
  
  try {
    // Check if Supabase is configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, using mock Claude response');
      // Return mock data when Supabase isn't configured
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      const executionTime = Date.now() - startTime;
      await performanceMonitor.logAgentPerformance({
        agentName: 'claude_analysis_mock',
        executionTime,
        confidence: 75, // Mock confidence
        success: true
      });
      
      return getMockClaudeResponse();
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.includes('base64,') 
      ? imageBase64.split('base64,')[1]
      : imageBase64;

    // Enhance prompt with Vision API results if available
    let enhancedPrompt = `Please analyze this car image for damage. For each damaged area, provide precise coordinates as percentages relative to the image dimensions (where 0,0 is top-left and 100,100 is bottom-right).`;

    if (visionResults) {
      enhancedPrompt += `\n\nGoogle Vision API has detected the following:`;
      
      if (visionResults.vehicleData) {
        enhancedPrompt += `\nVehicle color: ${visionResults.vehicleData.color}`;
      }

      if (visionResults.damageAssessment?.affectedAreas) {
        enhancedPrompt += `\nDetected vehicle parts with locations:`;
        visionResults.damageAssessment.affectedAreas.forEach((area: any) => {
          enhancedPrompt += `\n- ${area.name} at coordinates (${area.coordinates.x.toFixed(1)}%, ${area.coordinates.y.toFixed(1)}%)`;
        });
      }

      enhancedPrompt += `\n\nPlease validate these findings and provide a more detailed damage assessment.`;
    }

    enhancedPrompt += `\n\nFormat your response as JSON with this structure:
{
  "vehicle": {
    "make": string,
    "model": string,
    "confidence": number (0-1)
  },
  "damage": {
    "description": string,
    "severity": "Minor" | "Moderate" | "Severe",
    "confidence": number (0-1),
    "affectedAreas": [{
      "name": string,
      "confidence": number (0-1),
      "coordinates": {
        "x": number (0-100),
        "y": number (0-100),
        "width": number (0-100),
        "height": number (0-100)
      }
    }]
  },
  "repairCost": {
    "estimate": number,
    "confidence": number (0-1)
  }
}

For each damaged area, carefully identify its position and size in the image. The coordinates should precisely outline the damaged region. Ensure coordinates stay within image bounds (0-100).`;

    const data = await traceableClaudeCall(base64Data, enhancedPrompt, "claude-3-opus-20240229");
    
    if (!data.content?.[0]?.text) {
      throw new Error('No analysis received from Claude');
    }

    const rawResponse = data.content[0].text;
    console.log('Raw Claude response:', rawResponse);

    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsedData = JSON.parse(jsonMatch[0]);

      if (!parsedData.vehicle || !parsedData.damage || !parsedData.repairCost) {
        throw new Error('Invalid response structure');
      }

      // Validate and adjust coordinates
      parsedData.damage.affectedAreas = parsedData.damage.affectedAreas.map((area: any) => ({
        ...area,
        coordinates: {
          x: Math.min(Math.max(area.coordinates?.x ?? 0, 0), 100),
          y: Math.min(Math.max(area.coordinates?.y ?? 0, 0), 100),
          width: Math.min(Math.max(area.coordinates?.width ?? 20, 0), 100),
          height: Math.min(Math.max(area.coordinates?.height ?? 20, 0), 100)
        }
      }));

      const executionTime = Date.now() - startTime;
      await performanceMonitor.logAgentPerformance({
        agentName: 'claude_analysis_agent',
        executionTime,
        confidence: parsedData.damage?.confidence || 0,
        success: true,
        inputTokens: Math.ceil(enhancedPrompt.length / 4), // Approximate token count
        outputTokens: Math.ceil(rawResponse.length / 4)
      });

      return parsedData;
    } catch (parseError) {
      console.error('Failed to parse Claude response:', rawResponse);
      console.error('Parse error:', parseError);

      const executionTime = Date.now() - startTime;
      await performanceMonitor.logAgentPerformance({
        agentName: 'claude_analysis_agent',
        executionTime,
        confidence: 0,
        success: false,
        errorMessage: `Parse error: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`
      });

      return {
        vehicle: {
          make: 'Unknown',
          model: 'Unknown',
          confidence: 0
        },
        damage: {
          description: 'Error parsing AI response',
          severity: 'Unknown' as any,
          confidence: 0,
          affectedAreas: []
        },
        repairCost: {
          estimate: 0,
          confidence: 0
        }
      };
    }
  } catch (error) {
    const executionTime = Date.now() - startTime;
    await performanceMonitor.logAgentPerformance({
      agentName: 'claude_analysis_agent',
      executionTime,
      confidence: 0,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    console.error("Error analyzing image with Claude:", error);
    throw error;
  }
}

export async function verifyAnthropicApiKey(): Promise<{ valid: boolean; error?: string }> {
  try {
    // Check if Supabase environment variables are configured
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      return { 
        valid: false, 
        error: 'Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to environment variables' 
      };
    }
    
    // Check if Anthropic API key is configured
    if (!import.meta.env.VITE_ANTHROPIC_API_KEY) {
      return { 
        valid: false, 
        error: 'Anthropic API key not configured in environment variables' 
      };
    }


    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/claude-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 10,
        messages: [
          {
            role: "user",
            content: "Test"
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      
      // Handle specific error cases
      if (response.status === 404) {
        return { 
          valid: false, 
          error: 'Claude proxy Edge Function not found. Deploy the claude-proxy function to your Supabase project.' 
        };
      }
      return { valid: false, error: error.error || 'API verification failed' };
    }

    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error 
        ? error.message === 'Failed to fetch' 
          ? 'Cannot connect to Supabase. Check your VITE_SUPABASE_URL or deploy the claude-proxy Edge Function.'
          : error.message
        : 'Unknown error occurred'
    };
  }
}

// Mock Claude response for when Supabase isn't configured
function getMockClaudeResponse(): ClaudeAnalysisResult {
  return {
    vehicle: {
      make: 'Toyota',
      model: 'Camry',
      confidence: 0.92
    },
    damage: {
      description: 'Front bumper damage with scratches and minor denting',
      severity: 'Moderate',
      confidence: 0.88,
      affectedAreas: [
        {
          name: 'Front Bumper',
          confidence: 0.88,
          coordinates: {
            x: 25,
            y: 45,
            width: 50,
            height: 25
          }
        },
        {
          name: 'Driver Headlight',
          confidence: 0.75,
          coordinates: {
            x: 15,
            y: 35,
            width: 20,
            height: 15
          }
        }
      ]
    },
    repairCost: {
      estimate: 2850,
      confidence: 0.82
    }
  };
}

export default {
  analyzeDamageWithClaude,
  verifyAnthropicApiKey
};