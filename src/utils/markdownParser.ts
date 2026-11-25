/**
 * Pure, zero-dependency, XSS-safe Markdown AST parser for task notes.
 *
 * Parses headings, paragraphs, unordered lists, ordered lists, checklists,
 * blockquotes, bold, italic, strikethrough, inline code, and strictly
 * sanitized http(s)/mailto links into typed AST nodes rendered via React JSX
 * (never via raw HTML injection).
 */

export type MarkdownInlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; children: MarkdownInlineNode[] }
  | { type: 'italic'; children: MarkdownInlineNode[] }
  | { type: 'strike'; children: MarkdownInlineNode[] }
  | { type: 'code'; value: string }
  | { type: 'link'; label: string; href: string };

export interface MarkdownListItem {
  checked?: boolean;
  children: MarkdownInlineNode[];
}

export type MarkdownBlockNode =
  | { type: 'heading'; level: 1 | 2 | 3; children: MarkdownInlineNode[] }
  | { type: 'paragraph'; children: MarkdownInlineNode[] }
  | { type: 'unordered-list'; items: MarkdownListItem[] }
  | { type: 'ordered-list'; items: MarkdownListItem[] }
  | { type: 'blockquote'; children: MarkdownInlineNode[] };

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

/**
 * Validates and normalizes a user-supplied URL for Markdown links.
 * Returns a safe href string for http:, https:, or mailto: links,
 * or null for dangerous schemes (javascript:, data:, vbscript:, file:, //).
 */
export function sanitizeMarkdownUrl(rawUrl: string): string | null {
  if (typeof rawUrl !== 'string') return null;

  // Strip ASCII control characters and surrounding whitespace
  const cleaned = rawUrl.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!cleaned || cleaned.startsWith('//')) return null;

  // Reject any explicit scheme not in our strict allowlist
  const schemeMatch = cleaned.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!schemeMatch) {
    return null;
  }

  const protocol = `${schemeMatch[1].toLowerCase()}:`;
  if (!ALLOWED_PROTOCOLS.has(protocol)) {
    return null;
  }

  try {
    const parsed = new URL(cleaned);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return null;
    }
    if (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      !parsed.hostname
    ) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

const MAX_INLINE_DEPTH = 4;

/**
 * Parses inline Markdown syntax (links, autolinks, inline code, bold, italic,
 * strikethrough) using linear/bounded scanning without unsafe HTML output.
 */
