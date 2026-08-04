const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '10mb' }));

const token =
  process.env.GITHUB_PAT ||
  process.env.PERSONAL_ACCESS_TOKEN ||
  process.env.Personal_Access_Token ||
  '';
const publishSecret = process.env.PUBLISH_API_SECRET || '';

const MIME_TO_EXTENSION = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

// In-memory staging for chunked image uploads (uploadId -> { chunks: Buffer[], createdAt }).
// The Express process is long-lived (unlike a Netlify Function invocation), so a plain
// Map is sufficient — no durable storage needed.
const pendingUploads = new Map();
const STALE_UPLOAD_MS = 30 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [id, entry] of pendingUploads) {
    if (now - entry.createdAt > STALE_UPLOAD_MS) pendingUploads.delete(id);
  }
}, 10 * 60 * 1000);

async function githubApi(authToken, method, url, body) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = `GitHub API error ${res.status}`;
    try {
      msg = JSON.parse(text).message || msg;
    } catch {
      // Keep fallback message.
    }
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

async function githubGetFileContent(authToken, owner, repo, branch, filePath) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (typeof data.content === 'string') {
        return Buffer.from(data.content, 'base64').toString('utf8');
      }
    }
  } catch {
    // Return null when the file can't be read (e.g. first publish).
  }

  return null;
}

function collectManagedImagePaths(projects, pathPrefix) {
  const paths = new Set();
  const prefix = '/img/gallery/';

  for (const project of projects || []) {
    const candidates = [project.coverImage, ...(Array.isArray(project.images) ? project.images : [])];
    for (const src of candidates) {
      if (typeof src === 'string' && src.startsWith(prefix)) {
        paths.add(`${pathPrefix}${src}`);
      }
    }
  }

  return paths;
}

async function githubCreateBlob(authToken, owner, repo, base64Content) {
  const data = await githubApi(authToken, 'POST', `https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
    content: base64Content,
    encoding: 'base64',
  });
  return data.sha;
}

async function githubGetBranchHead(authToken, owner, repo, branch) {
  const data = await githubApi(
    authToken, 'GET',
    `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`
  );
  return { commitSha: data.commit.sha, treeSha: data.commit.commit.tree.sha };
}

async function githubCreateTree(authToken, owner, repo, baseTreeSha, tree) {
  const data = await githubApi(authToken, 'POST', `https://api.github.com/repos/${owner}/${repo}/git/trees`, {
    base_tree: baseTreeSha,
    tree,
  });
  return data.sha;
}

async function githubCreateCommit(authToken, owner, repo, treeSha, parentSha, message) {
  const data = await githubApi(authToken, 'POST', `https://api.github.com/repos/${owner}/${repo}/git/commits`, {
    message,
    tree: treeSha,
    parents: [parentSha],
  });
  return data.sha;
}

