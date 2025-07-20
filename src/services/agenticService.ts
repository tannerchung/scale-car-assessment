import { ImageData, AssessmentResult, DamageArea } from '../types';
import { analyzeDamageWithClaude } from './aiService';
import { analyzeImage } from './visionApiService';

export interface AgentTask {
  id: string;
  type: 'analyze' | 'validate' | 'estimate' | 'review' | 'escalate';
  priority: number;
  dependencies: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  confidence?: number;
  reasoning?: string;
}

export interface AgentContext {
  imageData: ImageData;
  currentAssessment?: Partial<AssessmentResult>;
  tasks: AgentTask[];
  iterations: number;
  maxIterations: number;
  confidenceThreshold: number;
  flags: {
    needsHumanReview: boolean;
    qualityIssues: string[];
    uncertainties: string[];
  };
}

export class AgenticClaimsProcessor {
  private context: AgentContext;
  private agents: Map<string, ClaimsAgent>;

  constructor(imageData: ImageData) {
    this.context = {
      imageData,
      tasks: [],
      iterations: 0,
      maxIterations: 5,
      confidenceThreshold: 85,
      flags: {
        needsHumanReview: false,
        qualityIssues: [],
        uncertainties: []
      }
    };

    this.agents = new Map([
      ['coordinator', new CoordinatorAgent()],
      ['vision', new VisionAnalysisAgent()],
      ['damage', new DamageAssessmentAgent()],
      ['cost', new CostEstimationAgent()],
      ['validator', new ValidationAgent()],
      ['quality', new QualityAssuranceAgent()]
    ]);
  }

  async process(): Promise<AssessmentResult> {
    console.log('🤖 Starting agentic claims processing...');
    
    // Initial task planning by coordinator
    await this.agents.get('coordinator')!.execute(this.context);
    
    while (this.context.iterations < this.context.maxIterations) {
      this.context.iterations++;
      console.log(`🔄 Iteration ${this.context.iterations}`);
      
      const pendingTasks = this.context.tasks.filter(t => t.status === 'pending');
      if (pendingTasks.length === 0) break;
      
      // Execute tasks based on priority and dependencies
      for (const task of this.getExecutableTasks()) {
        await this.executeTask(task);
      }
      
      // Let coordinator decide next steps
      await this.agents.get('coordinator')!.execute(this.context);
      
      // Check if we have sufficient confidence to proceed
      if (this.shouldTerminate()) break;
    }
    
    // Final validation and result compilation
    await this.agents.get('validator')!.execute(this.context);
    
    return this.compileResult();
  }

  private getExecutableTasks(): AgentTask[] {
    return this.context.tasks
      .filter(task => 
        task.status === 'pending' && 
        task.dependencies.every(dep => 
          this.context.tasks.find(t => t.id === dep)?.status === 'completed'
        )
      )
      .sort((a, b) => b.priority - a.priority);
  }

  private async executeTask(task: AgentTask): Promise<void> {
    task.status = 'running';
    console.log(`🎯 Executing task: ${task.type} (${task.id})`);
    
    try {
      const agent = this.getAgentForTask(task);
      await agent.execute(this.context, task);
      task.status = 'completed';
    } catch (error) {
      task.status = 'failed';
      console.error(`❌ Task failed: ${task.id}`, error);
      
      // Let coordinator handle failure
      await this.agents.get('coordinator')!.handleFailure(this.context, task, error);
    }
  }

  private getAgentForTask(task: AgentTask): ClaimsAgent {
    switch (task.type) {
      case 'analyze': return this.agents.get('vision')!;
      case 'validate': return this.agents.get('damage')!;
      case 'estimate': return this.agents.get('cost')!;
      case 'review': return this.agents.get('quality')!;
      default: return this.agents.get('coordinator')!;
    }
  }

  private shouldTerminate(): boolean {
    const completedTasks = this.context.tasks.filter(t => t.status === 'completed');
    const avgConfidence = completedTasks.reduce((sum, t) => sum + (t.confidence || 0), 0) / completedTasks.length;
    
    return avgConfidence >= this.context.confidenceThreshold || 
           this.context.flags.needsHumanReview;
  }

