import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'wouter';

// Legacy articles use headings, emphasis, numbered lists and reference links.
// Raw HTML remains disabled; imported content cannot execute scripts.
const components = {
  h2: ({ children }) => <h2 className="mb-4 mt-10 text-2xl font-bold text-navy">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-3 mt-8 text-xl font-bold text-navy">{children}</h3>,
  ul: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-6">{children}</ul>,
  ol: ({ children }) => <ol className="my-5 list-decimal space-y-2 pl-6">{children}</ol>,
  blockquote: ({ children }) => <blockquote className="my-6 border-l-4 border-gold pl-5 italic">{children}</blockquote>,
  a: ({ href, children }) => href?.startsWith('/') && !href.startsWith('//')
    ? <Link href={href} className="break-words text-navy underline decoration-gold underline-offset-4">{children}</Link>
    : <a href={href} target="_blank" rel="noopener noreferrer" className="break-words text-navy underline decoration-gold underline-offset-4">{children}</a>,
  table: ({ children }) => <div className="my-6 overflow-x-auto"><table className="w-full border-collapse text-left">{children}</table></div>,
  th: ({ children }) => <th className="border border-line bg-mist p-3">{children}</th>,
  td: ({ children }) => <td className="border border-line p-3">{children}</td>,
};

export function BlogBody({ text }) {
  return <div className="prose-4pl break-words leading-relaxed text-foreground/85"><ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>{text || ''}</ReactMarkdown></div>;
}
