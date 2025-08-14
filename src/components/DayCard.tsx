// DayCard.tsx - Component for displaying a day's information and todo items
import type { FC, KeyboardEvent, ChangeEvent } from 'react';
import type { DayData } from '../Types';
import clsx from 'clsx';
import styles from './DayCard.module.css';
import { useEffect, useRef, useState } from 'react';

interface DayCardProps {
  day: DayData;
  newItemText: string;
  onInputChange: (dayDate: string, value: string) => void;
  onAddItem: (dayDate: string) => void;
  onSaveItem?: (dayDate: string, itemId: string, value: string) => void;
}

/**
 * Component for displaying a day card with todo items and input for adding new items
 */
export const DayCard: FC<DayCardProps> = ({
  day,
  newItemText,
  onInputChange,
  onAddItem,
  onSaveItem
}) => {
  // Handle input change for the "add new item" input
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange(day.date, e.target.value);
  };

  // Handle key down event (Enter key) for the "add new item" input
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onAddItem(day.date);
    }
  };

  // Inline editing state for existing items
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [desiredCaretIndex, setDesiredCaretIndex] = useState<number | null>(null);
  const editInputRef = useRef<HTMLInputElement | null>(null);

  // Focus the edit input and place caret when entering edit mode
  useEffect(() => {
    if (editingId && editInputRef.current) {
      const input = editInputRef.current;
      input.focus();
      const len = input.value.length;
      const idx = desiredCaretIndex != null ? Math.max(0, Math.min(desiredCaretIndex, len)) : len;
      try {
        input.setSelectionRange(idx, idx);
      } catch {
        // ignore if not supported in test env
      }
    }
  }, [editingId, desiredCaretIndex]);

  const startEdit = (itemId: string, text: string, caretIndex: number | null) => {
    setEditingId(itemId);
    setEditingText(text);
    setDesiredCaretIndex(caretIndex);
  };

  const stopEditAndSave = () => {
    if (editingId != null && onSaveItem) {
      onSaveItem(day.date, editingId, editingText);
    }
    setEditingId(null);
    setDesiredCaretIndex(null);
  };

  return (
    <div
      key={day.date}
      className={clsx(styles.dayCard, day.isToday && styles.today)}
    >
      <h3>{day.dayName}</h3>
      <ul>
        {day.items.length > 0 ? (
          day.items.map((item) => (
            <li key={item.id}>
              {editingId === item.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onBlur={stopEditAndSave}
                  aria-label={`Edit ${item.text}`}
                  className={styles.inlineInput}
                />
              ) : (
                // Non-editing display; click to enter edit mode
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    // If a child character span was clicked, it carries data-index
                    const target = e.target as HTMLElement;
                    const idxAttr = target.getAttribute('data-index');
                    const idx = idxAttr != null ? parseInt(idxAttr, 10) : item.text.length;
                    startEdit(item.id, item.text, isNaN(idx) ? item.text.length : idx);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      startEdit(item.id, item.text, item.text.length);
                    }
                  }}
                  style={{ cursor: 'text' }}
                >
                  {Array.from(item.text).map((ch, i) => (
                    <span key={i} data-index={i}>
                      {ch}
                    </span>
                  ))}
                </span>
              )}
            </li>
          ))
        ) : (
          <li className={styles.emptyItem}>
            <input
              type="text"
              value={newItemText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Add new item"
              className={styles.inlineInput}
            />
          </li>
        )}
        {day.items.length > 0 && (
          <li className={styles.emptyItem}>
            <input
              type="text"
              value={newItemText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Add new item"
              className={styles.inlineInput}
            />
          </li>
        )}
      </ul>
    </div>
  );
};
