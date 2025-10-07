/**
 * Device Capabilities Detection Service
 * Detects hardware and software capabilities of the device
 * to recommend appropriate AI models
 */

import { logger } from '../../errors';

export interface DeviceCapabilities {
  // Hardware
  memory: {
    totalGB: number;
    available: boolean;
  };
  cpu: {
    cores: number;
    available: boolean;
  };
  gpu: {
    available: boolean;
    webgl: boolean;
    webgl2: boolean;
  };
  
  // Platform
  platform: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  isMobile: boolean;
  
  // Browser capabilities
  webAssembly: boolean;
  sharedArrayBuffer: boolean;
  
  // Performance tier
  tier: 'low' | 'medium' | 'high';
}

/**
 * Detect device memory
 */
function detectMemory(): DeviceCapabilities['memory'] {
  try {
    // Try to get device memory from Navigator API
    const nav = navigator as any;
    if (nav.deviceMemory) {
      return {
        totalGB: nav.deviceMemory,
        available: true,
      };
    }
    
    // Fallback: estimate based on performance
    if (nav.hardwareConcurrency >= 8) {
      return { totalGB: 8, available: false }; // Estimate high-end device
    } else if (nav.hardwareConcurrency >= 4) {
      return { totalGB: 4, available: false }; // Estimate mid-range device
    }
    
    return { totalGB: 2, available: false }; // Conservative estimate
  } catch (error) {
    logger.warn('Failed to detect device memory', { error });
    return { totalGB: 2, available: false };
  }
}

/**
 * Detect CPU capabilities
 */
function detectCPU(): DeviceCapabilities['cpu'] {
  try {
    const cores = navigator.hardwareConcurrency || 2;
    return {
      cores,
      available: true,
    };
  } catch (error) {
    logger.warn('Failed to detect CPU cores', { error });
    return { cores: 2, available: false };
  }
}

/**
 * Detect GPU and WebGL capabilities
 */
function detectGPU(): DeviceCapabilities['gpu'] {
  try {
    const canvas = document.createElement('canvas');
    
    // Check WebGL support
    const webgl = !!canvas.getContext('webgl');
    const webgl2 = !!canvas.getContext('webgl2');
    
    return {
      available: webgl || webgl2,
      webgl,
      webgl2,
    };
  } catch (error) {
    logger.warn('Failed to detect GPU capabilities', { error });
    return {
      available: false,
      webgl: false,
      webgl2: false,
    };
  }
}

/**
 * Detect platform type
 */
function detectPlatform(): { platform: DeviceCapabilities['platform']; isMobile: boolean } {
  try {
    const ua = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(ua);
    const isTablet = /ipad|tablet|playbook|silk/.test(ua) && !isMobile;
    
    let platform: DeviceCapabilities['platform'] = 'desktop';
    if (isTablet) {
      platform = 'tablet';
    } else if (isMobile) {
      platform = 'mobile';
    }
    
    return { platform, isMobile: isMobile || isTablet };
  } catch (error) {
    logger.warn('Failed to detect platform', { error });
    return { platform: 'unknown', isMobile: false };
  }
}

/**
 * Detect WebAssembly support
 */
function detectWebAssembly(): boolean {
  try {
    return typeof WebAssembly === 'object' 
      && typeof WebAssembly.instantiate === 'function';
  } catch (error) {
    return false;
  }
}

/**
 * Detect SharedArrayBuffer support
 */
function detectSharedArrayBuffer(): boolean {
  try {
    return typeof SharedArrayBuffer !== 'undefined';
  } catch (error) {
    return false;
  }
}

/**
 * Calculate performance tier based on capabilities
 */
function calculateTier(
  memory: DeviceCapabilities['memory'],
  cpu: DeviceCapabilities['cpu'],
  gpu: DeviceCapabilities['gpu'],
  isMobile: boolean
): DeviceCapabilities['tier'] {
  // Mobile devices get lower tier by default
  if (isMobile) {
    if (memory.totalGB >= 6 && cpu.cores >= 6 && gpu.webgl2) {
      return 'medium';
    }
    return 'low';
  }
  
  // Desktop tier calculation
  const score = 
    (memory.totalGB >= 8 ? 3 : memory.totalGB >= 4 ? 2 : 1) +
    (cpu.cores >= 8 ? 3 : cpu.cores >= 4 ? 2 : 1) +
    (gpu.webgl2 ? 3 : gpu.webgl ? 2 : 0);
  
  if (score >= 8) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
}

/**
 * Detect all device capabilities
 */
export function detectDeviceCapabilities(): DeviceCapabilities {
  logger.info('Detecting device capabilities...');
  
  const memory = detectMemory();
  const cpu = detectCPU();
  const gpu = detectGPU();
  const { platform, isMobile } = detectPlatform();
  const webAssembly = detectWebAssembly();
  const sharedArrayBuffer = detectSharedArrayBuffer();
  const tier = calculateTier(memory, cpu, gpu, isMobile);
  
  const capabilities: DeviceCapabilities = {
    memory,
    cpu,
    gpu,
    platform,
    isMobile,
    webAssembly,
    sharedArrayBuffer,
    tier,
  };
  
  logger.info('Device capabilities detected', capabilities);
  
  return capabilities;
}

/**
 * Get a human-readable summary of device capabilities
 */
export function getCapabilitiesSummary(capabilities: DeviceCapabilities): string {
  const parts: string[] = [];
  
  parts.push(`Platform: ${capabilities.platform}`);
  parts.push(`Tier: ${capabilities.tier}`);
  parts.push(`Memory: ${capabilities.memory.totalGB}GB${capabilities.memory.available ? '' : ' (estimated)'}`);
  parts.push(`CPU Cores: ${capabilities.cpu.cores}`);
  parts.push(`GPU: ${capabilities.gpu.available ? (capabilities.gpu.webgl2 ? 'WebGL2' : 'WebGL') : 'None'}`);
  parts.push(`WebAssembly: ${capabilities.webAssembly ? 'Yes' : 'No'}`);
  
  return parts.join(', ');
}
