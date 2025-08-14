import type { FC, ChangeEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import classes from '../DayCard.module.css';
import { DayCardContextMenu } from './DayCardContextMenu';

interface DayItemProps {
  id: string;
  text: string;
  onSave?: (id: string, value: string) => void;
  onDelete?: (id: string) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

export const DayItem: FC<DayItemProps> = ({
  id,
  text,
  onSave,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging
}) => {
  // Inline editing state and caret placement
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState<string>('');
  const [desiredCaretIndex, setDesiredCaretIndex] = useState<number | null>(
    null
  );
  const editInputRef = useRef<HTMLInputElement | null>(null);

  // Context menu state
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      const input = editInputRef.current;
      input.focus();
      const len = input.value.length;
      const idx =
        desiredCaretIndex != null
          ? Math.max(0, Math.min(desiredCaretIndex, len))
          : len;
      try {
        input.setSelectionRange(idx, idx);
      } catch {
        // ignore in non-DOM envs (tests)
      }
    }
  }, [isEditing, desiredCaretIndex]);

  const startEdit = (caretIndex: number | null) => {
    setIsEditing(true);
    setEditingText(text);
    setDesiredCaretIndex(caretIndex);
  };

  const stopEditAndSave = () => {
    if (isEditing && onSave) {
      onSave(id, editingText);
    }
    setIsEditing(false);
    setDesiredCaretIndex(null);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEditingText(e.target.value);
  };

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      stopEditAndSave();
    }
  };

  return (
    <>
      {/* Drag handle on the left */}
      <button
        aria-label={`Reorder ${text}`}
        className={`${classes.dragHandle} ${isDragging ? classes.dragHandleDragging : ''}`.trim()}
        draggable={true}
        type="button"
        onDragStart={(e) => onDragStart?.(e, id)}
        onDragEnd={() => onDragEnd?.()}
      >
        ≡
      </button>

      {/* Main text/edit area takes remaining space */}
      <div className={classes.itemMain}>
        {isEditing ? (
          <input
            ref={editInputRef}
            type="text"
            value={editingText}
            onChange={handleInputChange}
            onBlur={stopEditAndSave}
            onKeyDown={handleInputKeyDown}
            aria-label={`Edit ${text}`}
            className={classes.inlineInput}
          />
        ) : (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              const idxAttr = target.getAttribute('data-index');
              const idx = idxAttr != null ? parseInt(idxAttr, 10) : text.length;
              startEdit(isNaN(idx) ? text.length : idx);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                startEdit(text.length);
              }
            }}
            style={{ cursor: 'text' }}
          >
            {Array.from(text).map((ch, i) => (
              <span key={i} data-index={i}>
                {ch}
              </span>
            ))}
          </span>
        )}
      </div>

      {/* Context menu popover */}
      {menuOpen && onDelete && (
        <div role="dialog" className={classes.menuPopover}>
          <DayCardContextMenu
            itemId={id}
            onDelete={() => onDelete(id)}
            onClose={() => setMenuOpen(false)}
          />
        </div>
      )}

      {/* Context menu button at the end (right) must remain last child for tests */}
      <button
        type="button"
        aria-label={`More options for ${text}`}
        className={classes.contextMenuButton}
        onClick={onDelete ? () => setMenuOpen((prev) => !prev) : undefined}
        onContextMenu={(e) => {
          e.preventDefault();
          if (onDelete) setMenuOpen(true);
        }}
        disabled={!onDelete}
        title={onDelete ? 'Open menu (right-click to open menu)' : undefined}
        aria-haspopup={onDelete ? 'menu' : undefined}
        aria-expanded={onDelete ? menuOpen : undefined}
      >
        ⋯
      </button>
    </>
  );
};