async function githubUpdateRef(authToken, owner, repo, branch, commitSha) {
  await githubApi(
    authToken, 'PATCH',
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`,
    { sha: commitSha }
  );
}

function checkAuth(req, res) {
  if (!publishSecret) {
    res.status(500).json({ error: 'Server publish secret missing. Set PUBLISH_API_SECRET in .env.' });
    return false;
  }
  if ((req.get('X-Publish-Secret') || '') !== publishSecret) {
    res.status(401).json({ error: 'Unauthorized publish request.' });
    return false;
  }
  if (!token) {
    res.status(500).json({
      error: 'Server token missing. Set GITHUB_PAT (or PERSONAL_ACCESS_TOKEN / Personal_Access_Token) in .env.',
    });
    return false;
  }
  return true;
}

app.post('/api/auth', (req, res) => {
  const adminPassword = process.env.ADMIN_PASSWORD || '';
  if (!adminPassword) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD not set in .env.' });
  }
  if (!req.body?.password || req.body.password !== adminPassword) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }
  return res.json({ ok: true });
});

app.post('/api/publish-image-chunk', async (req, res) => {
  if (!checkAuth(req, res)) return;

  const { owner, repo, uploadId, projectId, slot, index, mimeType, chunkIndex, totalChunks, chunkBase64 } = req.body || {};

  if (!owner || !repo || !uploadId || !projectId || !slot || typeof chunkIndex !== 'number' || typeof totalChunks !== 'number' || !chunkBase64) {
    return res.status(400).json({ error: 'Missing required chunk fields.' });
  }

  const extension = MIME_TO_EXTENSION[mimeType];
  if (!extension) {
    return res.status(400).json({ error: `Unsupported image type: ${mimeType}` });
  }

  try {
    let entry = pendingUploads.get(uploadId);
    if (!entry) {
      entry = { chunks: [], createdAt: Date.now() };
      pendingUploads.set(uploadId, entry);
    }
    entry.chunks[chunkIndex] = Buffer.from(chunkBase64, 'base64');

    if (chunkIndex < totalChunks - 1) {
      return res.json({ received: true, chunkIndex });
    }

    const full = Buffer.concat(entry.chunks);
    pendingUploads.delete(uploadId);

    if (full.length > 100 * 1024 * 1024) {
      return res.status(413).json({ error: 'Image exceeds the 100MB GitHub blob limit.' });
    }

    const gitPath = slot === 'cover' ? `cover.${extension}` : `${index}.${extension}`;
    const publicPath = `/img/gallery/${projectId}/${gitPath}`;
    const blobSha = await githubCreateBlob(token, owner, repo, full.toString('base64'));

    return res.json({ received: true, done: true, path: publicPath, blobSha, size: full.length });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Image upload failed.' });
  }
});

app.post('/api/publish-finalize', async (req, res) => {
  if (!checkAuth(req, res)) return;

  const {
    owner,
    repo,
    branch = 'master',
    pathPrefix = 'public',
    projects,
    imageManifest = [],
  } = req.body || {};

  if (!owner || !repo) {
    return res.status(400).json({ error: 'owner and repo are required.' });
  }
  if (!Array.isArray(projects)) {
    return res.status(400).json({ error: 'projects must be an array.' });
  }

  try {
    const galleryDataPath = `${pathPrefix}/gallery-data.json`;
    const previousRaw = await githubGetFileContent(token, owner, repo, branch, galleryDataPath);
    let previousProjects = [];
    if (previousRaw) {
      try {
        const parsed = JSON.parse(previousRaw);
        if (Array.isArray(parsed.projects)) previousProjects = parsed.projects;
      } catch {
        // Treat unparsable previous data as if nothing was published yet.
      }
    }
    const previousImagePaths = collectManagedImagePaths(previousProjects, pathPrefix);
    const newImagePaths = collectManagedImagePaths(projects, pathPrefix);
    const orphanedPaths = [...previousImagePaths].filter((p) => !newImagePaths.has(p));

    const timestamp = Date.now();
    const galleryData = { lastPublished: timestamp, projects };

    const tree = [
      ...imageManifest.map(({ path: imgPath, blobSha }) => ({
        path: `${pathPrefix}${imgPath}`,
        mode: '100644',
        type: 'blob',
        sha: blobSha,
      })),
      ...orphanedPaths.map((orphanPath) => ({
        path: orphanPath,
        mode: '100644',
        type: 'blob',
        sha: null,
      })),
      {
        path: galleryDataPath,
        mode: '100644',
        type: 'blob',
        content: JSON.stringify(galleryData, null, 2),
      },
    ];

    const { commitSha: baseCommitSha, treeSha: baseTreeSha } = await githubGetBranchHead(token, owner, repo, branch);
    const newTreeSha = await githubCreateTree(token, owner, repo, baseTreeSha, tree);
    const newCommitSha = await githubCreateCommit(token, owner, repo, newTreeSha, baseCommitSha, 'Update gallery data');
    await githubUpdateRef(token, owner, repo, branch, newCommitSha);

    return res.json(galleryData);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Publish failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Publish API listening on http://localhost:${PORT}`);
});
