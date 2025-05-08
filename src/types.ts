export interface ImageData {
  file?: File;
  url: string;
  type: 'file' | 'url';
  name: string;
}

export interface VehicleMetadata {
  make: string;
  model: string;
  year: number;
  color: string;
  confidence: number;
}

export interface DamageAssessment {
  description: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
  confidence: number;
  affectedAreas: DamageArea[];
}

export interface DamageArea {
  name: string;
  confidence: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface RepairCost {
  total: number;
  breakdown: CostItem[];
  region: {
    name: string;
    laborRate: number;
    partsCostIndex: number; // 1.0 is baseline, higher means more expensive
    averageCost: number;
  };
}

export interface CostItem {
  category: string;
  description: string;
  cost: number;
  color: string;
}

export interface HistoricalComparison {
  averageCost: number;
  percentileRank: number;
  similarClaims: number;
}

export interface ClaimImage {
  url: string;
  type: 'damage' | 'overview' | 'detail';
  timestamp: string;
  metadata?: {
    width: number;
    height: number;
    size: number;
  };
}

export interface AssessmentResult {
  id: string;
  timestamp: string;
  vehicle: VehicleMetadata;
  damage: DamageAssessment;
  repairCost: RepairCost;
  historicalComparison: HistoricalComparison;
  status: ClaimStatus;
  imageUrl: string;
  images?: ClaimImage[]; // Array of claim images
  aiConfidence: {
    level: ConfidenceLevel;
    score: number;
    needsHumanReview: boolean;
    reviewType: ReviewType;
    processingTime: number;
    escalationReason?: EscalationReason;
  };
}

export type ClaimStatus = 'pending' | 'processing' | 'approved' | 'rejected';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type ReviewType = 'auto' | 'quick' | 'detailed' | 'specialist';

export type EscalationReason = 
  | 'data_quality'
  | 'complexity'
  | 'cost_anomaly'
  | 'security'
  | 'structural_damage'
  | 'multiple_damage'
  | 'fraud_suspicion'
  | 'compliance';