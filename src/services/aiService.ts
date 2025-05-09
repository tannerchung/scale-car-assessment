import { ClaudeAnalysisResult } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function analyzeDamageWithClaude(
  imageBase64: string,
  visionResults?: any
): Promise<ClaudeAnalysisResult> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration missing');
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
                text: enhancedPrompt
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

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze image');
    }

    const data = await response.json();
    
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

      return parsedData;
    } catch (parseError) {
      console.error('Failed to parse Claude response:', rawResponse);
      console.error('Parse error:', parseError);

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
    console.error("Error analyzing image with Claude:", error);
    throw error;
  }
}

export async function verifyAnthropicApiKey(): Promise<{ valid: boolean; error?: string }> {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return { valid: false, error: 'Supabase configuration missing' };
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/claude-proxy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
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
      return { valid: false, error: error.error || 'API verification failed' };
    }

    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

export default {
  analyzeDamageWithClaude,
  verifyAnthropicApiKey
};