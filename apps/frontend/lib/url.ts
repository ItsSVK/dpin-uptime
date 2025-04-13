export function formatUrl(url: string): string {
  // format the url also check for trailing slashes and www
  url = url.startsWith('http') ? url : `https://${url}`;
  if (!url.endsWith('/')) {
    url += '/';
  }

  if (url.includes('www.')) {
    url = url.replace('www.', '');
  }

  return url;
}
