// RichTextSection.tsx - Component for displaying and copying rich text
import { type FC, useCallback, useState } from 'react';

interface RichTextSectionProps {
  richTextContent: string;
}

/**
 * Component for displaying rich text and providing copy functionality
 */
export const RichTextSection: FC<RichTextSectionProps> = ({
  richTextContent
}) => {
  const [copyStatus, setCopyStatus] = useState<string>('');

  // Function to copy rich text to clipboard
  const copyRichText = useCallback(() => {
    // Get the rendered content from the DOM
    const richTextElement = document.querySelector('.rich-text-content');
    if (!richTextElement) {
      setCopyStatus('Error: Could not find rich text content');
      return;
    }

    // Create a temporary element to properly extract the text with formatting
    const tempElement = document.createElement('div');
    tempElement.innerHTML = richTextElement.innerHTML;
    
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
    <div className="rich-text">
      <h2>Rich Text for Confluence</h2>
      <div className="rich-text-container">
        <div 
          className="rich-text-content"
          dangerouslySetInnerHTML={{ __html: richTextContent }}
        />
      </div>
      <div className="rich-text-actions">
        <button onClick={copyRichText} className="copy-button">
          Copy to Clipboard
        </button>
        {copyStatus && <p className="copy-status">{copyStatus}</p>}
      </div>
    </div>
  );
};