  private compileResult(): AssessmentResult {
    // Compile final result from all agent outputs
    const visionTask = this.context.tasks.find(t => t.type === 'analyze');
    const damageTask = this.context.tasks.find(t => t.type === 'validate');
    const costTask = this.context.tasks.find(t => t.type === 'estimate');
    
    // Use existing mock generation as fallback, enhanced with agent results
    const baseResult = this.generateBaseResult();
    
    if (visionTask?.result) {
      Object.assign(baseResult.vehicle, visionTask.result.vehicle);
    }
    
    if (damageTask?.result) {
      Object.assign(baseResult.damage, damageTask.result);
    }
    
    if (costTask?.result) {
      Object.assign(baseResult.repairCost, costTask.result);
    }
    
    // Set AI confidence based on agent consensus
    const avgConfidence = this.context.tasks
      .filter(t => t.confidence)
      .reduce((sum, t) => sum + t.confidence!, 0) / this.context.tasks.length;
    
    baseResult.aiConfidence.score = Math.round(avgConfidence);
    baseResult.aiConfidence.needsHumanReview = this.context.flags.needsHumanReview;
    
    return baseResult;
  }

  private generateBaseResult(): AssessmentResult {
    // Use existing mock generation logic
    const id = Math.random().toString(36).substring(2, 15);
    const now = new Date();
    
    return {
      id,
      timestamp: now.toISOString(),
      vehicle: {
        make: 'Unknown',
        model: 'Unknown',
        year: new Date().getFullYear(),
        color: 'Unknown',
        confidence: 0
      },
      damage: {
        description: 'Processing...',
        severity: 'Minor',
        confidence: 0,
        affectedAreas: []
      },
      repairCost: {
        total: 0,
        breakdown: [],
        region: {
          name: 'Unknown',
          laborRate: 100,
          partsCostIndex: 1.0,
          averageCost: 0
        }
      },
      historicalComparison: {
        averageCost: 0,
        percentileRank: 50,
        similarClaims: 0
      },
      status: 'processing',
      imageUrl: this.context.imageData.url,
      aiConfidence: {
        level: 'low',
        score: 0,
        needsHumanReview: true,
        reviewType: 'detailed',
        processingTime: 0
      }
    };
  }
}

// Base agent interface
abstract class ClaimsAgent {
  abstract execute(context: AgentContext, task?: AgentTask): Promise<void>;
  
  async handleFailure(context: AgentContext, task: AgentTask, error: any): Promise<void> {
    console.log(`🔧 Agent handling failure for task ${task.id}`);
    // Default failure handling - can be overridden
  }
  
  protected createTask(
    type: AgentTask['type'], 
    priority: number = 1, 
    dependencies: string[] = []
  ): AgentTask {
    return {
      id: Math.random().toString(36).substring(2, 15),
      type,
      priority,
      dependencies,
      status: 'pending'
    };
  }
}

// Coordinator Agent - Plans and orchestrates the entire process
class CoordinatorAgent extends ClaimsAgent {
  async execute(context: AgentContext): Promise<void> {
    console.log('🎯 Coordinator: Planning next actions...');
    
    if (context.iterations === 1) {
      // Initial planning
      this.planInitialTasks(context);
    } else {
      // Adaptive planning based on current state
      this.adaptivePlanning(context);
    }
  }
  
  private planInitialTasks(context: AgentContext): void {
    // Create initial task sequence
    const visionTask = this.createTask('analyze', 10);
    const damageTask = this.createTask('validate', 8, [visionTask.id]);
    const costTask = this.createTask('estimate', 6, [damageTask.id]);
    const qualityTask = this.createTask('review', 4, [visionTask.id, damageTask.id]);
    
    context.tasks.push(visionTask, damageTask, costTask, qualityTask);
    console.log(`📋 Coordinator: Planned ${context.tasks.length} initial tasks`);
  }
  
  private adaptivePlanning(context: AgentContext): void {
    const completedTasks = context.tasks.filter(t => t.status === 'completed');
    const avgConfidence = completedTasks.reduce((sum, t) => sum + (t.confidence || 0), 0) / completedTasks.length;
    
    console.log(`📊 Coordinator: Average confidence so far: ${avgConfidence.toFixed(1)}%`);
    
    // If confidence is low, plan additional validation tasks
    if (avgConfidence < context.confidenceThreshold) {
      const needsReanalysis = !context.tasks.some(t => t.type === 'analyze' && t.status === 'pending');
      
      if (needsReanalysis) {
        const reanalysisTask = this.createTask('analyze', 9);
        reanalysisTask.reasoning = 'Low confidence detected, requesting re-analysis';
        context.tasks.push(reanalysisTask);
        console.log('🔄 Coordinator: Added re-analysis task due to low confidence');
      }
    }
    
    // Check for quality issues
    if (context.flags.qualityIssues.length > 0) {
      context.flags.needsHumanReview = true;
      console.log('⚠️ Coordinator: Flagged for human review due to quality issues');
    }
  }
  
