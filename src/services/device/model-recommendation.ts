/**
 * Model Recommendation Service
 * Recommends AI models based on device capabilities
 */

import { logger } from '../../errors';
import { ModelInfo, getAllModels, getModelById } from '../ai/models';
import { DeviceCapabilities } from './capabilities';

export interface ModelRequirements {
  minMemoryGB: number;
  recommendedMemoryGB: number;
  minCPUCores: number;
  requiresGPU: boolean;
  requiresWebGL2: boolean;
  estimatedSizeMB: number;
  tier: 'low' | 'medium' | 'high';
}

/**
 * Extended model info with resource requirements
 */
export interface ModelWithRequirements extends ModelInfo {
  requirements: ModelRequirements;
}

/**
 * Model requirements registry
 * Maps model IDs to their resource requirements
 */
const MODEL_REQUIREMENTS: Record<string, ModelRequirements> = {
  'phi-3-mini': {
    minMemoryGB: 4,
    recommendedMemoryGB: 8,
    minCPUCores: 4,
    requiresGPU: false,
    requiresWebGL2: false,
    estimatedSizeMB: 2300,
    tier: 'medium',
  },
  'phi-2': {
    minMemoryGB: 2,
    recommendedMemoryGB: 4,
    minCPUCores: 2,
    requiresGPU: false,
    requiresWebGL2: false,
    estimatedSizeMB: 1700,
    tier: 'low',
  },
  'nomic-embed': {
    minMemoryGB: 2,
    recommendedMemoryGB: 4,
    minCPUCores: 2,
    requiresGPU: false,
    requiresWebGL2: false,
    estimatedSizeMB: 548,
    tier: 'low',
  },
  'all-minilm': {
    minMemoryGB: 1,
    recommendedMemoryGB: 2,
    minCPUCores: 1,
    requiresGPU: false,
    requiresWebGL2: false,
    estimatedSizeMB: 90,
    tier: 'low',
  },
};

/**
 * Check if a model is compatible with device capabilities
 */
export function isModelCompatible(
  modelId: string,
  capabilities: DeviceCapabilities
): boolean {
  const requirements = MODEL_REQUIREMENTS[modelId];
  
  if (!requirements) {
    // If no requirements defined, assume it's compatible
    logger.warn('No requirements found for model', { modelId });
    return true;
  }
  
  // Check memory
  if (capabilities.memory.totalGB < requirements.minMemoryGB) {
    return false;
  }
  
  // Check CPU
  if (capabilities.cpu.cores < requirements.minCPUCores) {
    return false;
  }
  
  // Check GPU requirements
  if (requirements.requiresGPU && !capabilities.gpu.available) {
    return false;
  }
  
  // Check WebGL2 requirement
  if (requirements.requiresWebGL2 && !capabilities.gpu.webgl2) {
    return false;
  }
  
  return true;
}

/**
 * Get model performance score for device
 * Higher score means better performance expected
 */
export function getModelScore(
  modelId: string,
  capabilities: DeviceCapabilities
): number {
  const requirements = MODEL_REQUIREMENTS[modelId];
  
  if (!requirements) {
    return 0;
  }
  
  if (!isModelCompatible(modelId, capabilities)) {
    return 0;
  }
  
  let score = 0;
  
  // Prefer models that match device tier
  if (requirements.tier === capabilities.tier) {
    score += 50;
  } else if (requirements.tier === 'low' && capabilities.tier === 'medium') {
    score += 30; // Low-tier model on medium device is good
  } else if (requirements.tier === 'low' && capabilities.tier === 'high') {
    score += 20; // Low-tier model on high device is okay
  }
  
  // Bonus for having more memory than required
  const memoryHeadroom = capabilities.memory.totalGB - requirements.minMemoryGB;
  score += Math.min(memoryHeadroom * 5, 25);
  
  // Bonus for having more CPU cores
  const coreHeadroom = capabilities.cpu.cores - requirements.minCPUCores;
  score += Math.min(coreHeadroom * 3, 15);
  
  // Bonus for GPU availability if not required
  if (!requirements.requiresGPU && capabilities.gpu.available) {
    score += 10;
  }
  
  return score;
}

/**
 * Get compatible models for device
 */
export function getCompatibleModels(
  capabilities: DeviceCapabilities,
  type?: 'embedding' | 'llm'
): ModelWithRequirements[] {
  const allModels = getAllModels();
  
  return allModels
    .filter(model => !type || model.type === type)
    .filter(model => isModelCompatible(model.id, capabilities))
    .map(model => ({
      ...model,
      requirements: MODEL_REQUIREMENTS[model.id] || {
        minMemoryGB: 2,
        recommendedMemoryGB: 4,
        minCPUCores: 2,
        requiresGPU: false,
        requiresWebGL2: false,
        estimatedSizeMB: 500,
        tier: 'medium',
      },
    }))
    .sort((a, b) => {
      // Sort by score (higher is better)
      const scoreA = getModelScore(a.id, capabilities);
      const scoreB = getModelScore(b.id, capabilities);
      return scoreB - scoreA;
    });
}

/**
 * Get recommended model for device
 */
export function getRecommendedModel(
  capabilities: DeviceCapabilities,
  type?: 'embedding' | 'llm'
): ModelWithRequirements | null {
  const compatible = getCompatibleModels(capabilities, type);
  
  if (compatible.length === 0) {
    logger.warn('No compatible models found', { capabilities, type });
    return null;
  }
  
  const recommended = compatible[0];
  
  logger.info('Model recommended', {
    modelId: recommended.id,
    modelName: recommended.name,
    tier: capabilities.tier,
    score: getModelScore(recommended.id, capabilities),
  });
  
  return recommended;
}

/**
 * Get model requirements by ID
 */
export function getModelRequirements(modelId: string): ModelRequirements | null {
  return MODEL_REQUIREMENTS[modelId] || null;
}

/**
 * Get model with requirements
 */
export function getModelWithRequirements(modelId: string): ModelWithRequirements | null {
  const model = getModelById(modelId);
  if (!model) return null;
  
  const requirements = MODEL_REQUIREMENTS[modelId];
  if (!requirements) return null;
  
  return {
    ...model,
    requirements,
  };
}

/**
 * Check if recommended memory is available for model
 */
export function hasRecommendedResources(
  modelId: string,
  capabilities: DeviceCapabilities
): boolean {
  const requirements = MODEL_REQUIREMENTS[modelId];
  
  if (!requirements) {
    return false;
  }
  
  return capabilities.memory.totalGB >= requirements.recommendedMemoryGB;
}
