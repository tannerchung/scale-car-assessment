import { AssessmentResult, DamageArea } from '../types';
import { performanceMonitor, PerformanceMetrics } from './langsmithService';

// Evaluation metrics interfaces
export interface EvaluationResult {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confidence: number;
  details: EvaluationDetails;
}

export interface EvaluationDetails {
  vehicleIdentificationAccuracy: number;
  damageDetectionAccuracy: number;
  costEstimationAccuracy: number;
  coordinateAccuracy: number;
  falsePositives: number;
  falseNegatives: number;
  truePositives: number;
  trueNegatives: number;
}

export interface GroundTruth {
  vehicle: {
    make: string;
    model: string;
    year: number;
    color: string;
  };
  damage: {
    description: string;
    severity: 'Minor' | 'Moderate' | 'Severe';
    affectedAreas: DamageArea[];
  };
  repairCost: {
    total: number;
    breakdown: Array<{
      category: string;
      cost: number;
    }>;
  };
}

export interface TestCase {
  id: string;
  imageData: any;
  groundTruth: GroundTruth;
  description: string;
  tags: string[];
}

// Evaluation metrics calculator
export class ClaimsEvaluator {
  private testCases: TestCase[] = [];
  private evaluationHistory: Array<{
    timestamp: number;
    result: EvaluationResult;
    testCaseId: string;
  }> = [];

  // Add test cases for evaluation
  addTestCase(testCase: TestCase): void {
    this.testCases.push(testCase);
  }

  addTestCases(testCases: TestCase[]): void {
    this.testCases.push(...testCases);
  }

  // Evaluate vehicle identification accuracy
  private evaluateVehicleIdentification(
    predicted: AssessmentResult['vehicle'],
    groundTruth: GroundTruth['vehicle']
  ): number {
    let score = 0;
    let maxScore = 4; // make, model, year, color

    if (predicted.make.toLowerCase() === groundTruth.make.toLowerCase()) score += 1;
    if (predicted.model.toLowerCase() === groundTruth.model.toLowerCase()) score += 1;
    if (Math.abs(predicted.year - groundTruth.year) <= 1) score += 1; // Allow 1 year tolerance
    if (predicted.color.toLowerCase() === groundTruth.color.toLowerCase()) score += 1;

    return (score / maxScore) * 100;
  }

  // Evaluate damage detection accuracy
  private evaluateDamageDetection(
    predicted: AssessmentResult['damage'],
    groundTruth: GroundTruth['damage']
  ): { accuracy: number; details: any } {
    let score = 0;
    let maxScore = 0;

    // Severity accuracy (30% weight)
    maxScore += 30;
    if (predicted.severity === groundTruth.severity) {
      score += 30;
    } else {
      // Partial credit for adjacent severity levels
      const severityLevels = ['Minor', 'Moderate', 'Severe'];
      const predictedIndex = severityLevels.indexOf(predicted.severity);
      const truthIndex = severityLevels.indexOf(groundTruth.severity);
      if (Math.abs(predictedIndex - truthIndex) === 1) {
        score += 15; // Half credit for adjacent levels
      }
    }

    // Affected areas accuracy (70% weight)
    maxScore += 70;
    const areaScore = this.evaluateAffectedAreas(
      predicted.affectedAreas,
      groundTruth.affectedAreas
    );
    score += areaScore.accuracy * 0.7;

    return {
      accuracy: (score / maxScore) * 100,
      details: {
        severityCorrect: predicted.severity === groundTruth.severity,
        areaEvaluation: areaScore
      }
    };
  }

  // Evaluate affected areas with IoU (Intersection over Union)
  private evaluateAffectedAreas(
    predicted: DamageArea[],
    groundTruth: DamageArea[]
  ): { accuracy: number; iou: number; matched: number; total: number } {
    if (groundTruth.length === 0) {
      return {
        accuracy: predicted.length === 0 ? 100 : 0,
        iou: predicted.length === 0 ? 1 : 0,
        matched: 0,
        total: 0
      };
    }

    let totalIoU = 0;
    let matchedAreas = 0;
    const threshold = 0.5; // IoU threshold for considering a match

    for (const truthArea of groundTruth) {
      let bestIoU = 0;
      
      for (const predArea of predicted) {
        const iou = this.calculateIoU(
          predArea.coordinates,
          truthArea.coordinates
        );
        bestIoU = Math.max(bestIoU, iou);
      }
      
      totalIoU += bestIoU;
      if (bestIoU >= threshold) {
        matchedAreas++;
      }
    }

    const avgIoU = totalIoU / groundTruth.length;
    const accuracy = (matchedAreas / groundTruth.length) * 100;

    return {
      accuracy,
      iou: avgIoU,
      matched: matchedAreas,
      total: groundTruth.length
    };
  }

