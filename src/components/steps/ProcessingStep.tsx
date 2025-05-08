import React, { useEffect, useState, useRef } from 'react';
import { ImageData } from '../../types';
import { AlertCircle, Bug } from 'lucide-react';
import { config } from '../../config';
import { analyzeImage } from '../../services/visionApiService';

interface ProcessingStepProps {
  imageData: ImageData;
  onComplete: () => void;
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({ imageData, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [apiLogs, setApiLogs] = useState<string[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Validate imageData before proceeding
    if (!imageData) {
      setError('No image data provided');
      return;
    }

    const processImage = async () => {
      try {
        if (config.vision.debugMode) {
          setApiLogs(prev => [...prev, 'Starting image analysis...']);
          if (config.vision.useRealApi) {
            setApiLogs(prev => [...prev, 'Using real Vision API']);
          } else {
            setApiLogs(prev => [...prev, 'Using mock data (API disabled)']);
          }
        }

        const result = await analyzeImage(imageData);

        if (config.vision.debugMode) {
          setApiLogs(prev => [
            ...prev,
            'Analysis complete',
            'Vehicle data:',
            JSON.stringify(result.vehicleData, null, 2),
            'Damage assessment:',
            JSON.stringify(result.damageAssessment, null, 2)
          ]);
        }

        // Continue with progress simulation
        const tasks = [
          'Initializing AI models...',
          'Analyzing vehicle type...',
          'Detecting damage areas...',
          'Assessing damage severity...',
          'Calculating repair estimates...',
          'Comparing with historical data...',
          'Finalizing report...'
        ];
        
        let taskIndex = 0;
        setCurrentTask(tasks[taskIndex]);
        
        const interval = window.setInterval(() => {
          setProgress(prev => {
            const newProgress = prev + Math.random() * 2.5;
            
            if (newProgress > 15 && taskIndex === 0) {
              taskIndex++;
              setCurrentTask(tasks[taskIndex]);
            } else if (newProgress > 30 && taskIndex === 1) {
              taskIndex++;
              setCurrentTask(tasks[taskIndex]);
            } else if (newProgress > 45 && taskIndex === 2) {
              taskIndex++;
              setCurrentTask(tasks[taskIndex]);
            } else if (newProgress > 60 && taskIndex === 3) {
              taskIndex++;
              setCurrentTask(tasks[taskIndex]);
            } else if (newProgress > 75 && taskIndex === 4) {
              taskIndex++;
              setCurrentTask(tasks[taskIndex]);
            } else if (newProgress > 90 && taskIndex === 5) {
              taskIndex++;
              setCurrentTask(tasks[taskIndex]);
            }
            
            if (newProgress >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                onComplete();
              }, 500);
              return 100;
            }
            
            return newProgress;
          });
        }, 200);
        
        intervalRef.current = interval;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        if (config.vision.debugMode) {
          setApiLogs(prev => [...prev, `Error: ${err instanceof Error ? err.message : 'Unknown error'}`]);
        }
      }
    };

    processImage();
    
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [imageData, onComplete]);

  // If there's an error, show error state
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
                  Processing Error
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
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-gray-900">Processing Your Image</h2>
        <p className="mt-2 text-gray-600">
          Please wait while our AI analyzes your vehicle damage
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-700">{currentTask}</span>
          <span className="text-sm font-medium text-blue-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="relative">
            <div className={`p-4 border rounded-lg ${progress >= 30 ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  progress >= 30 ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-400'
                }`}>
                  {progress >= 30 ? '✓' : '1'}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${progress >= 30 ? 'text-green-800' : 'text-gray-500'}`}>
                    Vehicle Identification
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className={`p-4 border rounded-lg ${progress >= 60 ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  progress >= 60 ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-400'
                }`}>
                  {progress >= 60 ? '✓' : '2'}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${progress >= 60 ? 'text-green-800' : 'text-gray-500'}`}>
                    Damage Assessment
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className={`p-4 border rounded-lg ${progress >= 90 ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  progress >= 90 ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-400'
                }`}>
                  {progress >= 90 ? '✓' : '3'}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-medium ${progress >= 90 ? 'text-green-800' : 'text-gray-500'}`}>
                    Cost Estimation
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {config.vision.debugMode && apiLogs.length > 0 && (
          <div className="mt-8 border border-blue-200 rounded-lg overflow-hidden">
            <div className="bg-blue-50 px-4 py-2 flex items-center">
              <Bug className="h-4 w-4 text-blue-500 mr-2" />
              <h4 className="text-sm font-medium text-blue-700">API Debug Logs</h4>
            </div>
            <div className="bg-gray-900 p-4 max-h-60 overflow-y-auto">
              {apiLogs.map((log, index) => (
                <div key={index} className="font-mono text-xs text-gray-300">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <div className="animate-pulse flex space-x-2 items-center">
            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animation-delay-200"></div>
            <div className="h-2 w-2 bg-blue-600 rounded-full animation-delay-400"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStep;