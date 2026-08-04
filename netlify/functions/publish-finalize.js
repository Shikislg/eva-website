const {
  json,
  checkAuth,
  githubGetFileContent,
  collectManagedImagePaths,
  githubGetBranchHead,
  githubCreateTree,
  githubCreateCommit,
  githubUpdateRef,
} = require('./lib/github');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'Method not allowed.' });
  }

  const auth = checkAuth(event);
  if (auth.error) return auth.error;
  const { token } = auth;

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return json(400, { error: 'Invalid JSON body.' });
  }

  const {
    owner,
    repo,
    branch = 'master',
    pathPrefix = 'public',
    projects,
    imageManifest = [],
  } = body;

  if (!owner || !repo) {
    return json(400, { error: 'owner and repo are required.' });
  }
  if (!Array.isArray(projects)) {
    return json(400, { error: 'projects must be an array.' });
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

    return json(200, galleryData);
  } catch (error) {
    return json(500, { error: error.message || 'Publish failed.' });
  }
};
