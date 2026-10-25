import GithubSlugger from 'github-slugger';

// Matches the ids rehype-slug gives to h2 headings in the rendered post.
export function headingsOf(markdown = '') {
  const slugger = new GithubSlugger();
  const out = [];
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (/^```/.test(line.trim())) inFence = !inFence;
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/[*_`]/g, '').replace(/\[(.*?)\]\(.*?\)/g, '$1');
    const id = slugger.slug(text);
    if (m[1].length === 2) out.push({ id, text });
  }
  return out;
}