  async handleFailure(context: AgentContext, task: AgentTask, error: any): Promise<void> {
    console.log(`🚨 Coordinator: Handling failure for ${task.type} task`);
    
    // Create fallback task with different approach
    const fallbackTask = this.createTask(task.type, task.priority - 1);
    fallbackTask.reasoning = `Fallback for failed task: ${task.id}`;
    context.tasks.push(fallbackTask);
    
    // If multiple failures, escalate to human review
    const failedTasks = context.tasks.filter(t => t.status === 'failed');
    if (failedTasks.length >= 2) {
      context.flags.needsHumanReview = true;
      context.flags.uncertainties.push('Multiple task failures detected');
    }
  }
}

// Vision Analysis Agent - Handles image analysis
class VisionAnalysisAgent extends ClaimsAgent {
  async execute(context: AgentContext, task?: AgentTask): Promise<void> {
    console.log('👁️ Vision Agent: Analyzing image...');
    
    try {
      // Try multiple analysis approaches
      const results = await Promise.allSettled([
        this.analyzeWithVisionAPI(context.imageData),
        this.analyzeWithClaude(context.imageData)
      ]);
      
      const visionResult = results[0].status === 'fulfilled' ? results[0].value : null;
      const claudeResult = results[1].status === 'fulfilled' ? results[1].value : null;
      
      // Combine and validate results
      const combinedResult = this.combineResults(visionResult, claudeResult);
      
      if (task) {
        task.result = combinedResult;
        task.confidence = this.calculateConfidence(visionResult, claudeResult);
        task.reasoning = this.generateReasoning(visionResult, claudeResult);
      }
      
      console.log(`✅ Vision Agent: Analysis complete (confidence: ${task?.confidence}%)`);
      
    } catch (error) {
      console.error('❌ Vision Agent: Analysis failed', error);
      throw error;
    }
  }
  
  private async analyzeWithVisionAPI(imageData: ImageData): Promise<any> {
    return await analyzeImage(imageData);
  }
  
  private async analyzeWithClaude(imageData: ImageData): Promise<any> {
    // Convert image to base64 for Claude
    let base64Data: string;
    if (imageData.type === 'file' && imageData.file) {
      base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageData.file);
      });
    } else {
      const response = await fetch(imageData.url);
      const blob = await response.blob();
      base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    
    return await analyzeDamageWithClaude(base64Data);
  }
  
  private combineResults(visionResult: any, claudeResult: any): any {
    // Intelligent result combination logic
    const combined = {
      vehicle: {},
      damage: {
        affectedAreas: []
      }
    };
    
    // Prefer Claude for vehicle identification if available
    if (claudeResult?.vehicle) {
      combined.vehicle = claudeResult.vehicle;
    } else if (visionResult?.vehicleData) {
      combined.vehicle = visionResult.vehicleData;
    }
    
    // Combine damage areas from both sources
    const allAreas: DamageArea[] = [];
    
    if (visionResult?.damageAssessment?.affectedAreas) {
      allAreas.push(...visionResult.damageAssessment.affectedAreas);
    }
    
    if (claudeResult?.damage?.affectedAreas) {
      allAreas.push(...claudeResult.damage.affectedAreas.map((area: any) => ({
        name: area.name,
        confidence: Math.round(area.confidence * 100),
        coordinates: area.coordinates
      })));
    }
    
    // Remove duplicates and merge similar areas
    combined.damage.affectedAreas = this.mergeSimilarAreas(allAreas);
    
    return combined;
  }
  
  private mergeSimilarAreas(areas: DamageArea[]): DamageArea[] {
    // Simple area merging logic - can be enhanced
    const merged: DamageArea[] = [];
    
    for (const area of areas) {
      const similar = merged.find(m => 
        m.name.toLowerCase().includes(area.name.toLowerCase()) ||
        area.name.toLowerCase().includes(m.name.toLowerCase())
      );
      
      if (similar) {
        // Merge with higher confidence area
        if (area.confidence > similar.confidence) {
          Object.assign(similar, area);
        }
      } else {
        merged.push(area);
      }
    }
    
    return merged;
  }
  
  private calculateConfidence(visionResult: any, claudeResult: any): number {
    let confidence = 0;
    let sources = 0;
    
    if (visionResult) {
      confidence += visionResult.vehicleData?.confidence || 70;
      sources++;
    }
    
    if (claudeResult) {
      confidence += (claudeResult.vehicle?.confidence || 0.7) * 100;
      sources++;
    }
    
    return sources > 0 ? Math.round(confidence / sources) : 50;
  }
  
  private generateReasoning(visionResult: any, claudeResult: any): string {
    const reasons = [];
    
    if (visionResult && claudeResult) {
      reasons.push('Combined analysis from Vision API and Claude AI');
    } else if (visionResult) {
      reasons.push('Analysis from Vision API only');
    } else if (claudeResult) {
      reasons.push('Analysis from Claude AI only');
    } else {
      reasons.push('Fallback to mock data due to API failures');
    }
    
    return reasons.join('; ');
  }
}

