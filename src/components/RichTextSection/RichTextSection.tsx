// RichTextSection.tsx - Component for displaying and copying rich text
import React, { type FC, useCallback, useState, useMemo } from 'react';
import { generateRichText } from '../../generateRichText.ts';
import type { DayData, DayItem } from '../DayList/Types.ts';
import classes from './RichTextSection.module.css';

interface RichTextSectionProps {
  weekDays: DayData[];
  itemsRef: React.MutableRefObject<{ [date: string]: DayItem[] }>;
  dateFormat: string;
  showWeekends: boolean;
  headingLevel: string;
  setHeadingLevel: (level: string) => void;
}

/**
 * Component for displaying rich text and providing copy functionality
 */
export const RichTextSection: FC<RichTextSectionProps> = ({
  weekDays,
  itemsRef,
  dateFormat,
  showWeekends,
  headingLevel,
  setHeadingLevel
}) => {
  const [copyStatus, setCopyStatus] = useState<string>('');

  // Generate rich text when dependencies change using the selected heading level
  const richTextContent = useMemo(() => {
    return generateRichText({
      weekDays,
      itemsRef,
      dateFormat,
      headingLevel,
      showWeekends
    });
  }, [weekDays, itemsRef, dateFormat, showWeekends, headingLevel]);

  const clearStatusSoon = useCallback(() => {
    window.setTimeout(() => setCopyStatus(''), 3000);
  }, []);

  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Function to copy rich text (HTML) to clipboard based on generator output
  const copyRichText = useCallback(async () => {
    const html = richTextContent;
    try {
      const ClipboardItemCtor = (
        window as Window & {
          ClipboardItem?: typeof ClipboardItem;
        }
      ).ClipboardItem;
      const canWriteHtml =
        !!navigator.clipboard &&
        typeof navigator.clipboard.write === 'function' &&
        !!ClipboardItemCtor;

      if (canWriteHtml && ClipboardItemCtor) {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const blobText = new Blob([stripHtml(html)], { type: 'text/plain' });
        const item = new ClipboardItemCtor({
          'text/html': blobHtml,
          'text/plain': blobText
        });
        await navigator.clipboard.write([item]);
        setCopyStatus('Rich text copied to clipboard!');
        clearStatusSoon();
        return;
      }
    } catch {
      // fall through to fallback
    }

    // Fallback: select HTML in a hidden, editable container and execCommand('copy')
    try {
      const temp = document.createElement('div');
      temp.setAttribute('contenteditable', 'true');
      temp.style.position = 'fixed';
      temp.style.left = '-9999px';
      temp.style.top = '0';
      temp.style.whiteSpace = 'pre-wrap';
      temp.innerHTML = html;
      document.body.appendChild(temp);

      const range = document.createRange();
      range.selectNodeContents(temp);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      const succeeded = document.execCommand('copy');

      selection?.removeAllRanges();
      document.body.removeChild(temp);

      if (succeeded) {
        setCopyStatus('Rich text copied to clipboard!');
      } else {
        // As a last resort, try copying plain text
        await navigator.clipboard?.writeText?.(stripHtml(html));
        setCopyStatus('Copied as plain text.');
      }
      clearStatusSoon();
    } catch {
      try {
        await navigator.clipboard?.writeText?.(stripHtml(html));
        setCopyStatus('Copied as plain text.');
      } catch {
        setCopyStatus('Error: Could not copy');
      }
      clearStatusSoon();
    }
  }, [richTextContent, clearStatusSoon]);

  return (
    <details>
      <summary>
        <h2 style={{ margin: 0 }}>Rich Text Preview</h2>
        <div className={classes.tools}>
          <label htmlFor="heading-size-select" style={{ fontWeight: 500 }}>
            Heading size for generated content:
          </label>
          <select
            id="heading-size-select"
            value={headingLevel}
            onChange={(e) => setHeadingLevel(e.target.value)}
            style={{ height: '2rem' }}
            aria-label="Select heading size for generated content"
          >
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
            <option value="h4">H4</option>
            <option value="h5">H5</option>
            <option value="h6">H6</option>
            <option value="p">Normal</option>
          </select>
          <button
            disabled={!!copyStatus}
            onClick={copyRichText}
            className={classes.copyButton}
          >
            Copy to Clipboard
            {copyStatus ? (
              <div className={classes.status}> {copyStatus} </div>
            ) : (
              ''
            )}
          </button>
        </div>
      </summary>
      <div
        className="rich-text-content"
        dangerouslySetInnerHTML={{ __html: richTextContent }}
      />
    </details>
  );
};