  // Calculate Intersection over Union for bounding boxes
  private calculateIoU(
    box1: { x: number; y: number; width: number; height: number },
    box2: { x: number; y: number; width: number; height: number }
  ): number {
    // Calculate intersection
    const x1 = Math.max(box1.x, box2.x);
    const y1 = Math.max(box1.y, box2.y);
    const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
    const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

    if (x2 <= x1 || y2 <= y1) {
      return 0; // No intersection
    }

    const intersection = (x2 - x1) * (y2 - y1);
    const area1 = box1.width * box1.height;
    const area2 = box2.width * box2.height;
    const union = area1 + area2 - intersection;

    return intersection / union;
  }

  // Evaluate cost estimation accuracy
  private evaluateCostEstimation(
    predicted: AssessmentResult['repairCost'],
    groundTruth: GroundTruth['repairCost']
  ): number {
    if (groundTruth.total === 0) return predicted.total === 0 ? 100 : 0;
    
    const error = Math.abs(predicted.total - groundTruth.total);
    const relativeError = error / groundTruth.total;
    
    // Score based on relative error (100% if exact, 0% if >50% error)
    return Math.max(0, (1 - relativeError * 2) * 100);
  }

  // Main evaluation function
  async evaluateAssessment(
    predicted: AssessmentResult,
    groundTruth: GroundTruth,
    testCaseId: string
  ): Promise<EvaluationResult> {
    const vehicleAccuracy = this.evaluateVehicleIdentification(
      predicted.vehicle,
      groundTruth.vehicle
    );

    const damageEvaluation = this.evaluateDamageDetection(
      predicted.damage,
      groundTruth.damage
    );

    const costAccuracy = this.evaluateCostEstimation(
      predicted.repairCost,
      groundTruth.repairCost
    );

    // Calculate coordinate accuracy from damage areas
    const coordinateAccuracy = damageEvaluation.details.areaEvaluation.iou * 100;

    // Calculate overall metrics
    const accuracy = (vehicleAccuracy + damageEvaluation.accuracy + costAccuracy) / 3;
    
    // For precision/recall, we need to define what constitutes TP, FP, FN, TN
    const { truePositives, falsePositives, falseNegatives, trueNegatives } = 
      this.calculateConfusionMatrix(predicted, groundTruth);

    const precision = truePositives / (truePositives + falsePositives) || 0;
    const recall = truePositives / (truePositives + falseNegatives) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    const result: EvaluationResult = {
      accuracy,
      precision,
      recall,
      f1Score,
      confidence: predicted.confidence,
      details: {
        vehicleIdentificationAccuracy: vehicleAccuracy,
        damageDetectionAccuracy: damageEvaluation.accuracy,
        costEstimationAccuracy: costAccuracy,
        coordinateAccuracy,
        falsePositives,
        falseNegatives,
        truePositives,
        trueNegatives
      }
    };

    // Store evaluation result
    this.evaluationHistory.push({
      timestamp: Date.now(),
      result,
      testCaseId
    });

    return result;
  }

  // Calculate confusion matrix for damage detection
  private calculateConfusionMatrix(
    predicted: AssessmentResult,
    groundTruth: GroundTruth
  ): { truePositives: number; falsePositives: number; falseNegatives: number; trueNegatives: number } {
    const predictedAreas = predicted.damage.affectedAreas.length;
    const truthAreas = groundTruth.damage.affectedAreas.length;
    
    // Simplified confusion matrix calculation
    // In a real implementation, this would be more sophisticated
    const matched = Math.min(predictedAreas, truthAreas);
    
    return {
      truePositives: matched,
      falsePositives: Math.max(0, predictedAreas - truthAreas),
      falseNegatives: Math.max(0, truthAreas - predictedAreas),
      trueNegatives: 0 // Not applicable for this use case
    };
  }

  // Batch evaluation
  async evaluateTestSuite(
    evaluationFunction: (imageData: any) => Promise<AssessmentResult>
  ): Promise<{
    overall: EvaluationResult;
    individual: Array<{ testCase: TestCase; result: EvaluationResult }>;
  }> {
    const results = [];

    for (const testCase of this.testCases) {
      try {
        const predicted = await evaluationFunction(testCase.imageData);
        const evaluation = await this.evaluateAssessment(
          predicted,
          testCase.groundTruth,
          testCase.id
        );
        results.push({ testCase, result: evaluation });
      } catch (error) {
        console.error(`Evaluation failed for test case ${testCase.id}:`, error);
        // Create a zero-score result for failed cases
        results.push({
          testCase,
          result: {
            accuracy: 0,
            precision: 0,
            recall: 0,
            f1Score: 0,
            confidence: 0,
            details: {
              vehicleIdentificationAccuracy: 0,
              damageDetectionAccuracy: 0,
              costEstimationAccuracy: 0,
              coordinateAccuracy: 0,
              falsePositives: 0,
              falseNegatives: 1,
              truePositives: 0,
              trueNegatives: 0
            }
          }
        });
      }
    }

    // Calculate overall metrics
    const overall = this.calculateOverallMetrics(results.map(r => r.result));

    return { overall, individual: results };
  }

