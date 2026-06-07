/**
 * Compress an image File/Blob to a JPEG data URL with max dimensions and quality.
 * If the source is already smaller than maxWidth/maxHeight, no upscaling is applied.
 *
 * @param {File|Blob} file
 * @param {number} maxWidth  - Maximum output width in pixels (default 1920)
 * @param {number} maxHeight - Maximum output height in pixels (default 1920)
 * @param {number} quality   - JPEG quality 0–1 (default 0.82)
 * @returns {Promise<string>} Compressed JPEG as a data URL
 */
export function compressImageToDataURL(file, maxWidth = 1920, maxHeight = 1920, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxWidth / img.naturalWidth, maxHeight / img.naturalHeight);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed'));
    };

    img.src = objectUrl;
  });
}

/**
 * Strip the `data:...;base64,` header from a data URL and return only the base64 string.
 * @param {string} dataURL
 * @returns {string}
 */
export function dataURLToBase64(dataURL) {
  const idx = dataURL.indexOf(',');
  return idx !== -1 ? dataURL.slice(idx + 1) : dataURL;
}

/**
 * Encode a UTF-8 string as base64 safely (handles non-ASCII characters).
 * @param {string} str
 * @returns {string}
 */
export function stringToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}
