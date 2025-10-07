/**
 * Device Service
 * Provides device capability detection and model recommendations
 */

export { 
  detectDeviceCapabilities, 
  getCapabilitiesSummary,
  type DeviceCapabilities,
} from './capabilities';

export {
  getCompatibleModels,
  getRecommendedModel,
  isModelCompatible,
  getModelScore,
  getModelRequirements,
  getModelWithRequirements,
  hasRecommendedResources,
  type ModelRequirements,
  type ModelWithRequirements,
} from './model-recommendation';
