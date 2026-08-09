// Prepends PUBLIC_URL to root-relative asset paths so images resolve
// correctly whether the site is served from a subpath (/eva-website) or
// a custom domain (/).  External URLs and data: URIs are returned as-is.
export function assetUrl(src) {
  if (!src) return src;
  if (src.startsWith('/') && !src.startsWith('//')) {
    return `${process.env.PUBLIC_URL}${src}`;
  }
  return src;
}
