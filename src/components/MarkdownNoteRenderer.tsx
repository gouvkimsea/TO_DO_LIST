import React from 'react';
import { Check, ExternalLink } from 'lucide-react';
import {
  MarkdownBlockNode,
  MarkdownInlineNode,
  parseMarkdownBlocks,
} from '../utils/markdownParser';

interface MarkdownNoteRendererProps {
  content: string;
  compact?: boolean;
  className?: string;
  testId?: string;
}

function renderInlineNodes(
  nodes: MarkdownInlineNode[],
  keyPrefix: string
): React.ReactNode[] {
  return nodes.map((node, idx) => {
    const key = `${keyPrefix}-${idx}`;
    switch (node.type) {
      case 'text':
        return <React.Fragment key={key}>{node.value}</React.Fragment>;
      case 'bold':
        return (
          <strong key={key} className="font-bold text-[#2F2B28]">
            {renderInlineNodes(node.children, `${key}-b`)}
          </strong>
        );
      case 'italic':
        return (
          <em key={key} className="italic text-[#4A433C]">
            {renderInlineNodes(node.children, `${key}-i`)}
          </em>
        );
      case 'strike':
        return (
          <del key={key} className="line-through text-[#9A9086]">
            {renderInlineNodes(node.children, `${key}-s`)}
          </del>
        );
      case 'code':
        return (
          <code
            key={key}
            className="px-1.5 py-0.5 rounded bg-[#EFE9DF] text-[#7D3F21] font-mono text-[0.92em] break-all"
          >
            {node.value}
          </code>
        );
      case 'link':
        return (
          <a
            key={key}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-0.5 font-semibold text-[#B05C37] hover:text-[#8E4525] underline decoration-[#D8A58C] underline-offset-2 transition-colors break-words"
          >
            <span>{node.label}</span>
            <ExternalLink
              aria-hidden="true"
              className="w-2.5 h-2.5 shrink-0 inline-block opacity-80"
            />
          </a>
        );
    }
  });
}

function renderBlock(
  block: MarkdownBlockNode,
  idx: number,
  compact: boolean
): React.ReactNode {
  const key = `md-block-${idx}`;
  switch (block.type) {
    case 'heading': {
      const headingClass =
        block.level === 1
          ? compact
            ? 'text-xs font-extrabold text-[#2F2B28]'
            : 'text-[13px] font-extrabold text-[#2F2B28]'
          : block.level === 2
          ? 'text-xs font-bold text-[#2F2B28]'
          : 'text-[11.5px] font-bold text-[#4A433C]';
      if (block.level === 1) {
        return (
          <h4 key={key} className={headingClass}>
            {renderInlineNodes(block.children, key)}
          </h4>
        );
      }
      if (block.level === 2) {
        return (
          <h5 key={key} className={headingClass}>
            {renderInlineNodes(block.children, key)}
          </h5>
        );
      }
      return (
        <h6 key={key} className={headingClass}>
          {renderInlineNodes(block.children, key)}
        </h6>
      );
    }

    case 'paragraph':
      return (
        <p key={key} className="leading-relaxed break-words">
          {renderInlineNodes(block.children, key)}
        </p>
      );

    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="border-l-2 border-[#D4A68B] pl-2.5 py-0.5 text-[#665E56] italic bg-[#FAF6F0]/70 rounded-r"
        >
          {renderInlineNodes(block.children, key)}
        </blockquote>
      );

    case 'unordered-list': {
      const hasChecklist = block.items.some(
        (item) => typeof item.checked === 'boolean'
      );
      return (
        <ul
          key={key}
          className={
            hasChecklist
              ? 'space-y-1 pl-0.5 list-none'
              : 'list-disc pl-4 space-y-0.5 marker:text-[#C26D43]'
          }
        >
          {block.items.map((item, itemIdx) => {
            const itemKey = `${key}-ul-${itemIdx}`;
            if (typeof item.checked === 'boolean') {
              return (
                <li
                  key={itemKey}
                  className="flex items-start gap-1.5 leading-snug"
                >
                  <span
                    aria-hidden="true"
                    className={`mt-0.5 w-3.5 h-3.5 rounded-[3px] flex items-center justify-center shrink-0 border ${
                      item.checked
                        ? 'bg-[#C26D43] border-[#C26D43] text-white'
                        : 'bg-white border-[#CFC6BA]'
                    }`}
                  >
                    {item.checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </span>
                  <span
                    className={`min-w-0 break-words ${
                      item.checked ? 'line-through text-[#9A9086]' : ''
                    }`}
                  >
                    {renderInlineNodes(item.children, itemKey)}
                  </span>
                </li>
              );
            }
            if (hasChecklist) {
              return (
                <li
                  key={itemKey}
                  className="flex items-start gap-1.5 leading-snug"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 w-3.5 flex items-center justify-center shrink-0"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C26D43]" />
                  </span>
                  <span className="min-w-0 break-words">
                    {renderInlineNodes(item.children, itemKey)}
                  </span>
                </li>
              );
            }
            return (
              <li key={itemKey} className="leading-snug break-words">
                {renderInlineNodes(item.children, itemKey)}
              </li>
            );
          })}
        </ul>
      );
    }

    case 'ordered-list':
      return (
        <ol
          key={key}
          className="list-decimal pl-4 space-y-0.5 marker:text-[#8A7E72] marker:font-bold"
        >
          {block.items.map((item, itemIdx) => {
            const itemKey = `${key}-ol-${itemIdx}`;
            return (
              <li key={itemKey} className="leading-snug break-words">
                {renderInlineNodes(item.children, itemKey)}
              </li>
            );
          })}
        </ol>
      );
  }
}

export const MarkdownNoteRenderer: React.FC<MarkdownNoteRendererProps> = ({
  content,
  compact = false,
  className = '',
  testId,
}) => {
  const blocks = parseMarkdownBlocks(content);
  if (blocks.length === 0) return null;

  return (
    <div
      data-testid={testId}
      className={`text-[#4A433C] ${
        compact ? 'text-[11px] space-y-1' : 'text-xs space-y-1.5'
      } ${className}`}
    >
      {blocks.map((block, idx) => renderBlock(block, idx, compact))}
    </div>
  );
};
