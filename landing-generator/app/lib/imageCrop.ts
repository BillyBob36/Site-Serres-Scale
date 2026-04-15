/**
 * Auto-crop/resize a data-URL image to target dimensions using canvas.
 * Uses "cover" strategy: scale to fill, then center-crop.
 */
export function autoCropToTarget(
  dataUrl: string,
  targetW: number,
  targetH: number,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const srcW = img.naturalWidth;
      const srcH = img.naturalHeight;

      const srcRatio = srcW / srcH;
      const tgtRatio = targetW / targetH;

      let cropW: number, cropH: number, cropX: number, cropY: number;

      if (srcRatio > tgtRatio) {
        cropH = srcH;
        cropW = srcH * tgtRatio;
        cropX = (srcW - cropW) / 2;
        cropY = 0;
      } else {
        cropW = srcW;
        cropH = srcW / tgtRatio;
        cropX = 0;
        cropY = (srcH - cropH) / 2;
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2D context unavailable"));
        return;
      }
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => reject(new Error("Failed to load image for crop"));
    img.src = dataUrl;
  });
}
