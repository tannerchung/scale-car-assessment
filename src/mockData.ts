import { AssessmentResult, ClaimStatus, ReviewType, EscalationReason } from './types';
import { getConfidenceLevel, getReviewType, getProcessingTime } from './utils/confidenceUtils';

const baseCost = 5000;

const categories = [
  { category: 'Parts', color: '#4299E1' },
  { category: 'Labor', color: '#68D391' },
  { category: 'Paint', color: '#F6AD55' },
  { category: 'Miscellaneous', color: '#CBD5E0' }
];

// Map damage types to specific images
const damageTypeImages = {
  'Front bumper damage with scratches and dents': {
    overview: 'https://bumperbuddies.com/wp-content/uploads/2021/06/o-1.jpg',
    damage: 'https://bumperbuddies.com/wp-content/uploads/2021/06/o-1.jpg',
    detail: 'https://bumperbuddies.com/wp-content/uploads/2021/06/o-1.jpg'
  },
  'Side door panel denting and paint scratches': {
    overview: 'https://i.redd.it/c6yz2tswpicc1.jpeg',
    damage: 'https://i.redd.it/c6yz2tswpicc1.jpeg',
    detail: 'https://i.redd.it/c6yz2tswpicc1.jpeg'
  },
  'Rear bumper collision damage': {
    overview: 'https://brightonpanelworks.com.au/wp-content/uploads/2021/09/back-of-gray-car-get-damaged-from-accident-on-the-KPUVAMQ-1-1080x675.jpg',
    damage: 'https://brightonpanelworks.com.au/wp-content/uploads/2021/09/back-of-gray-car-get-damaged-from-accident-on-the-KPUVAMQ-1-1080x675.jpg',
    detail: 'https://brightonpanelworks.com.au/wp-content/uploads/2021/09/back-of-gray-car-get-damaged-from-accident-on-the-KPUVAMQ-1-1080x675.jpg'
  },
  'Front fender and headlight damage': {
    overview: 'https://preview.redd.it/front-fender-repairments-w-headlight-v0-4plzxr1lllxc1.jpeg?width=1080&crop=smart&auto=webp&s=1047e748a7f6b1eed9255dc6b3bba221c7c7b016',
    damage: 'https://preview.redd.it/front-fender-repairments-w-headlight-v0-4plzxr1lllxc1.jpeg?width=1080&crop=smart&auto=webp&s=1047e748a7f6b1eed9255dc6b3bba221c7c7b016',
    detail: 'https://preview.redd.it/front-fender-repairments-w-headlight-v0-4plzxr1lllxc1.jpeg?width=1080&crop=smart&auto=webp&s=1047e748a7f6b1eed9255dc6b3bba221c7c7b016'
  },
  'Hood denting and paint damage': {
    overview: 'https://dentdominator.com/wp-content/uploads/2021/11/hail-damage.jpg',
    damage: 'https://dentdominator.com/wp-content/uploads/2021/11/hail-damage.jpg',
    detail: 'https://dentdominator.com/wp-content/uploads/2021/11/hail-damage.jpg'
  },
  'Windshield crack and frame damage': {
    overview: 'https://autoglassinsanantonio.com/wp-content/uploads/2019/01/Picture3.png',
    damage: 'https://autoglassinsanantonio.com/wp-content/uploads/2019/01/Picture3.png',
    detail: 'https://autoglassinsanantonio.com/wp-content/uploads/2019/01/Picture3.png'
  },
  'Side mirror damage and window scratches': {
    overview: 'https://i.sstatic.net/WU0Qj.jpg',
    damage: 'https://i.sstatic.net/WU0Qj.jpg',
    detail: 'https://i.sstatic.net/WU0Qj.jpg'
  }
};

// Default fallback image if no matching damage type is found
const defaultImages = {
  overview: 'https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg',
  damage: 'https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg',
  detail: 'https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg'
};

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

  const damageTypes = Object.keys(damageTypeImages);
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

  // Get the appropriate images for this damage type
  const claimImages = damageTypeImages[description] || defaultImages;

  // Generate multiple views of the same image
  const images = [
    {
      url: claimImages.overview,
      type: 'overview' as const,
      timestamp: randomTimestamp.toISOString(),
      metadata: {
        width: 1920,
        height: 1080,
        size: Math.floor(Math.random() * 5000000) + 1000000
      }
    },
    {
      url: claimImages.damage,
      type: 'damage' as const,
      timestamp: new Date(randomTimestamp.getTime() + 60000).toISOString(),
      metadata: {
        width: 1920,
        height: 1080,
        size: Math.floor(Math.random() * 5000000) + 1000000
      }
    },
    {
      url: claimImages.detail,
      type: 'detail' as const,
      timestamp: new Date(randomTimestamp.getTime() + 120000).toISOString(),
      metadata: {
        width: 1920,
        height: 1080,
        size: Math.floor(Math.random() * 5000000) + 1000000
      }
    }
  ];

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
    imageUrl: claimImages.overview,
    images,
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
  
  // Distribution of claim statuses
  const statusDistribution = {
    approved: Math.floor(count * 0.4),  // 40% approved
    pending: Math.floor(count * 0.25),   // 25% pending
    processing: Math.floor(count * 0.2), // 20% processing
    rejected: count - Math.floor(count * 0.85) // ~15% rejected
  };

  // Generate approved claims (mostly high confidence)
  for (let i = 0; i < statusDistribution.approved; i++) {
    const confidence = Math.ceil(85 + Math.random() * 15);
    claims.push(generateMockResult('approved', confidence));
  }

  // Generate pending claims (mixed confidence)
  for (let i = 0; i < statusDistribution.pending; i++) {
    const confidence = Math.ceil(60 + Math.random() * 30);
    claims.push(generateMockResult('pending', confidence));
  }

  // Generate processing claims (mixed confidence)
  for (let i = 0; i < statusDistribution.processing; i++) {
    const confidence = Math.ceil(70 + Math.random() * 20);
    claims.push(generateMockResult('processing', confidence));
  }

  // Generate rejected claims (mostly low confidence)
  for (let i = 0; i < statusDistribution.rejected; i++) {
    const confidence = Math.ceil(40 + Math.random() * 30);
    claims.push(generateMockResult('rejected', confidence));
  }

  // Shuffle the claims array
  return claims.sort(() => Math.random() - 0.5);
};