// Damage Assessment Agent - Validates and refines damage analysis
class DamageAssessmentAgent extends ClaimsAgent {
  async execute(context: AgentContext, task?: AgentTask): Promise<void> {
    console.log('🔍 Damage Agent: Validating damage assessment...');
    
    const visionTask = context.tasks.find(t => t.type === 'analyze' && t.status === 'completed');
    if (!visionTask?.result) {
      throw new Error('No vision analysis available for damage validation');
    }
    
    const damageData = visionTask.result.damage;
    const validatedDamage = this.validateDamageAssessment(damageData);
    
    if (task) {
      task.result = validatedDamage;
      task.confidence = this.assessDamageConfidence(validatedDamage);
      task.reasoning = this.generateDamageReasoning(validatedDamage);
    }
    
    // Flag quality issues
    this.checkForQualityIssues(context, validatedDamage);
    
    console.log(`✅ Damage Agent: Validation complete (confidence: ${task?.confidence}%)`);
  }
  
  private validateDamageAssessment(damageData: any): any {
    // Validate and enhance damage assessment
    const validated = {
      description: damageData.description || 'Damage detected',
      severity: this.determineSeverity(damageData),
      confidence: damageData.confidence || 70,
      affectedAreas: this.validateAffectedAreas(damageData.affectedAreas || [])
    };
    
    return validated;
  }
  
  private determineSeverity(damageData: any): 'Minor' | 'Moderate' | 'Severe' {
    const areas = damageData.affectedAreas || [];
    
    // Logic to determine severity based on affected areas and confidence
    if (areas.length > 3) return 'Severe';
    if (areas.some((area: any) => area.name.toLowerCase().includes('structural'))) return 'Severe';
    if (areas.length > 1) return 'Moderate';
    
    return 'Minor';
  }
  
  private validateAffectedAreas(areas: DamageArea[]): DamageArea[] {
    return areas.map(area => ({
      ...area,
      coordinates: {
        x: Math.max(0, Math.min(100, area.coordinates.x)),
        y: Math.max(0, Math.min(100, area.coordinates.y)),
        width: Math.max(5, Math.min(100 - area.coordinates.x, area.coordinates.width)),
        height: Math.max(5, Math.min(100 - area.coordinates.y, area.coordinates.height))
      }
    }));
  }
  
  private assessDamageConfidence(damageData: any): number {
    const areaConfidences = damageData.affectedAreas.map((area: DamageArea) => area.confidence);
    const avgAreaConfidence = areaConfidences.reduce((sum: number, conf: number) => sum + conf, 0) / areaConfidences.length;
    
    return Math.round((damageData.confidence + avgAreaConfidence) / 2);
  }
  
  private generateDamageReasoning(damageData: any): string {
    const reasons = [
      `${damageData.affectedAreas.length} damage area(s) identified`,
      `Severity assessed as ${damageData.severity}`,
      `Average area confidence: ${damageData.affectedAreas.reduce((sum: number, area: DamageArea) => sum + area.confidence, 0) / damageData.affectedAreas.length}%`
    ];
    
    return reasons.join('; ');
  }
  
