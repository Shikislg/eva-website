/**
 * Read a File/Blob's exact original bytes as a data URL — no resize, no recompression.
 * @param {File|Blob} file
 * @returns {Promise<string>}
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Image read failed'));
    reader.readAsDataURL(file);
  });
}

// Long-edge cap in pixels and JPEG quality used only when an image actually needs
// downscaling (see prepareImageForUpload) — chosen to comfortably exceed any on-site
// display size while cutting typical 20MB+ camera originals down to a few MB.
const MAX_DIMENSION = 2000;
const JPEG_QUALITY = 0.9;

/**
 * Read a File's bytes untouched if it's already within MAX_DIMENSION; otherwise downscale
 * so its long edge is MAX_DIMENSION and re-encode (PNG stays PNG/lossless at the new
 * resolution, everything else becomes high-quality JPEG). Resizing unavoidably requires
 * decoding + re-encoding, so this is the minimum amount of lossy processing needed to keep
 * multi-ten-megapixel camera originals from producing multi-ten-megabyte files — nothing
 * is touched for images that don't exceed the cap.
 * @param {File|Blob} file
 * @returns {Promise<string>} data URL
 */
export function prepareImageForUpload(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h));
      URL.revokeObjectURL(objectUrl);

      if (scale === 1) {
        readFileAsDataURL(file).then(resolve, reject);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(
        file.type === 'image/png'
          ? canvas.toDataURL('image/png')
          : canvas.toDataURL('image/jpeg', JPEG_QUALITY)
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed'));
    };
    img.src = objectUrl;
  });
}

/**
 * Extract the MIME type from a `data:` URL.
 * @param {string} dataURL
 * @returns {string|null}
 */
export function getDataURLMimeType(dataURL) {
  const match = /^data:([^;]+);base64,/.exec(dataURL || '');
  return match ? match[1] : null;
}

// Single source of truth for formats the publish pipeline can name a file for.
// Mirrored server-side in netlify/functions/lib/github.js and backend/server.js.
export const MIME_TO_EXTENSION = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

/**
 * @param {string} mime
 * @returns {string|null} extension without a leading dot, or null if unsupported
 */
export function extensionForMimeType(mime) {
  return MIME_TO_EXTENSION[mime] || null;
}

/**
 * Base64-encode a chunk Blob's raw bytes (no data: prefix) for the chunked upload wire format.
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
export async function blobChunkToBase64(blob) {
  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const STEP = 0x8000;
  for (let i = 0; i < bytes.length; i += STEP) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + STEP));
  }
  return btoa(binary);
}
