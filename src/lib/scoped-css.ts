export function scopedCss(css: string | null | undefined, scopeClass: string) {
  const source = String(css || '').replace(/<\/style/gi, '<\\/style').trim();
  if (!source) return '';
  return `@scope (.${scopeClass}) {\n${source}\n}`;
}