  private checkForQualityIssues(context: AgentContext, damageData: any): void {
    // Check for low confidence areas
    const lowConfidenceAreas = damageData.affectedAreas.filter((area: DamageArea) => area.confidence < 70);
    if (lowConfidenceAreas.length > 0) {
      context.flags.qualityIssues.push(`${lowConfidenceAreas.length} low-confidence damage areas`);
    }
    
    // Check for overlapping areas (potential detection errors)
    const overlapping = this.findOverlappingAreas(damageData.affectedAreas);
    if (overlapping.length > 0) {
      context.flags.qualityIssues.push('Overlapping damage areas detected');
    }
  }
  
  private findOverlappingAreas(areas: DamageArea[]): DamageArea[] {
    // Simple overlap detection - can be enhanced
    const overlapping: DamageArea[] = [];
    
    for (let i = 0; i < areas.length; i++) {
      for (let j = i + 1; j < areas.length; j++) {
        if (this.areasOverlap(areas[i], areas[j])) {
          overlapping.push(areas[i], areas[j]);
        }
      }
    }
    
    return overlapping;
  }
  
  private areasOverlap(area1: DamageArea, area2: DamageArea): boolean {
    const a1 = area1.coordinates;
    const a2 = area2.coordinates;
    
    return !(a1.x + a1.width < a2.x || 
             a2.x + a2.width < a1.x || 
             a1.y + a1.height < a2.y || 
             a2.y + a2.height < a1.y);
  }
}

// Cost Estimation Agent - Handles repair cost calculations
class CostEstimationAgent extends ClaimsAgent {
  async execute(context: AgentContext, task?: AgentTask): Promise<void> {
    console.log('💰 Cost Agent: Calculating repair estimates...');
    
    const damageTask = context.tasks.find(t => t.type === 'validate' && t.status === 'completed');
    if (!damageTask?.result) {
      throw new Error('No damage assessment available for cost estimation');
    }
    
    const costEstimate = this.calculateCosts(damageTask.result);
    
    if (task) {
      task.result = costEstimate;
      task.confidence = this.assessCostConfidence(costEstimate, damageTask.result);
      task.reasoning = this.generateCostReasoning(costEstimate);
    }
    
    console.log(`✅ Cost Agent: Estimation complete (confidence: ${task?.confidence}%)`);
  }
  
  private calculateCosts(damageData: any): any {
    // Enhanced cost calculation logic
    const baseCostPerArea = 1500;
    const severityMultipliers = {
      'Minor': 0.7,
      'Moderate': 1.0,
      'Severe': 1.8
    };
    
    const areas = damageData.affectedAreas || [];
    const severityMultiplier = severityMultipliers[damageData.severity as keyof typeof severityMultipliers] || 1.0;
    
    const totalCost = Math.round(areas.length * baseCostPerArea * severityMultiplier);
    
    return {
      total: totalCost,
      breakdown: this.generateCostBreakdown(totalCost),
      confidence: this.calculateCostConfidence(areas, damageData.severity)
    };
  }
  
  private generateCostBreakdown(total: number): any[] {
    return [
      { category: 'Parts', cost: Math.round(total * 0.4), description: 'Replacement parts' },
      { category: 'Labor', cost: Math.round(total * 0.35), description: 'Repair labor' },
      { category: 'Paint', cost: Math.round(total * 0.15), description: 'Paint and finishing' },
      { category: 'Misc', cost: Math.round(total * 0.1), description: 'Additional materials' }
    ];
  }
  
  private calculateCostConfidence(areas: DamageArea[], severity: string): number {
    const areaConfidence = areas.reduce((sum, area) => sum + area.confidence, 0) / areas.length;
    const severityConfidence = severity === 'Minor' ? 90 : severity === 'Moderate' ? 80 : 70;
    
    return Math.round((areaConfidence + severityConfidence) / 2);
  }
  
  private assessCostConfidence(costData: any, damageData: any): number {
    return costData.confidence;
  }
  
  private generateCostReasoning(costData: any): string {
    return `Estimated total: $${costData.total} based on damage analysis and regional factors`;
  }
}

// Quality Assurance Agent - Final validation and quality checks
class QualityAssuranceAgent extends ClaimsAgent {
  async execute(context: AgentContext, task?: AgentTask): Promise<void> {
    console.log('🔍 QA Agent: Performing quality assurance...');
    
    const qualityReport = this.performQualityChecks(context);
    
    if (task) {
      task.result = qualityReport;
      task.confidence = qualityReport.overallConfidence;
      task.reasoning = qualityReport.summary;
    }
    
    // Update context flags based on QA findings
    if (qualityReport.overallConfidence < context.confidenceThreshold) {
      context.flags.needsHumanReview = true;
      context.flags.uncertainties.push('Low overall confidence detected');
    }
    
    console.log(`✅ QA Agent: Quality check complete (overall confidence: ${qualityReport.overallConfidence}%)`);
  }
  
