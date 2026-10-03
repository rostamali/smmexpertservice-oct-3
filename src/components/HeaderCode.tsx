import type { ReactNode } from 'react';

const attributePattern = /([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function parseAttributes(source: string) {
  const props: Record<string, string | boolean> = {};
  let match: RegExpExecArray | null;
  while ((match = attributePattern.exec(source))) {
    const rawName = match[1].toLowerCase();
    if (rawName.startsWith('on')) continue;
    const nameMap: Record<string, string> = {
      'http-equiv': 'httpEquiv',
      'accept-charset': 'acceptCharset',
      charset: 'charSet',
      crossorigin: 'crossOrigin',
      referrerpolicy: 'referrerPolicy',
      fetchpriority: 'fetchPriority',
    };
    const name = nameMap[rawName] || rawName;
    const value = match[2] ?? match[3] ?? match[4];
    props[name] = value === undefined ? true : value;
  }
  return props;
}

/**
 * Converts admin-only header snippets into stable React nodes instead of mutating
 * the complete <head> with dangerouslySetInnerHTML. This prevents hydration
 * mismatches while still supporting verification meta tags and analytics scripts.
 */
export default function HeaderCode({ code }: { code?: string | null }) {
  if (!code?.trim()) return null;
  const nodes: ReactNode[] = [];
  let key = 0;

  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  const withoutScripts = code.replace(scriptPattern, (_full, attrs: string, body: string) => {
    nodes.push(<script key={`custom-script-${key++}`} {...(parseAttributes(attrs) as any)} dangerouslySetInnerHTML={{ __html: body }} />);
    return '';
  });

  const stylePattern = /<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi;
  const withoutStyles = withoutScripts.replace(stylePattern, (_full, attrs: string, body: string) => {
    nodes.push(<style key={`custom-style-${key++}`} {...(parseAttributes(attrs) as any)} dangerouslySetInnerHTML={{ __html: body }} />);
    return '';
  });

  const tagPattern = /<(meta|link)\b([^>]*)\/?\s*>/gi;
  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = tagPattern.exec(withoutStyles))) {
    const tag = tagMatch[1].toLowerCase();
    const props = parseAttributes(tagMatch[2]);
    if (tag === 'meta') nodes.push(<meta key={`custom-meta-${key++}`} {...(props as any)} />);
    if (tag === 'link') nodes.push(<link key={`custom-link-${key++}`} {...(props as any)} />);
  }

  return <>{nodes}</>;
}
