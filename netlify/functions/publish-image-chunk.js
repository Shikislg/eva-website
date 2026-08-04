const { connectLambda, getStore } = require('@netlify/blobs');
const { MIME_TO_EXTENSION, json, checkAuth, githubCreateBlob } = require('./lib/github');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  connectLambda(event);

  const auth = checkAuth(event);
  if (auth.error) return auth.error;
  const { token } = auth;

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body.' });
  }

  const { owner, repo, uploadId, projectId, slot, index, mimeType, chunkIndex, totalChunks, chunkBase64 } = body;

  if (!owner || !repo || !uploadId || !projectId || !slot || typeof chunkIndex !== 'number' || typeof totalChunks !== 'number' || !chunkBase64) {
    return json(400, { error: 'Missing required chunk fields.' });
  }

  const extension = MIME_TO_EXTENSION[mimeType];
  if (!extension) {
    return json(400, { error: `Unsupported image type: ${mimeType}` });
  }

  try {
    const store = getStore({ name: 'publish-uploads', consistency: 'strong' });
    await store.set(`${uploadId}/${chunkIndex}`, Buffer.from(chunkBase64, 'base64'));

    if (chunkIndex < totalChunks - 1) {
      return json(200, { received: true, chunkIndex });
    }

    const parts = [];
    for (let i = 0; i < totalChunks; i++) {
      const buf = await store.get(`${uploadId}/${i}`, { type: 'arrayBuffer' });
      parts.push(Buffer.from(buf));
    }
    const full = Buffer.concat(parts);

    if (full.length > 100 * 1024 * 1024) {
      for (let i = 0; i < totalChunks; i++) await store.delete(`${uploadId}/${i}`);
      return json(413, { error: 'Image exceeds the 100MB GitHub blob limit.' });
    }

    const gitPath = slot === 'cover' ? `cover.${extension}` : `${index}.${extension}`;
    const publicPath = `/img/gallery/${projectId}/${gitPath}`;
    const blobSha = await githubCreateBlob(token, owner, repo, full.toString('base64'));

    for (let i = 0; i < totalChunks; i++) await store.delete(`${uploadId}/${i}`);

    return json(200, { received: true, done: true, path: publicPath, blobSha, size: full.length });
  } catch (error) {
    return json(500, { error: error.message || 'Image upload failed.' });
  }
};