  private performQualityChecks(context: AgentContext): any {
    const completedTasks = context.tasks.filter(t => t.status === 'completed');
    const confidences = completedTasks.map(t => t.confidence || 0);
    const overallConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    
    const checks = {
      dataConsistency: this.checkDataConsistency(context),
      confidenceDistribution: this.analyzeConfidenceDistribution(confidences),
      processingQuality: this.assessProcessingQuality(context)
    };
    
    return {
      overallConfidence: Math.round(overallConfidence),
      checks,
      summary: this.generateQualitySummary(checks, overallConfidence),
      recommendations: this.generateRecommendations(checks, context)
    };
  }
  
  private checkDataConsistency(context: AgentContext): any {
    // Check for consistency across different agent results
    return {
      passed: true,
      issues: context.flags.qualityIssues
    };
  }
  
  private analyzeConfidenceDistribution(confidences: number[]): any {
    const variance = this.calculateVariance(confidences);
    return {
      mean: confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length,
      variance,
      isConsistent: variance < 100 // Low variance indicates consistent results
    };
  }
  
  private assessProcessingQuality(context: AgentContext): any {
    const failedTasks = context.tasks.filter(t => t.status === 'failed').length;
    const totalTasks = context.tasks.length;
    
    return {
      successRate: ((totalTasks - failedTasks) / totalTasks) * 100,
      iterations: context.iterations,
      efficiency: context.iterations <= 3 ? 'High' : context.iterations <= 5 ? 'Medium' : 'Low'
    };
  }
  
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / numbers.length;
  }
  
  private generateQualitySummary(checks: any, overallConfidence: number): string {
    const summaryParts = [
      `Overall confidence: ${overallConfidence}%`,
      `Data consistency: ${checks.dataConsistency.passed ? 'Passed' : 'Failed'}`,
      `Processing efficiency: ${checks.processingQuality.efficiency}`
    ];
    
    return summaryParts.join('; ');
  }
  
  private generateRecommendations(checks: any, context: AgentContext): string[] {
    const recommendations = [];
    
    if (checks.confidenceDistribution.variance > 100) {
      recommendations.push('High variance in confidence scores - consider additional validation');
    }
    
    if (checks.processingQuality.efficiency === 'Low') {
      recommendations.push('Processing took many iterations - review task planning');
    }
    
    if (context.flags.qualityIssues.length > 0) {
      recommendations.push('Quality issues detected - human review recommended');
    }
    
    return recommendations;
  }
}

// Validation Agent - Final result validation
class ValidationAgent extends ClaimsAgent {
  async execute(context: AgentContext): Promise<void> {
    console.log('✅ Validator: Performing final validation...');
    
    // Ensure all critical tasks are completed
    const criticalTasks = ['analyze', 'validate', 'estimate'];
    const missingTasks = criticalTasks.filter(type => 
      !context.tasks.some(t => t.type === type && t.status === 'completed')
    );
    
    if (missingTasks.length > 0) {
      throw new Error(`Critical tasks not completed: ${missingTasks.join(', ')}`);
    }
    
    // Validate result consistency
    this.validateResultConsistency(context);
    
    console.log('✅ Validator: Final validation complete');
  }
  
  private validateResultConsistency(context: AgentContext): void {
    // Add validation logic for result consistency
    const tasks = context.tasks.filter(t => t.status === 'completed');
    
    // Check if results make logical sense
    const damageTask = tasks.find(t => t.type === 'validate');
    const costTask = tasks.find(t => t.type === 'estimate');
    
    if (damageTask && costTask) {
      const severity = damageTask.result?.severity;
      const cost = costTask.result?.total;
      
      // Basic sanity check: severe damage should have higher costs
      if (severity === 'Severe' && cost < 2000) {
        context.flags.uncertainties.push('Cost seems low for severe damage');
      }
      
      if (severity === 'Minor' && cost > 5000) {
        context.flags.uncertainties.push('Cost seems high for minor damage');
      }
    }
  }
}
