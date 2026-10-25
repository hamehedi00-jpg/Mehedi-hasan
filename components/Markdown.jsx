import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import Chart from './Chart';

function textOf(node) {
  if (!node) return '';
  if (node.type === 'text') return node.value;
  return (node.children || []).map(textOf).join('');
}

const components = {
  pre({ node, children }) {
    const code = node?.children?.[0];
    const cls = code?.properties?.className || [];
    if (code?.tagName === 'code' && cls.includes('language-chart')) {
      return <Chart source={textOf(code)} />;
    }
    return <pre>{children}</pre>;
  },
  table({ children }) {
    return (
      <div className="table-wrap">
        <table>{children}</table>
      </div>
    );
  },
  img({ src, alt }) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt || ''} loading="lazy" decoding="async" />;
  },
  a({ href = '', children, ...rest }) {
    const external = /^https?:\/\//.test(href);
    const keep = {};
    if (rest['data-footnote-ref'] !== undefined) keep['data-footnote-ref'] = '';
    if (rest['data-footnote-backref'] !== undefined) keep['data-footnote-backref'] = '';
    if (rest.id) keep.id = rest.id;
    if (rest['aria-describedby']) keep['aria-describedby'] = rest['aria-describedby'];
    return (
      <a href={href} {...keep} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {children}
      </a>
    );
  },
};

export default function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>
      {children || ''}
    </ReactMarkdown>
  );
}
