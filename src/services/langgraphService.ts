import { StateGraph, END, START } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { performanceMonitor, traceableAgentExecution } from './langsmithService';
import { AssessmentResult, ImageData, DamageArea, AgentTask } from '../types';

// Define the state interface for the workflow
export interface ClaimsProcessingState {
  imageData?: ImageData;
  visionResult?: any;
  claudeResult?: any;
  damageAssessment?: Partial<AssessmentResult>;
  confidenceScore?: number;
  tasks: AgentTask[];
  currentIteration: number;
  maxIterations: number;
  flags: {
    needsHumanReview: boolean;
    qualityIssues: string[];
    uncertainties: string[];
  };
  finalResult?: AssessmentResult;
  error?: string;
}

// Agent node functions
export class LangGraphAgents {
  
  // Vision Analysis Agent
  static async visionAnalysisAgent(state: ClaimsProcessingState): Promise<Partial<ClaimsProcessingState>> {
    const startTime = Date.now();
    
    try {
      const result = await traceableAgentExecution(
        'vision_analysis_agent',
        async () => {
          const visionService = await import('./visionApiService');
          return await visionService.analyzeImage(state.imageData!);
        },
        state
      );

      const executionTime = Date.now() - startTime;
      
      await performanceMonitor.logAgentPerformance({
        agentName: 'vision_analysis_agent',
        executionTime,
        confidence: result.vehicleData?.confidence || 0,
        success: true,
        inputTokens: 0, // Vision API doesn't use tokens
        outputTokens: 0
      });

      return {
        visionResult: result,
        confidenceScore: result.vehicleData?.confidence || 0
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await performanceMonitor.logAgentPerformance({
        agentName: 'vision_analysis_agent',
        executionTime,
        confidence: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        error: `Vision analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        flags: {
          ...state.flags,
          qualityIssues: [...state.flags.qualityIssues, 'vision_analysis_failed']
        }
      };
    }
  }

  // Claude Analysis Agent
  static async claudeAnalysisAgent(state: ClaimsProcessingState): Promise<Partial<ClaimsProcessingState>> {
    const startTime = Date.now();
    
    try {
      const result = await traceableAgentExecution(
        'claude_analysis_agent',
        async () => {
          const aiService = await import('./aiService');
          
          // Convert imageData to base64 if needed
          let imageBase64 = '';
          let mediaType = 'image/jpeg'; // default
          if (state.imageData) {
            if (state.imageData.base64) {
              // Already has base64 data
              imageBase64 = state.imageData.base64;
              // Try to detect media type from data URL prefix
              if (state.imageData.base64.startsWith('data:image/')) {
                const match = state.imageData.base64.match(/data:(image\/[^;]+)/);
                if (match) {
                  mediaType = match[1];
                }
              }
            } else if (state.imageData.file) {
              // Convert File to base64
              mediaType = state.imageData.file.type || 'image/jpeg';
              imageBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const result = reader.result as string;
                  // Remove data URL prefix if present
                  const base64 = result.includes(',') ? result.split(',')[1] : result;
                  resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(state.imageData!.file!);
              });
            } else if (state.imageData.url) {
              // Convert URL to base64
              const response = await fetch(state.imageData.url);
              const blob = await response.blob();
              mediaType = blob.type || 'image/jpeg';
              imageBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                  const result = reader.result as string;
                  // Remove data URL prefix if present
                  const base64 = result.includes(',') ? result.split(',')[1] : result;
                  resolve(base64);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            }
          }
          
          if (!imageBase64) {
            throw new Error('No valid image data available for Claude analysis');
          }
          
          return await aiService.analyzeDamageWithClaude(imageBase64, mediaType);
        },
        state
      );

      const executionTime = Date.now() - startTime;
      
      await performanceMonitor.logAgentPerformance({
        agentName: 'claude_analysis_agent',
        executionTime,
        confidence: result.damage?.confidence || 0,
        success: true,
        inputTokens: 1000, // Estimated
        outputTokens: 500   // Estimated
      });

      return {
        claudeResult: result,
        confidenceScore: Math.max(state.confidenceScore || 0, result.damage?.confidence || 0)
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await performanceMonitor.logAgentPerformance({
        agentName: 'claude_analysis_agent',
        executionTime,
        confidence: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        error: `Claude analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        flags: {
          ...state.flags,
          qualityIssues: [...state.flags.qualityIssues, 'claude_analysis_failed']
        }
      };
    }
  }

  // Damage Assessment Agent
  static async damageAssessmentAgent(state: ClaimsProcessingState): Promise<Partial<ClaimsProcessingState>> {
    const startTime = Date.now();
    
    try {
      const result = await traceableAgentExecution(
        'damage_assessment_agent',
        async () => {
          // Combine results from vision and claude
          const assessment: Partial<AssessmentResult> = {
            vehicle: {
              make: state.claudeResult?.vehicle?.make || state.visionResult?.vehicleData?.make || 'Unknown',
              model: state.claudeResult?.vehicle?.model || state.visionResult?.vehicleData?.model || 'Unknown',
              year: state.visionResult?.vehicleData?.year || 2020,
              color: state.visionResult?.vehicleData?.color || 'Unknown',
              confidence: Math.max(
                state.claudeResult?.vehicle?.confidence || 0,
                state.visionResult?.vehicleData?.confidence || 0
              )
            },
            damage: {
              description: state.claudeResult?.damage?.description || 'Damage detected',
              severity: state.claudeResult?.damage?.severity || 'Moderate',
              confidence: state.claudeResult?.damage?.confidence || 75,
              affectedAreas: state.claudeResult?.damage?.affectedAreas || []
            }
          };

          return assessment;
        },
        state
      );

      const executionTime = Date.now() - startTime;
      
      await performanceMonitor.logAgentPerformance({
        agentName: 'damage_assessment_agent',
        executionTime,
        confidence: result.damage?.confidence || 0,
        success: true
      });

      return {
        damageAssessment: result,
        confidenceScore: result.damage?.confidence || 0
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await performanceMonitor.logAgentPerformance({
        agentName: 'damage_assessment_agent',
        executionTime,
        confidence: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        error: `Damage assessment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Quality Assurance Agent
  static async qualityAssuranceAgent(state: ClaimsProcessingState): Promise<Partial<ClaimsProcessingState>> {
    const startTime = Date.now();
    
    try {
      const result = await traceableAgentExecution(
        'quality_assurance_agent',
        async () => {
          const qualityIssues: string[] = [];
          const uncertainties: string[] = [];
          
          // Check confidence thresholds
          if ((state.confidenceScore || 0) < 75) {
            qualityIssues.push('low_confidence_score');
          }
          
          // Check if we have both vision and claude results
          if (!state.visionResult && !state.claudeResult) {
            qualityIssues.push('no_ai_analysis_completed');
          }
          
          // Check damage assessment quality
          if (state.damageAssessment?.damage?.affectedAreas?.length === 0) {
            uncertainties.push('no_damage_areas_detected');
          }
          
          // Check vehicle identification quality
          if (state.damageAssessment?.vehicle?.confidence && state.damageAssessment.vehicle.confidence < 70) {
            uncertainties.push('uncertain_vehicle_identification');
          }

          return {
            qualityIssues,
            uncertainties,
            needsHumanReview: qualityIssues.length > 0 || (state.confidenceScore || 0) < 85
          };
        },
        state
      );

      const executionTime = Date.now() - startTime;
      
      await performanceMonitor.logAgentPerformance({
        agentName: 'quality_assurance_agent',
        executionTime,
        confidence: result.needsHumanReview ? 0 : 100,
        success: true
      });

      return {
        flags: {
          needsHumanReview: result.needsHumanReview,
          qualityIssues: [...state.flags.qualityIssues, ...result.qualityIssues],
          uncertainties: [...state.flags.uncertainties, ...result.uncertainties]
        }
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await performanceMonitor.logAgentPerformance({
        agentName: 'quality_assurance_agent',
        executionTime,
        confidence: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        error: `Quality assurance failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Final Compilation Agent
  static async finalCompilationAgent(state: ClaimsProcessingState): Promise<Partial<ClaimsProcessingState>> {
    const startTime = Date.now();
    
    try {
      const result = await traceableAgentExecution(
        'final_compilation_agent',
        async () => {
          const mockData = await import('../mockData');
          const baseResult = mockData.generateMockResult();
          
          // Merge all results into final assessment
          const finalResult: AssessmentResult = {
            ...baseResult,
            ...state.damageAssessment,
            vehicle: {
              ...baseResult.vehicle,
              ...state.damageAssessment?.vehicle
            },
            damage: {
              ...baseResult.damage,
              ...state.damageAssessment?.damage
            },
            repairCost: {
              ...baseResult.repairCost,
              total: state.claudeResult?.repairCost?.estimate || baseResult.repairCost.total
            },
            confidence: state.confidenceScore || 0,
            reviewType: state.flags.needsHumanReview ? 'detailed' : 'auto'
          };

          return finalResult;
        },
        state
      );

      const executionTime = Date.now() - startTime;
      
      await performanceMonitor.logAgentPerformance({
        agentName: 'final_compilation_agent',
        executionTime,
        confidence: state.confidenceScore || 0,
        success: true
      });

      return {
        finalResult: result
      };
    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await performanceMonitor.logAgentPerformance({
        agentName: 'final_compilation_agent',
        executionTime,
        confidence: 0,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        error: `Final compilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Conditional routing functions
function shouldContinueProcessing(state: ClaimsProcessingState): string {
  if (state.error) {
    return END;
  }
  
  if (state.currentIteration >= state.maxIterations) {
    return "final_compilation";
  }
  
  if (state.confidenceScore && state.confidenceScore >= 85) {
    return "quality_assurance";
  }
  
  return "damage_assessment";
}

function shouldRunQualityAssurance(state: ClaimsProcessingState): string {
  if (state.error) {
    return END;
  }
  
  return "final_compilation";
}

// Create the LangGraph workflow
export function createClaimsProcessingWorkflow() {
  const workflow = new StateGraph<ClaimsProcessingState>({
    channels: {
      imageData: null,
      visionResult: null,
      claudeResult: null,
      damageAssessment: null,
      confidenceScore: null,
      tasks: {
        default: () => []
      },
      currentIteration: {
        default: () => 0
      },
      maxIterations: {
        default: () => 3
      },
      flags: {
        default: () => ({
          needsHumanReview: false,
          qualityIssues: [],
          uncertainties: []
        })
      },
      finalResult: null,
      error: null
    },
    recursionLimit: 50
  });

  // Add nodes
  workflow.addNode("vision_analysis", LangGraphAgents.visionAnalysisAgent);
  workflow.addNode("claude_analysis", LangGraphAgents.claudeAnalysisAgent);
  workflow.addNode("damage_assessment", LangGraphAgents.damageAssessmentAgent);
  workflow.addNode("quality_assurance", LangGraphAgents.qualityAssuranceAgent);
  workflow.addNode("final_compilation", LangGraphAgents.finalCompilationAgent);

  // Add edges
  workflow.addEdge(START, "vision_analysis");
  workflow.addEdge("vision_analysis", "claude_analysis");
  workflow.addConditionalEdges("claude_analysis", shouldContinueProcessing);
  workflow.addConditionalEdges("damage_assessment", shouldContinueProcessing);
  workflow.addConditionalEdges("quality_assurance", shouldRunQualityAssurance);
  workflow.addEdge("final_compilation", END);

  return workflow.compile();
}

// Main execution function
export async function processClaimsWithLangGraph(imageData: ImageData): Promise<AssessmentResult> {
  const workflow = createClaimsProcessingWorkflow();
  
  const initialState: ClaimsProcessingState = {
    imageData,
    tasks: [],
    currentIteration: 0,
    maxIterations: 3,
    flags: {
      needsHumanReview: false,
      qualityIssues: [],
      uncertainties: []
    }
  };

  try {
    const result = await workflow.invoke(initialState);
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    if (!result.finalResult) {
      throw new Error('No final result generated');
    }
    
    return result.finalResult;
  } catch (error) {
    console.error('LangGraph workflow execution failed:', error);
    throw error;
  }
}