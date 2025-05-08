import { ConfidenceLevel, ReviewType, AssessmentResult, EscalationReason } from '../types';

export const CONFIDENCE_THRESHOLDS = {
  HIGH: 90,
  MEDIUM: 80,
  LOW: 0
};

export const PROCESSING_TIMES = {
  AUTO: 1,
  QUICK: 10,
  DETAILED: 25,
  SPECIALIST: 40
};

export const getConfidenceLevel = (score: number): ConfidenceLevel => {
  if (score > CONFIDENCE_THRESHOLDS.HIGH) return 'high';
  if (score > CONFIDENCE_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
};

export const getReviewType = (
  confidenceScore: number,
  claim: AssessmentResult
): { type: ReviewType; escalationReason?: EscalationReason } => {
  // If confidence is high and no other issues, auto-approve
  if (confidenceScore > CONFIDENCE_THRESHOLDS.HIGH && 
      claim.damage.confidence >= 85 && 
      !claim.damage.affectedAreas.some(area => area.confidence < 85)) {
    return { type: 'auto' };
  }

  // Check for image quality issues first
  const hasImageQualityIssues = claim.damage.affectedAreas.some(area => area.confidence < 75);
  if (hasImageQualityIssues) {
    return {
      type: 'specialist',
      escalationReason: 'data_quality'
    };
  }

  // Check for other escalation scenarios
  if (claim.damage.confidence < 70) {
    return { 
      type: 'specialist',
      escalationReason: 'data_quality'
    };
  }

  if (claim.damage.severity === 'Severe') {
    return {
      type: 'specialist',
      escalationReason: 'structural_damage'
    };
  }

  if (claim.damage.affectedAreas.length > 2) {
    return {
      type: 'specialist',
      escalationReason: 'multiple_damage'
    };
  }

  const costDeviation = Math.abs(
    (claim.repairCost.total - claim.historicalComparison.averageCost) / 
    claim.historicalComparison.averageCost
  );
  
  if (costDeviation > 0.2) {
    return {
      type: 'detailed',
      escalationReason: 'cost_anomaly'
    };
  }

  // Confidence-based routing
  if (confidenceScore > CONFIDENCE_THRESHOLDS.MEDIUM) {
    return { type: 'quick' };
  }
  return { type: 'detailed' };
};

export const getProcessingTime = (reviewType: ReviewType): number => {
  return PROCESSING_TIMES[reviewType.toUpperCase()];
};

export const getConfidenceColor = (level: ConfidenceLevel): string => {
  switch (level) {
    case 'high':
      return 'text-green-700 bg-green-50';
    case 'medium':
      return 'text-yellow-700 bg-yellow-50';
    case 'low':
      return 'text-red-700 bg-red-50';
  }
};

export const getReviewTypeLabel = (type: ReviewType): string => {
  switch (type) {
    case 'auto':
      return 'Automatic Approval';
    case 'quick':
      return 'Quick Review';
    case 'detailed':
      return 'Detailed Review';
    case 'specialist':
      return 'Specialist Review';
  }
};

export const getEscalationReasonLabel = (reason: EscalationReason): string => {
  switch (reason) {
    case 'data_quality':
      return 'Insufficient or unclear imagery';
    case 'complexity':
      return 'Complex damage pattern';
    case 'cost_anomaly':
      return 'Unusual cost estimate';
    case 'security':
      return 'Security concern';
    case 'structural_damage':
      return 'Potential structural damage';
    case 'multiple_damage':
      return 'Multiple damage areas';
    case 'fraud_suspicion':
      return 'Potential fraud indicators';
    case 'compliance':
      return 'Compliance review needed';
  }
};