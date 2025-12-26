/**
 * Cloudinary Image Utility
 * Generates optimized image URLs with transformations
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'punitmishra';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

/**
 * Default transformations for optimization
 */
const DEFAULT_TRANSFORMS = {
  format: 'auto',      // Auto-select best format (WebP, AVIF, etc.)
  quality: 'auto',     // Auto-optimize quality
  dpr: 'auto',         // Auto device pixel ratio
};

/**
 * Build transformation string from options
 * @param {Object} options - Transformation options
 * @returns {string} - Cloudinary transformation string
 */
function buildTransformString(options = {}) {
  const transforms = [];

  // Format and quality (always apply)
  transforms.push(`f_${options.format || DEFAULT_TRANSFORMS.format}`);
  transforms.push(`q_${options.quality || DEFAULT_TRANSFORMS.quality}`);

  // Width
  if (options.width) {
    transforms.push(`w_${options.width}`);
  }

  // Height
  if (options.height) {
    transforms.push(`h_${options.height}`);
  }

  // Aspect ratio
  if (options.aspectRatio) {
    transforms.push(`ar_${options.aspectRatio.replace(':', '_')}`);
  }

  // Crop mode
  if (options.crop) {
    transforms.push(`c_${options.crop}`);
  } else if (options.width || options.height || options.aspectRatio) {
    transforms.push('c_fill'); // Default crop mode when sizing
  }

  // Gravity (face detection, auto, etc.)
  if (options.gravity) {
    transforms.push(`g_${options.gravity}`);
  } else if (options.crop === 'fill' || options.crop === 'thumb') {
    transforms.push('g_auto'); // Auto-detect important areas
  }

  // Blur (for placeholders)
  if (options.blur) {
    transforms.push(`e_blur:${options.blur}`);
  }

  // Radius (rounded corners)
  if (options.radius) {
    transforms.push(`r_${options.radius}`);
  }

  // DPR
  if (options.dpr) {
    transforms.push(`dpr_${options.dpr}`);
  }

  return transforms.join(',');
}

/**
 * Get optimized Cloudinary image URL
 * @param {string} publicId - Cloudinary public ID (path)
 * @param {Object} options - Transformation options
 * @returns {string} - Full Cloudinary URL
 */
export function getImageUrl(publicId, options = {}) {
  if (!publicId) return '';

  // If it's already a full URL, return as-is
  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    return publicId;
  }

  const transforms = buildTransformString(options);
  return `${BASE_URL}/${transforms}/${publicId}`;
}

/**
 * Get blur placeholder URL (tiny, blurred version)
 * @param {string} publicId - Cloudinary public ID
 * @returns {string} - Blurred placeholder URL
 */
export function getPlaceholderUrl(publicId) {
  return getImageUrl(publicId, {
    width: 20,
    quality: 30,
    blur: 1000,
  });
}

/**
 * Get responsive image srcset
 * @param {string} publicId - Cloudinary public ID
 * @param {number[]} widths - Array of widths for srcset
 * @param {Object} options - Base transformation options
 * @returns {string} - srcset string
 */
export function getSrcSet(publicId, widths = [320, 640, 960, 1280, 1920], options = {}) {
  return widths
    .map(w => `${getImageUrl(publicId, { ...options, width: w })} ${w}w`)
    .join(', ');
}

/**
 * Get responsive sizes attribute based on breakpoints
 * @param {Object} sizes - Breakpoint to size mapping
 * @returns {string} - sizes attribute string
 */
export function getSizes(sizes = {}) {
  const defaultSizes = {
    sm: '100vw',
    md: '50vw',
    lg: '33vw',
    default: '100vw',
  };

  const merged = { ...defaultSizes, ...sizes };
  const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  };

  const parts = [];
  Object.entries(merged).forEach(([key, value]) => {
    if (key === 'default') return;
    if (breakpoints[key]) {
      parts.push(`(min-width: ${breakpoints[key]}px) ${value}`);
    }
  });

  parts.push(merged.default);
  return parts.join(', ');
}

/**
 * Presets for common image use cases
 */
export const PRESETS = {
  avatar: {
    width: 200,
    height: 200,
    crop: 'thumb',
    gravity: 'face',
    radius: 'max',
  },
  thumbnail: {
    width: 400,
    height: 300,
    crop: 'fill',
    gravity: 'auto',
  },
  hero: {
    width: 1920,
    height: 1080,
    crop: 'fill',
    gravity: 'auto',
  },
  gallery: {
    width: 800,
    crop: 'scale',
  },
  card: {
    width: 600,
    height: 400,
    crop: 'fill',
    gravity: 'auto',
  },
};

/**
 * Get image URL with preset
 * @param {string} publicId - Cloudinary public ID
 * @param {string} presetName - Preset name
 * @param {Object} overrides - Override preset options
 * @returns {string} - Cloudinary URL
 */
export function getPresetUrl(publicId, presetName, overrides = {}) {
  const preset = PRESETS[presetName] || {};
  return getImageUrl(publicId, { ...preset, ...overrides });
}

export default {
  getImageUrl,
  getPlaceholderUrl,
  getSrcSet,
  getSizes,
  getPresetUrl,
  PRESETS,
};