  // Calculate overall metrics from individual results
  private calculateOverallMetrics(results: EvaluationResult[]): EvaluationResult {
    if (results.length === 0) {
      return {
        accuracy: 0,
        precision: 0,
        recall: 0,
        f1Score: 0,
        confidence: 0,
        details: {
          vehicleIdentificationAccuracy: 0,
          damageDetectionAccuracy: 0,
          costEstimationAccuracy: 0,
          coordinateAccuracy: 0,
          falsePositives: 0,
          falseNegatives: 0,
          truePositives: 0,
          trueNegatives: 0
        }
      };
    }

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

    return {
      accuracy: avg(results.map(r => r.accuracy)),
      precision: avg(results.map(r => r.precision)),
      recall: avg(results.map(r => r.recall)),
      f1Score: avg(results.map(r => r.f1Score)),
      confidence: avg(results.map(r => r.confidence)),
      details: {
        vehicleIdentificationAccuracy: avg(results.map(r => r.details.vehicleIdentificationAccuracy)),
        damageDetectionAccuracy: avg(results.map(r => r.details.damageDetectionAccuracy)),
        costEstimationAccuracy: avg(results.map(r => r.details.costEstimationAccuracy)),
        coordinateAccuracy: avg(results.map(r => r.details.coordinateAccuracy)),
        falsePositives: sum(results.map(r => r.details.falsePositives)),
        falseNegatives: sum(results.map(r => r.details.falseNegatives)),
        truePositives: sum(results.map(r => r.details.truePositives)),
        trueNegatives: sum(results.map(r => r.details.trueNegatives))
      }
    };
  }

  // Get evaluation history
  getEvaluationHistory(): Array<{
    timestamp: number;
    result: EvaluationResult;
    testCaseId: string;
  }> {
    return this.evaluationHistory;
  }

  // Get test cases
  getTestCases(): TestCase[] {
    return this.testCases;
  }

  // Clear evaluation history
  clearHistory(): void {
    this.evaluationHistory = [];
  }

  // Generate sample test cases for development
  generateSampleTestCases(): TestCase[] {
    return [
      {
        id: 'test_001',
        imageData: { base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' },
        groundTruth: {
          vehicle: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'Silver'
          },
          damage: {
            description: 'Front bumper damage with minor scratches',
            severity: 'Minor',
            affectedAreas: [{
              name: 'Front Bumper',
              confidence: 90,
              coordinates: { x: 20, y: 30, width: 40, height: 25 }
            }]
          },
          repairCost: {
            total: 1200,
            breakdown: [
              { category: 'Parts', cost: 600 },
              { category: 'Labor', cost: 400 },
              { category: 'Paint', cost: 200 }
            ]
          }
        },
        description: 'Minor front bumper damage on silver Toyota Camry',
        tags: ['minor_damage', 'front_end', 'toyota']
      },
      {
        id: 'test_002',
        imageData: { base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' },
        groundTruth: {
          vehicle: {
            make: 'Honda',
            model: 'Civic',
            year: 2019,
            color: 'Blue'
          },
          damage: {
            description: 'Severe side impact damage with door deformation',
            severity: 'Severe',
            affectedAreas: [
              {
                name: 'Driver Door',
                confidence: 95,
                coordinates: { x: 10, y: 35, width: 30, height: 40 }
              },
              {
                name: 'Rear Door',
                confidence: 85,
                coordinates: { x: 35, y: 35, width: 25, height: 40 }
              }
            ]
          },
          repairCost: {
            total: 8500,
            breakdown: [
              { category: 'Parts', cost: 4500 },
              { category: 'Labor', cost: 3000 },
              { category: 'Paint', cost: 1000 }
            ]
          }
        },
        description: 'Severe side impact damage on blue Honda Civic',
        tags: ['severe_damage', 'side_impact', 'honda']
      }
    ];
  }
}

// Singleton evaluator instance
export const claimsEvaluator = new ClaimsEvaluator();

// Initialize with sample test cases in development
if (import.meta.env.DEV) {
  claimsEvaluator.addTestCases(claimsEvaluator.generateSampleTestCases());
}