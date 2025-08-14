// RichTextSection.tsx - Component for displaying and copying rich text
import React, { type FC, useCallback, useState, useMemo } from 'react';
import { generateRichText } from '../../generateRichText.ts';
import type { DayData, DayItem } from '../../Types.ts';
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

  // Generate and mutate rich text when dependencies change
  const richTextContent = useMemo(() => {
    // Generate with h3 as base
    let html = generateRichText({
      weekDays,
      itemsRef,
      dateFormat,
      headingLevel: 'h3',
      showWeekends
    });
    // Replace all <h3> and </h3> with selected headingLevel
    if (headingLevel !== 'h3') {
      html = html
        .replace(/<h3>/g, `<${headingLevel}>`)
        .replace(/<\/h3>/g, `</${headingLevel}>`);
    }
    return html;
  }, [weekDays, itemsRef, dateFormat, showWeekends, headingLevel]);

  // Function to copy rich text to clipboard
  const copyRichText = useCallback(() => {
    // Get the rendered content from the DOM
    const richTextElement = document.querySelector('.rich-text-content');
    if (!richTextElement) {
      setCopyStatus('Error: Could not find rich text content');
      return;
    }

    // Create a range and selection
    const range = document.createRange();
    range.selectNodeContents(richTextElement);

    const selection = window.getSelection();
    if (!selection) {
      setCopyStatus('Error: Could not create selection');
      return;
    }

    // Clear any existing selections
    selection.removeAllRanges();

    // Add the new range to the selection
    selection.addRange(range);

    // Execute the copy command
    document.execCommand('copy');

    // Clear the selection
    selection.removeAllRanges();

    setCopyStatus('Rich text copied to clipboard!');
    // Clear the status message after 3 seconds
    setTimeout(() => {
      setCopyStatus('');
    }, 3000);
  }, []);

  return (
    <details>
      <summary>
        <h2 style={{ margin: 0 }}>Rich Text for Confluence</h2>
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
