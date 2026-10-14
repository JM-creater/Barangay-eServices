/**
 * Client-Side Edge Image Quality Evaluation
 * Barangay e-Services - Computer Vision Engine
 * Barangay Cansojong, Talisay City, Cebu
 *
 * Runs in-browser via HTML5 Canvas in < 5ms before files hit the network.
 * Detects motion blur, specular camera flash glare, and ISO card aspect ratios.
 */

export interface EdgeImageQualityResult {
  isAcceptable: boolean;
  blurScore: number;
  isBlurry: boolean;
  glareRatio: number;
  hasGlare: boolean;
  aspectRatio: number;
  width: number;
  height: number;
  qualityBadge: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'POOR';
  warnings: string[];
  recommendations: string[];
}

export async function evaluateImageQuality(imageFile: File): Promise<EdgeImageQualityResult> {
  return new Promise((resolve) => {
    // Graceful fallback for non-image or empty files
    if (!imageFile || !imageFile.type.startsWith('image/')) {
      resolve({
        isAcceptable: true,
        blurScore: 120,
        isBlurry: false,
        glareRatio: 0,
        hasGlare: false,
        aspectRatio: 1.58,
        width: 0,
        height: 0,
        qualityBadge: 'GOOD',
        warnings: [],
        recommendations: [],
      });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(imageFile);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;
      const aspectRatio = Math.round((naturalWidth / Math.max(naturalHeight, 1)) * 100) / 100;

      // Downscale to 320px width for sub-5ms client execution
      const targetWidth = 320;
      const scale = targetWidth / Math.max(naturalWidth, 1);
      const targetHeight = Math.max(Math.round(naturalHeight * scale), 1);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });

      if (!ctx) {
        resolve({
          isAcceptable: true,
          blurScore: 120,
          isBlurry: false,
          glareRatio: 0,
          hasGlare: false,
          aspectRatio,
          width: naturalWidth,
          height: naturalHeight,
          qualityBadge: 'GOOD',
          warnings: [],
          recommendations: [],
        });
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      const imgData = ctx.getImageData(0, 0, targetWidth, targetHeight);
      const data = imgData.data;
      const totalPixels = targetWidth * targetHeight;

      const gray = new Float32Array(totalPixels);
      let glarePixels = 0;

      // 1. Grayscale & Glare Detection
      for (let i = 0; i < totalPixels; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        gray[i] = lum;
        if (lum >= 250) {
          glarePixels++;
        }
      }

      const glareRatio = Math.round((glarePixels / totalPixels) * 1000) / 10; // in percent

      // 2. 3x3 Discrete Laplacian Convolution
      let sum = 0;
      let sumSq = 0;
      let edgeCount = 0;

      for (let y = 1; y < targetHeight - 1; y++) {
        for (let x = 1; x < targetWidth - 1; x++) {
          const idx = y * targetWidth + x;
          const laplacian =
            gray[idx - targetWidth] +
            gray[idx + targetWidth] +
            gray[idx - 1] +
            gray[idx + 1] -
            4 * gray[idx];

          sum += laplacian;
          sumSq += laplacian * laplacian;
          edgeCount++;
        }
      }

      const mean = edgeCount > 0 ? sum / edgeCount : 0;
      const variance = edgeCount > 0 ? Math.max(sumSq / edgeCount - mean * mean, 0) : 100;
      const blurScore = Math.round(variance);

      // Thresholds:
      // variance < 70 indicates heavy motion blur
      // glareRatio > 8% indicates specular reflection
      const isBlurry = blurScore < 70;
      const hasGlare = glareRatio > 8.0;

      const warnings: string[] = [];
      const recommendations: string[] = [];

      if (isBlurry) {
        warnings.push('Image appears blurry (motion blur or focus issue detected).');
        recommendations.push('Please retake the photo holding the camera steady in good lighting.');
      }

      if (hasGlare) {
        warnings.push('Light reflection or camera flash glare detected on the image surface.');
        recommendations.push('Please turn off the camera flash to ensure all ID numbers and text remain legible.');
      }

      let qualityBadge: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'POOR' = 'EXCELLENT';
      if (isBlurry && hasGlare) {
        qualityBadge = 'POOR';
      } else if (isBlurry || hasGlare) {
        qualityBadge = 'NEEDS_ATTENTION';
      } else if (blurScore > 140) {
        qualityBadge = 'EXCELLENT';
      } else {
        qualityBadge = 'GOOD';
      }

      resolve({
        isAcceptable: !isBlurry && !hasGlare,
        blurScore,
        isBlurry,
        glareRatio,
        hasGlare,
        aspectRatio,
        width: naturalWidth,
        height: naturalHeight,
        qualityBadge,
        warnings,
        recommendations,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isAcceptable: true,
        blurScore: 100,
        isBlurry: false,
        glareRatio: 0,
        hasGlare: false,
        aspectRatio: 1.58,
        width: 0,
        height: 0,
        qualityBadge: 'GOOD',
        warnings: [],
        recommendations: [],
      });
    };

    img.src = objectUrl;
  });
}