export function parseMarkdownInlines(
  input: string,
  depth = 0
): MarkdownInlineNode[] {
  if (!input) return [];
  if (depth >= MAX_INLINE_DEPTH) {
    return [{ type: 'text', value: input }];
  }

  const nodes: MarkdownInlineNode[] = [];
  let textBuffer = '';
  let i = 0;

  const flushText = () => {
    if (textBuffer.length > 0) {
      nodes.push({ type: 'text', value: textBuffer });
      textBuffer = '';
    }
  };

  while (i < input.length) {
    const ch = input[i];

    // 1. Escaped punctuation (\*, \_, \`, \[, \], \~)
    if (ch === '\\' && i + 1 < input.length && /[*_`[\]~\\()]/.test(input[i + 1])) {
      textBuffer += input[i + 1];
      i += 2;
      continue;
    }

    // 2. Inline code: `code`
    if (ch === '`') {
      const endIdx = input.indexOf('`', i + 1);
      if (endIdx > i + 1) {
        flushText();
        nodes.push({ type: 'code', value: input.slice(i + 1, endIdx) });
        i = endIdx + 1;
        continue;
      }
    }

    // 3. Markdown link: [label](url) (supports balanced parentheses inside URLs)
    if (ch === '[') {
      const closeBracket = input.indexOf(']', i + 1);
      if (
        closeBracket > i + 1 &&
        input[closeBracket + 1] === '('
      ) {
        let parenDepth = 1;
        let scanIdx = closeBracket + 2;
        let closeParen = -1;
        while (scanIdx < input.length) {
          const urlChar = input[scanIdx];
          if (urlChar === '(') {
            parenDepth++;
          } else if (urlChar === ')') {
            parenDepth--;
            if (parenDepth === 0) {
              closeParen = scanIdx;
              break;
            }
          } else if (urlChar === '\n' || urlChar === '\r') {
            break;
          }
          scanIdx++;
        }

        if (closeParen > closeBracket + 2) {
          const rawLabel = input.slice(i + 1, closeBracket);
          const rawUrl = input.slice(closeBracket + 2, closeParen);
          const safeHref = sanitizeMarkdownUrl(rawUrl);

          flushText();
          if (safeHref) {
            nodes.push({
              type: 'link',
              label: rawLabel.trim() || safeHref,
              href: safeHref,
            });
          } else {
            // Neutralize unsafe URL scheme into plain text (never a clickable link)
            nodes.push({
              type: 'text',
              value: rawLabel.trim() || rawUrl.trim(),
            });
          }
          i = closeParen + 1;
          continue;
        }
      }
    }

    // 4. Bare autolink: https://... or http://...
    if (
      (input.startsWith('https://', i) || input.startsWith('http://', i)) &&
      (i === 0 || /[\s(]/.test(input[i - 1]))
    ) {
      let endIdx = i;
      while (endIdx < input.length && !/[\s<>()[\]"']/.test(input[endIdx])) {
        endIdx++;
      }
      let candidate = input.slice(i, endIdx);
      // Trim trailing sentence punctuation
      while (/[.,;:!?]$/.test(candidate)) {
        candidate = candidate.slice(0, -1);
        endIdx--;
      }
      const safeHref = sanitizeMarkdownUrl(candidate);
      if (safeHref) {
        flushText();
        nodes.push({
          type: 'link',
          label: candidate,
          href: safeHref,
        });
        i = endIdx;
        continue;
      }
    }

    // 5. Bold: **text** or __text__
    if (
      (input.startsWith('**', i) || input.startsWith('__', i)) &&
      i + 2 < input.length &&
      input[i + 2] !== ' '
    ) {
      const marker = input.slice(i, i + 2);
      const endIdx = input.indexOf(marker, i + 2);
      if (endIdx > i + 2 && input[endIdx - 1] !== ' ') {
        flushText();
        nodes.push({
          type: 'bold',
          children: parseMarkdownInlines(input.slice(i + 2, endIdx), depth + 1),
        });
        i = endIdx + 2;
        continue;
      }
    }

    // 6. Strikethrough: ~~text~~
    if (
      input.startsWith('~~', i) &&
      i + 2 < input.length &&
      input[i + 2] !== ' '
    ) {
      const endIdx = input.indexOf('~~', i + 2);
      if (endIdx > i + 2 && input[endIdx - 1] !== ' ') {
        flushText();
        nodes.push({
          type: 'strike',
          children: parseMarkdownInlines(input.slice(i + 2, endIdx), depth + 1),
        });
        i = endIdx + 2;
        continue;
      }
    }

    // 7. Italic: *text* or _text_ (avoiding mid-word underscores like foo_bar_baz)
    if (
      (ch === '*' || (ch === '_' && (i === 0 || /[\s(]/.test(input[i - 1])))) &&
      i + 1 < input.length &&
      input[i + 1] !== ch &&
      input[i + 1] !== ' '
    ) {
      const endIdx = input.indexOf(ch, i + 1);
      if (
        endIdx > i + 1 &&
        input[endIdx - 1] !== ' ' &&
        (ch === '*' ||
          endIdx + 1 === input.length ||
          /[\s.,;:!?)]/.test(input[endIdx + 1]))
      ) {
        flushText();
        nodes.push({
          type: 'italic',
          children: parseMarkdownInlines(input.slice(i + 1, endIdx), depth + 1),
        });
        i = endIdx + 1;
        continue;
      }
    }

    textBuffer += ch;
    i++;
  }

  flushText();
  return nodes;
}

/**
 * Parses a multi-line Markdown note string into block-level AST nodes.
 */
export function parseMarkdownBlocks(rawMarkdown: string): MarkdownBlockNode[] {
  if (typeof rawMarkdown !== 'string' || !rawMarkdown.trim()) {
    return [];
  }

  const normalized = rawMarkdown.replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n');
  const blocks: MarkdownBlockNode[] = [];
  let idx = 0;

  const isSpecialLine = (line: string): boolean => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    return (
      /^#{1,3}\s+/.test(trimmed) ||
      /^[-*+]\s+/.test(trimmed) ||
      /^\d+[.)]\s+/.test(trimmed) ||
      /^>\s?/.test(trimmed)
    );
  };

  while (idx < lines.length) {
    const trimmed = lines[idx].trim();

    if (!trimmed) {
      idx++;
      continue;
    }

    // Heading (#, ##, ###)
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length as 1 | 2 | 3;
      blocks.push({
        type: 'heading',
        level,
        children: parseMarkdownInlines(headingMatch[2].trim()),
      });
      idx++;
      continue;
    }

    // Blockquote (> ...)
    if (/^>\s?/.test(trimmed)) {
      const quoteLines: string[] = [];
      while (idx < lines.length && /^>\s?/.test(lines[idx].trim())) {
        quoteLines.push(lines[idx].trim().replace(/^>\s?/, ''));
        idx++;
      }
      blocks.push({
        type: 'blockquote',
        children: parseMarkdownInlines(quoteLines.join(' ').trim()),
      });
      continue;
    }

    // Unordered list (- item, * item, + item, or - [x] checklist)
    if (/^[-*+]\s+/.test(trimmed)) {
      const items: MarkdownListItem[] = [];
      while (idx < lines.length && /^[-*+]\s+/.test(lines[idx].trim())) {
        const content = lines[idx].trim().replace(/^[-*+]\s+/, '');
        const checklistMatch = content.match(/^\[(x|X| )\]\s+(.+)$/);
        if (checklistMatch) {
          items.push({
            checked: checklistMatch[1].toLowerCase() === 'x',
            children: parseMarkdownInlines(checklistMatch[2].trim()),
          });
        } else {
          items.push({
            children: parseMarkdownInlines(content.trim()),
          });
        }
        idx++;
      }
      blocks.push({ type: 'unordered-list', items });
      continue;
    }

    // Ordered list (1. item, 2) item)
    if (/^\d+[.)]\s+/.test(trimmed)) {
      const items: MarkdownListItem[] = [];
      while (idx < lines.length && /^\d+[.)]\s+/.test(lines[idx].trim())) {
        const content = lines[idx].trim().replace(/^\d+[.)]\s+/, '');
        items.push({
          children: parseMarkdownInlines(content.trim()),
        });
        idx++;
      }
      blocks.push({ type: 'ordered-list', items });
      continue;
    }

    // Paragraph (group consecutive plain lines)
    const paraLines: string[] = [];
    while (idx < lines.length && !isSpecialLine(lines[idx])) {
      paraLines.push(lines[idx].trim());
      idx++;
    }
    if (paraLines.length > 0) {
      blocks.push({
        type: 'paragraph',
        children: parseMarkdownInlines(paraLines.join(' ')),
      });
    }
  }

  return blocks;
}

/**
 * Strips common Markdown syntax to produce a clean plain-text preview string.
 */
export function stripMarkdownToPlainText(rawMarkdown: string): string {
  if (typeof rawMarkdown !== 'string' || !rawMarkdown.trim()) return '';
  return rawMarkdown
    .replace(/\r\n?/g, '\n')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*#{1,3}\s+/gm, '')
    .replace(/^\s*[-*+]\s+\[(?:x|X| )\]\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/(\*\*|__|~~|`)/g, '')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
