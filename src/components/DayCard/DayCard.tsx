// DayCard.tsx - Component for displaying a day's information and todo items
import type { FC, KeyboardEvent, ChangeEvent } from 'react';
import type { DayData, DayItem } from '../../Types.ts';
import clsx from 'clsx';
import classes from './DayCard.module.css';
import { useState } from 'react';
import { DayItem as DayItemComponent } from './DayItem';

interface DayCardProps {
  day: DayData;
  newItemText: string;
  onInputChange: (dayDate: string, value: string) => void;
  onAddItem: (dayDate: string) => void;
  onSaveItem?: (dayDate: string, itemId: string, value: string) => void;
  onDeleteItem?: (dayDate: string, itemId: string) => void;
  // Called when items are reordered via drag-and-drop
  onReorderItems?: (dayDate: string, newItems: DayItem[]) => void;
}

/**
 * Component for displaying a day card with todo items and input for adding new items
 */
export const DayCard: FC<DayCardProps> = ({
  day,
  newItemText,
  onInputChange,
  onAddItem,
  onSaveItem,
  onDeleteItem,
  onReorderItems
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

  // Drag-and-drop state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    setDraggingId(itemId);
    try {
      e.dataTransfer.setData('text/plain', itemId);
    } catch {
      // ignore for environments lacking full DataTransfer impl
    }
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTargetIndex(null);
  };

  const handleDropOnIndex = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const items = day.items;
    let sourceId: string | null = draggingId;
    try {
      const fromDt = e.dataTransfer.getData('text/plain');
      if (fromDt) sourceId = fromDt;
    } catch {
      // ignore
    }
    if (!sourceId) return;

    const sourceIndex = items.findIndex((it) => it.id === sourceId);
    if (sourceIndex === -1) return;

    // Make a working copy and remove the source item first
    const newItems = items.slice();
    const [moved] = newItems.splice(sourceIndex, 1);

    // Compute destination index in the array AFTER removal
    let destIndex: number;
    if (targetIndex >= items.length) {
      // Dropping after the last item appends to the end
      destIndex = newItems.length;
    } else {
      // Dropping before targetIndex; adjust if source was before target
      destIndex = targetIndex - (sourceIndex < targetIndex ? 1 : 0);
    }

    // Clamp and no-op check
    if (destIndex < 0) destIndex = 0;
    if (destIndex > newItems.length) destIndex = newItems.length;

    newItems.splice(destIndex, 0, moved);

    onReorderItems?.(day.date, newItems);
    setDraggingId(null);
    setDropTargetIndex(null);
  };

  return (
    <div
      key={day.date}
      className={clsx(classes.dayCard, day.isToday && classes.today)}
    >
      <h3>{day.dayName}</h3>
      <ul>
        {day.items.length > 0 ? (
          day.items.map((item, index) => (
            <li
              key={item.id}
              className={classes.itemRow}
              onDragEnter={(e) => {
                e.preventDefault();
                setDropTargetIndex(index);
              }}
              onDragOver={(e) => {
                // Allow dropping on items
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                setDropTargetIndex(index);
              }}
              onDrop={(e) => handleDropOnIndex(e, index)}
            >
              {dropTargetIndex === index && (
                <div aria-hidden className={classes.dropIndicator} />
              )}

              <DayItemComponent
                id={item.id}
                text={item.text}
                onSave={
                  onSaveItem
                    ? (id, value) => onSaveItem(day.date, id, value)
                    : undefined
                }
                onDelete={
                  onDeleteItem ? (id) => onDeleteItem(day.date, id) : undefined
                }
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                isDragging={draggingId === item.id}
              />
            </li>
          ))
        ) : (
          <li className={classes.emptyItem}>
            <input
              type="text"
              value={newItemText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Add new item"
              className={classes.inlineInput}
            />
          </li>
        )}
        {day.items.length > 0 && (
          <li
            className={classes.emptyItem}
            onDragEnter={(e) => {
              e.preventDefault();
              setDropTargetIndex(day.items.length);
            }}
            onDragOver={(e) => {
              // Allow dropping after the last item
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              setDropTargetIndex(day.items.length);
            }}
            onDrop={(e) => handleDropOnIndex(e, day.items.length)}
          >
            {dropTargetIndex === day.items.length && (
              <div
                aria-hidden
                className={classes.dropIndicator}
                style={{ width: '100%', height: '1rem' }}
              />
            )}
            <input
              type="text"
              value={newItemText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Add new item"
              className={classes.inlineInput}
            />
          </li>
        )}
      </ul>
    </div>
  );
};
