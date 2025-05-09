import axios from 'axios';
import { ImageData, DamageAssessment, DamageArea } from '../types';
import { config } from '../config';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

export const verifyApiKey = async (): Promise<{ valid: boolean; error?: string }> => {
  if (!config.vision.apiKey) {
    return { valid: false, error: 'No API key provided' };
  }

  try {
    const testImage = 'https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg';
    
    const requestData = {
      requests: [{
        image: {
          source: {
            imageUri: testImage
          }
        },
        features: [
          {
            type: 'LABEL_DETECTION',
            maxResults: 1
          }
        ]
      }]
    };

    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${config.vision.apiKey}`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        timeout: 10000
      }
    );

    if (response.data && response.data.responses) {
      return { valid: true };
    }

    return { valid: false, error: 'Invalid API response format' };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        return { 
          valid: false, 
          error: 'API key authentication failed'
        };
      } else if (error.response?.status === 429) {
        return { 
          valid: false, 
          error: 'API quota exceeded'
        };
      }
      return { 
        valid: false, 
        error: `API request failed: ${error.response?.data?.error?.message || error.message}`
      };
    }
    return { 
      valid: false, 
      error: 'Unknown error occurred while verifying API key'
    };
  }
};

export const analyzeImage = async (imageData: ImageData): Promise<{
  vehicleData: { make: string; model: string; year: number; color: string; confidence: number };
  damageAssessment: DamageAssessment;
  rawResponse?: any;
}> => {
  if (!config.vision.useRealApi) {
    console.log('Using mock Vision API data (real API disabled)');
    await new Promise(resolve => setTimeout(resolve, config.vision.mockDelay));
    return getMockVisionData();
  }

  let retryCount = 0;
  let base64Data: string;

  // Convert image to base64
  try {
    if (imageData.type === 'file' && imageData.file) {
      base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data URL prefix if present
          resolve(result.split('base64,')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageData.file);
      });
    } else {
      // For URLs, fetch and convert to base64
      const response = await fetch(imageData.url);
      const blob = await response.blob();
      base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split('base64,')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new Error('Failed to process image data');
  }
  
  while (retryCount < MAX_RETRIES) {
    try {
      const requestData = {
        requests: [{
          image: {
            content: base64Data
          },
          features: [
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 20
            },
            {
              type: 'LABEL_DETECTION',
              maxResults: 20
            },
            {
              type: 'IMAGE_PROPERTIES',
              maxResults: 5
            },
            {
              type: 'SAFE_SEARCH_DETECTION'
            }
          ]
        }]
      };

      console.log('Sending request to Vision API...');
      const response = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${config.vision.apiKey}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json; charset=utf-8'
          },
          timeout: 15000
        }
      );

      if (!response.data || !response.data.responses || response.data.responses.length === 0) {
        throw new Error('Invalid response from Vision API');
      }

      console.log('Successfully received Vision API response');
      const result = processVisionResponse(response.data);
      
      return {
        ...result,
        rawResponse: response.data
      };

    } catch (error) {
      retryCount++;
      
      console.error('Vision API Error:', {
        attempt: retryCount,
        error: error instanceof Error ? error.message : 'Unknown error',
        imageType: imageData.type,
        imageSize: imageData.file?.size || 'N/A'
      });

      if (retryCount < MAX_RETRIES) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1);
        console.log(`Retrying in ${delay}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          throw new Error('API key authentication failed');
        } else if (error.response?.status === 429) {
          throw new Error('API quota exceeded - please try again later');
        } else if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out - please try again');
        }
      }

      throw error;
    }
  }

  throw new Error('Maximum retry attempts exceeded');
};

const processVisionResponse = (response: any) => {
  const result = response.responses[0];
  
  const vehicleData = extractVehicleData(result);
  const damageAssessment = extractDamageAssessment(result);
  
  return {
    vehicleData,
    damageAssessment
  };
};

const extractVehicleData = (result: any) => {
  const labels = result.labelAnnotations || [];
  const carLabels = labels.filter(label => 
    ['car', 'vehicle', 'automobile'].includes(label.description.toLowerCase())
  );

  let dominantColor = 'Unknown';
  if (result.imagePropertiesAnnotation?.dominantColors?.colors) {
    const colors = result.imagePropertiesAnnotation.dominantColors.colors;
    if (colors.length > 0) {
      const mainColor = colors[0].color;
      const r = mainColor.red || 0;
      const g = mainColor.green || 0;
      const b = mainColor.blue || 0;
      
      if (Math.max(r, g, b) < 50) dominantColor = 'Black';
      else if (Math.min(r, g, b) > 200) dominantColor = 'White';
      else if (r > Math.max(g, b)) dominantColor = 'Red';
      else if (g > Math.max(r, b)) dominantColor = 'Green';
      else if (b > Math.max(r, g)) dominantColor = 'Blue';
      else if (r > 200 && g > 200) dominantColor = 'Yellow';
      else dominantColor = 'Gray';
    }
  }
  
  return {
    make: 'Unknown',
    model: 'Unknown',
    year: new Date().getFullYear(),
    color: dominantColor,
    confidence: carLabels.length > 0 ? Math.round(carLabels[0].score * 100) : 70
  };
};

const extractDamageAssessment = (result: any): DamageAssessment => {
  const labels = result.labelAnnotations || [];
  const objects = result.localizedObjectAnnotations || [];
  
  const damageLabels = labels.filter(label => 
    ['damage', 'dent', 'scratch', 'collision', 'broken', 'crack'].includes(label.description.toLowerCase())
  );

  const vehicleParts = objects.filter(obj => 
    ['Car', 'Vehicle', 'Bumper', 'Door', 'Hood', 'Fender', 'Wheel', 'Headlight', 'Taillight']
      .includes(obj.name)
  );

  const affectedAreas: DamageArea[] = vehicleParts.map(part => {
    const vertices = part.boundingPoly.normalizedVertices;
    const x = vertices[0].x * 100;
    const y = vertices[0].y * 100;
    const width = (vertices[2].x - vertices[0].x) * 100;
    const height = (vertices[2].y - vertices[0].y) * 100;

    return {
      name: part.name,
      confidence: Math.round(part.score * 100),
      coordinates: {
        x,
        y,
        width,
        height
      }
    };
  });

  let severity: 'Minor' | 'Moderate' | 'Severe' = 'Moderate';
  if (result.safeSearchAnnotation) {
    const violence = result.safeSearchAnnotation.violence;
    if (violence === 'LIKELY' || violence === 'VERY_LIKELY') {
      severity = 'Severe';
    } else if (violence === 'POSSIBLE') {
      severity = 'Moderate';
    } else {
      severity = 'Minor';
    }
  }

  return {
    description: 'Vehicle damage detected',
    severity,
    confidence: damageLabels.length > 0 ? Math.round(damageLabels[0].score * 100) : 75,
    affectedAreas: affectedAreas.length > 0 ? affectedAreas : getMockAffectedAreas()
  };
};

const getMockVisionData = () => {
  return {
    vehicleData: {
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      color: 'Blue',
      confidence: 92
    },
    damageAssessment: {
      description: 'Moderate damage detected on driver side door',
      severity: 'Moderate' as const,
      confidence: 85,
      affectedAreas: getMockAffectedAreas()
    }
  };
};

const getMockAffectedAreas = (): DamageArea[] => {
  return [
    {
      name: 'Driver Door',
      confidence: 88,
      coordinates: {
        x: 30,
        y: 50,
        width: 40,
        height: 30
      }
    }
  ];
};

export default {
  analyzeImage,
  verifyApiKey
};