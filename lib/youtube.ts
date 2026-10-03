export function extractYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  if (match && match[2] && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}?rel=0&modestbranding=1&playsinline=1`;
  }
  return url;
}
