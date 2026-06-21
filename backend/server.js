const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json({ limit: '100mb' }));

const token =
  process.env.GITHUB_PAT ||
  process.env.PERSONAL_ACCESS_TOKEN ||
  process.env.Personal_Access_Token ||
  '';
const publishSecret = process.env.PUBLISH_API_SECRET || '';

function dataURLToBase64(dataURL) {
  const match = /^data:.*?;base64,(.*)$/.exec(dataURL || '');
  return match ? match[1] : '';
}

function stringToBase64(str) {
  return Buffer.from(str, 'utf8').toString('base64');
}

async function githubGetFileSHA(authToken, owner, repo, branch, path) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: 'application/vnd.github+json',
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      return data.sha || null;
    }
  } catch {
    // Return null when SHA lookup fails so create/update can still attempt.
  }

  return null;
}

async function githubGetFileContent(authToken, owner, repo, branch, path) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`,
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

async function githubDeleteFile(authToken, owner, repo, branch, path, message) {
  const sha = await githubGetFileSHA(authToken, owner, repo, branch, path);
  if (!sha) return; // Already gone.

  await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify({ message, sha, branch }),
    }
  );
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

async function githubCommitFile(authToken, owner, repo, branch, path, base64Content, message) {
  const sha = await githubGetFileSHA(authToken, owner, repo, branch, path);
  const body = { message, content: base64Content, branch };
  if (sha) body.sha = sha;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify(body),
    }
  );

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

  return res.json();
}

app.post('/api/publish-gallery', async (req, res) => {
  if (!publishSecret) {
    return res.status(500).json({
      error: 'Server publish secret missing. Set PUBLISH_API_SECRET in .env.',
    });
  }

  const headerSecret = req.get('X-Publish-Secret') || '';
  if (headerSecret !== publishSecret) {
    return res.status(401).json({ error: 'Unauthorized publish request.' });
  }

  if (!token) {
    return res.status(500).json({
      error: 'Server token missing. Set GITHUB_PAT (or PERSONAL_ACCESS_TOKEN / Personal_Access_Token) in .env.',
    });
  }

  const {
    owner,
    repo,
    branch = 'master',
    pathPrefix = 'public',
    projects,
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

    const timestamp = Date.now();
    const updatedProjects = [];

    for (const project of projects) {
      let coverImage = project.coverImage;

      if (typeof coverImage === 'string' && coverImage.startsWith('data:')) {
        const filePath = `${pathPrefix}/img/gallery/${project.id}/cover.jpg`;
        await githubCommitFile(
          token,
          owner,
          repo,
          branch,
          filePath,
          dataURLToBase64(coverImage),
          `Add cover image for ${project.title}`
        );
        coverImage = `/img/gallery/${project.id}/cover.jpg`;
      }

      const updatedImages = [];
      const images = Array.isArray(project.images) ? project.images : [];

      for (let i = 0; i < images.length; i++) {
        let imgSrc = images[i];
        if (typeof imgSrc === 'string' && imgSrc.startsWith('data:')) {
          const filePath = `${pathPrefix}/img/gallery/${project.id}/${i}.jpg`;
          await githubCommitFile(
            token,
            owner,
            repo,
            branch,
            filePath,
            dataURLToBase64(imgSrc),
            `Add gallery image for ${project.title}`
          );
          imgSrc = `/img/gallery/${project.id}/${i}.jpg`;
        }
        updatedImages.push(imgSrc);
      }

      updatedProjects.push({ ...project, coverImage, images: updatedImages });
    }

    const newImagePaths = collectManagedImagePaths(updatedProjects, pathPrefix);
    const orphanedPaths = [...previousImagePaths].filter((p) => !newImagePaths.has(p));
    for (const orphanPath of orphanedPaths) {
      await githubDeleteFile(token, owner, repo, branch, orphanPath, `Remove unused gallery image ${orphanPath}`);
    }

    const galleryData = {
      lastPublished: timestamp,
      projects: updatedProjects,
    };

    await githubCommitFile(
      token,
      owner,
      repo,
      branch,
      galleryDataPath,
      stringToBase64(JSON.stringify(galleryData, null, 2)),
      'Update gallery data'
    );

    return res.json(galleryData);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Publish failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Publish API listening on http://localhost:${PORT}`);
});
