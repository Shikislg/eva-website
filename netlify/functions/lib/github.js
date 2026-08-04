// Shared GitHub Git Data API helpers for the chunk-upload + finalize publish functions.
// Mirrors backend/server.js's helpers for local dev.

const MIME_TO_EXTENSION = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function checkAuth(event) {
  const publishSecret = process.env.PUBLISH_API_SECRET || '';
  const token =
    process.env.GITHUB_PAT ||
    process.env.PERSONAL_ACCESS_TOKEN ||
    process.env.Personal_Access_Token ||
    '';

  if (!publishSecret) {
    return { error: json(500, { error: 'Server publish secret missing. Set PUBLISH_API_SECRET in Netlify environment variables.' }) };
  }
  // Netlify lowercases all incoming headers.
  if ((event.headers['x-publish-secret'] || '') !== publishSecret) {
    return { error: json(401, { error: 'Unauthorized publish request.' }) };
  }
  if (!token) {
    return { error: json(500, { error: 'Server token missing. Set GITHUB_PAT in Netlify environment variables.' }) };
  }
  return { token };
}

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
    try { msg = JSON.parse(text).message || msg; } catch {}
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

module.exports = {
  MIME_TO_EXTENSION,
  json,
  checkAuth,
  githubGetFileContent,
  collectManagedImagePaths,
  githubCreateBlob,
  githubGetBranchHead,
  githubCreateTree,
  githubCreateCommit,
  githubUpdateRef,
};
