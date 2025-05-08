import { AssessmentResult, ClaimStatus, ReviewType, EscalationReason } from './types';
import { getConfidenceLevel, getReviewType, getProcessingTime } from './utils/confidenceUtils';

const baseCost = 5000;

const categories = [
  { category: 'Parts', color: '#4299E1' },
  { category: 'Labor', color: '#68D391' },
  { category: 'Paint', color: '#F6AD55' },
  { category: 'Miscellaneous', color: '#CBD5E0' }
];

const claimImages = [
  'https://dynamicpaintnpanel.com.au/wp-content/uploads/2024/03/Front-end-damage-mazda-DPP-collision-repair-crash-repair-adelaide.png',
  'https://i.redd.it/car-door-side-panel-accident-v0-1i8fdy379nre1.jpg?width=4032&format=pjpg&auto=webp&s=06741fa9248a199d6c11417222a31fc71c3fd08c',
  'https://images.pexels.com/photos/29654093/pexels-photo-29654093/free-photo-of-yellow-car-with-damaged-rear-bumper-in-sunlight.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://markscollisionrepairnc.com/wp-content/uploads/2023/12/iStock-465663510-feat.jpg',
  'https://images.pexels.com/photos/24960483/pexels-photo-24960483/free-photo-of-the-side-of-a-car-with-scratches-on-the-front-fender.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
];

