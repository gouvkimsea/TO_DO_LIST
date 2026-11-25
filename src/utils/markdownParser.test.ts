import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseMarkdownBlocks,
  parseMarkdownInlines,
  sanitizeMarkdownUrl,
  stripMarkdownToPlainText,
} from './markdownParser';

test('sanitizeMarkdownUrl allows only http, https, and mailto URLs and blocks unsafe schemes', () => {
  assert.equal(
    sanitizeMarkdownUrl('https://example.com/docs?q=1'),
    'https://example.com/docs?q=1'
  );
  assert.equal(sanitizeMarkdownUrl('http://localhost:3000/page'), 'http://localhost:3000/page');
  assert.equal(sanitizeMarkdownUrl('mailto:team@example.com'), 'mailto:team@example.com');

  // Unsafe schemes must be rejected
  assert.equal(sanitizeMarkdownUrl('javascript:alert(1)'), null);
  assert.equal(sanitizeMarkdownUrl('  JaVaScRiPt:alert(1)  '), null);
  assert.equal(sanitizeMarkdownUrl('data:text/html,<script>alert(1)</script>'), null);
  assert.equal(sanitizeMarkdownUrl('vbscript:msgbox(1)'), null);
  assert.equal(sanitizeMarkdownUrl('file:///etc/passwd'), null);
  assert.equal(sanitizeMarkdownUrl('//evil.example/phish'), null);
  assert.equal(sanitizeMarkdownUrl('not-a-url'), null);
});

test('parseMarkdownInlines parses bold, italic, strikethrough, inline code, links, and bare autolinks', () => {
  const nodes = parseMarkdownInlines(
    'Review **Q3 OKRs** with *design*, ~~old deck~~, `npm test`, and [Figma Spec](https://figma.com/file/123) or https://docs.example.com.'
  );

  assert.equal(nodes.some((n) => n.type === 'bold'), true);
  assert.equal(nodes.some((n) => n.type === 'italic'), true);
  assert.equal(nodes.some((n) => n.type === 'strike'), true);
  assert.equal(nodes.some((n) => n.type === 'code' && n.value === 'npm test'), true);

  const links = nodes.filter((n) => n.type === 'link');
  assert.equal(links.length, 2);
  assert.deepEqual(links[0], {
    type: 'link',
    label: 'Figma Spec',
    href: 'https://figma.com/file/123',
  });
  assert.deepEqual(links[1], {
    type: 'link',
    label: 'https://docs.example.com',
    href: 'https://docs.example.com/',
  });
});

test('parseMarkdownInlines neutralizes dangerous link schemes without stray parentheses and keeps raw HTML as plain text', () => {
  const nodes = parseMarkdownInlines(
    'Click [safe](javascript:alert(1)) and <script>alert("xss")</script>'
  );
  // No link node should be produced for javascript: scheme
  assert.equal(nodes.some((n) => n.type === 'link'), false);
  const fullText = nodes
    .map((n) => (n.type === 'text' ? n.value : ''))
    .join('');
  assert.equal(fullText.includes('safe'), true);
  assert.equal(fullText.includes('safe)'), false);
  assert.equal(fullText.includes('<script>alert("xss")</script>'), true);

  // Valid URLs containing balanced parentheses should parse cleanly
  const wikiNodes = parseMarkdownInlines(
    'See [Markdown](https://en.wikipedia.org/wiki/Markdown_(markup))'
  );
  const wikiLinks = wikiNodes.filter((n) => n.type === 'link');
  assert.equal(wikiLinks.length, 1);
  assert.deepEqual(wikiLinks[0], {
    type: 'link',
    label: 'Markdown',
    href: 'https://en.wikipedia.org/wiki/Markdown_(markup)',
  });
});

test('parseMarkdownBlocks parses headings, unordered lists, checklists, ordered lists, blockquotes, and paragraphs', () => {
  const md = [
    '## Meeting Prep',
    'Bring **updated numbers** to review.',
    '- [x] Export revenue chart',
    '- [ ] Share [OKR Doc](https://example.com/okrs)',
    '1. Confirm milestones',
    '2. Assign owners',
    '> Keep scope tight for Q3',
  ].join('\n');

  const blocks = parseMarkdownBlocks(md);
  assert.equal(blocks.length, 5);
  assert.equal(blocks[0].type, 'heading');
  if (blocks[0].type === 'heading') {
    assert.equal(blocks[0].level, 2);
  }
  assert.equal(blocks[1].type, 'paragraph');
  assert.equal(blocks[2].type, 'unordered-list');
  if (blocks[2].type === 'unordered-list') {
    assert.equal(blocks[2].items.length, 2);
    assert.equal(blocks[2].items[0].checked, true);
    assert.equal(blocks[2].items[1].checked, false);
    assert.equal(
      blocks[2].items[1].children.some((c) => c.type === 'link'),
      true
    );
  }
  assert.equal(blocks[3].type, 'ordered-list');
  if (blocks[3].type === 'ordered-list') {
    assert.equal(blocks[3].items.length, 2);
  }
  assert.equal(blocks[4].type, 'blockquote');
});

test('stripMarkdownToPlainText removes markdown delimiters for clean previews', () => {
  const plain = stripMarkdownToPlainText(
    '## Agenda\n- **Finalize** [Roadmap](https://example.com)\n- `v2.1` release'
  );
  assert.equal(plain, 'Agenda Finalize Roadmap v2.1 release');
});
