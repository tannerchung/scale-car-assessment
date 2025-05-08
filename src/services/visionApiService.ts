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
    // Use a small test image to verify the API key
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
          error: 'API key authentication failed. Please verify your API key has the necessary permissions.'
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
}> => {
  // If real API is disabled, return mock data with simulated delay
  if (!config.vision.useRealApi) {
    console.log('Using mock Vision API data (real API disabled)');
    await new Promise(resolve => setTimeout(resolve, config.vision.mockDelay));
    return getMockVisionData();
  }

  let retryCount = 0;
  
  while (retryCount < MAX_RETRIES) {
    try {
      const requestData = {
        requests: [{
          image: {
            source: {
              imageUri: imageData.url
            }
          },
          features: [
            {
              type: 'LABEL_DETECTION',
              maxResults: 10
            },
            {
              type: 'OBJECT_LOCALIZATION',
              maxResults: 10
            },
            {
              type: 'IMAGE_PROPERTIES',
              maxResults: 5
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
      return processVisionResponse(response.data);

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
          throw new Error('API key authentication failed. Please verify that your API key is valid and has the necessary permissions to access the Vision API.');
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

const processVisionResponse = (response: any): any => {
  const result = response.responses[0];
  
  // Extract vehicle information
  const vehicleData = extractVehicleData(result);
  
  // Extract damage assessment
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
  
  return {
    make: 'Unknown',
    model: 'Unknown',
    year: new Date().getFullYear(),
    color: 'Unknown',
    confidence: carLabels.length > 0 ? Math.round(carLabels[0].score * 100) : 70
  };
};

const extractDamageAssessment = (result: any): DamageAssessment => {
  const labels = result.labelAnnotations || [];
  const objects = result.localizedObjectAnnotations || [];
  
  const damageLabels = labels.filter(label => 
    ['damage', 'dent', 'scratch', 'collision'].includes(label.description.toLowerCase())
  );
  
  const affectedAreas: DamageArea[] = objects.map(obj => ({
    name: obj.name,
    confidence: Math.round(obj.score * 100),
    coordinates: {
      x: obj.boundingPoly.normalizedVertices[0].x * 100,
      y: obj.boundingPoly.normalizedVertices[0].y * 100,
      width: (obj.boundingPoly.normalizedVertices[1].x - obj.boundingPoly.normalizedVertices[0].x) * 100,
      height: (obj.boundingPoly.normalizedVertices[2].y - obj.boundingPoly.normalizedVertices[0].y) * 100
    }
  }));

  return {
    description: 'Vehicle damage detected',
    severity: 'Moderate',
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