export const generateMockResult = (overrideStatus?: ClaimStatus, overrideConfidence?: number): AssessmentResult => {
  // Generate a random ID
  const id = Math.random().toString(36).substring(2, 15);
  
  // Vehicle makes, models and colors
  const makes = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Tesla'];
  const models = {
    'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot'],
    'Ford': ['F-150', 'Mustang', 'Explorer', 'Escape'],
    'BMW': ['3 Series', '5 Series', 'X3', 'X5'],
    'Mercedes': ['C-Class', 'E-Class', 'GLC', 'GLE'],
    'Audi': ['A4', 'A6', 'Q5', 'Q7'],
    'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y']
  };
  const colors = ['Black', 'White', 'Silver', 'Gray', 'Blue', 'Red'];
  
  const make = makes[Math.floor(Math.random() * makes.length)];
  const model = models[make][Math.floor(Math.random() * models[make].length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const year = Math.floor(Math.random() * 10) + 2013;
  
  // Use provided confidence score or generate based on distribution
  const confidenceScore = Math.ceil(overrideConfidence ?? Math.random() * 100);

  const damageTypes = [
    'Front bumper damage with scratches and dents',
    'Side door panel denting and paint scratches',
    'Rear bumper collision damage',
    'Front fender and headlight damage',
    'Hood denting and paint damage',
    'Windshield crack and frame damage',
    'Side mirror damage and window scratches'
  ];
  
  const description = damageTypes[Math.floor(Math.random() * damageTypes.length)];
  const severityOptions = ['Minor', 'Moderate', 'Severe'] as const;
  const severity = severityOptions[Math.floor(Math.random() * severityOptions.length)];
  
  const areas = [
    { name: 'Front Bumper', x: 10, y: 40, width: 80, height: 20 },
    { name: 'Hood', x: 30, y: 10, width: 40, height: 30 },
    { name: 'Driver Door', x: 10, y: 60, width: 30, height: 30 },
    { name: 'Passenger Door', x: 60, y: 60, width: 30, height: 30 },
    { name: 'Rear Bumper', x: 10, y: 90, width: 80, height: 10 },
    { name: 'Driver Headlight', x: 10, y: 40, width: 10, height: 10 },
    { name: 'Passenger Headlight', x: 80, y: 40, width: 10, height: 10 }
  ];
  
  const numDamagedAreas = Math.floor(Math.random() * 3) + 1;
  const shuffledAreas = [...areas].sort(() => 0.5 - Math.random());
  const affectedAreas = shuffledAreas.slice(0, numDamagedAreas).map(area => ({
    name: area.name,
    confidence: confidenceScore > 90 ? confidenceScore : Math.ceil((Math.random() * 30 + 70)),
    coordinates: {
      x: area.x,
      y: area.y,
      width: area.width,
      height: area.height
    }
  }));

  const regions = [
    { name: 'Northeast', laborRate: 125, partsCostIndex: 1.2 },
    { name: 'Southeast', laborRate: 85, partsCostIndex: 0.9 },
    { name: 'Midwest', laborRate: 95, partsCostIndex: 1.0 },
    { name: 'Southwest', laborRate: 90, partsCostIndex: 0.95 },
    { name: 'West Coast', laborRate: 140, partsCostIndex: 1.3 }
  ];
  
  const selectedRegion = regions[Math.floor(Math.random() * regions.length)];
  const regionalMultiplier = (selectedRegion.laborRate / 100) * selectedRegion.partsCostIndex;
  const adjustedBaseCost = Math.round(baseCost * regionalMultiplier);
  
  const parts = Math.round(adjustedBaseCost * (0.3 + Math.random() * 0.2));
  const labor = Math.round(adjustedBaseCost * (0.25 + Math.random() * 0.2));
  const paint = Math.round(adjustedBaseCost * (0.1 + Math.random() * 0.15));
  const misc = adjustedBaseCost - parts - labor - paint;
  
  const costBreakdown = [
    { category: 'Parts', description: 'Replacement parts and components', cost: parts, color: categories[0].color },
    { category: 'Labor', description: 'Technician work hours', cost: labor, color: categories[1].color },
    { category: 'Paint', description: 'Paint materials and application', cost: paint, color: categories[2].color },
    { category: 'Miscellaneous', description: 'Additional fees and materials', cost: misc, color: categories[3].color }
  ];
  
  const averageCost = Math.round(adjustedBaseCost * (0.8 + Math.random() * 0.4));
  const percentileRank = Math.round(Math.random() * 100);
  const similarClaims = Math.floor(Math.random() * 200) + 50;

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const randomTimestamp = new Date(
    thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime())
  );

  const claim: AssessmentResult = {
    id,
    timestamp: randomTimestamp.toISOString(),
    vehicle: {
      make,
      model,
      year,
      color,
      confidence: Math.ceil(Math.random() * 10 + 85)
    },
    damage: {
      description,
      severity,
      confidence: confidenceScore > 90 ? confidenceScore : Math.ceil(Math.random() * 15 + 80),
      affectedAreas
    },
    repairCost: {
      total: adjustedBaseCost,
      breakdown: costBreakdown,
      region: {
        name: selectedRegion.name,
        laborRate: selectedRegion.laborRate,
        partsCostIndex: selectedRegion.partsCostIndex,
        averageCost: Math.round(averageCost * regionalMultiplier)
      }
    },
    historicalComparison: {
      averageCost,
      percentileRank,
      similarClaims
    },
    status: overrideStatus || 'pending',
    imageUrl: claimImages[Math.floor(Math.random() * claimImages.length)],
    aiConfidence: {
      level: getConfidenceLevel(confidenceScore),
      score: confidenceScore,
      needsHumanReview: false,
      reviewType: 'auto',
      processingTime: 0
    }
  };

  // Determine review type and processing time
  const { type: reviewType, escalationReason } = getReviewType(confidenceScore, claim);
  claim.aiConfidence.reviewType = reviewType;
  claim.aiConfidence.processingTime = getProcessingTime(reviewType);
  claim.aiConfidence.needsHumanReview = reviewType !== 'auto';
  if (escalationReason) {
    claim.aiConfidence.escalationReason = escalationReason;
  }

  // Update status based on review type if not overridden
  if (!overrideStatus) {
    claim.status = reviewType === 'auto' ? 'approved' : 'pending';
  }

  return claim;
};

export const generateInitialClaims = (count: number = 40) => {
  const claims: AssessmentResult[] = [];
  
  // Calculate number of claims for each confidence level
  const highConfidence = Math.floor(count * 0.75); // 75% high confidence
  const mediumConfidence = Math.floor(count * 0.20); // 20% medium confidence
  const lowConfidence = count - highConfidence - mediumConfidence; // Remaining ~5% low confidence

  // Generate high confidence claims (90-100%)
  for (let i = 0; i < highConfidence; i++) {
    const confidence = Math.ceil(90 + Math.random() * 10);
    claims.push(generateMockResult(undefined, confidence));
  }

  // Generate medium confidence claims (80-89%)
  for (let i = 0; i < mediumConfidence; i++) {
    const confidence = Math.ceil(80 + Math.random() * 9);
    claims.push(generateMockResult(undefined, confidence));
  }

  // Generate low confidence claims (60-79%)
  for (let i = 0; i < lowConfidence; i++) {
    const confidence = Math.ceil(60 + Math.random() * 19);
    claims.push(generateMockResult(undefined, confidence));
  }

  // Shuffle the claims array
  return claims.sort(() => Math.random() - 0.5);
};