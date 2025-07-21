// DayCard.tsx - Component for displaying a day's information and todo items
import type { FC, KeyboardEvent, ChangeEvent } from 'react';
import type { DayData } from '../Types';

interface DayCardProps {
  day: DayData;
  newItemText: string;
  onInputChange: (dayDate: string, value: string) => void;
  onAddItem: (dayDate: string) => void;
}

/**
 * Component for displaying a day card with todo items and input for adding new items
 */
export const DayCard: FC<DayCardProps> = ({
  day,
  newItemText,
  onInputChange,
  onAddItem
}) => {
  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onInputChange(day.date, e.target.value);
  };

  // Handle key down event (Enter key)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onAddItem(day.date);
    }
  };

  return (
    <div key={day.date} className={`day-card ${day.isToday ? 'today' : ''}`}>
      <h3>{day.date} {day.dayName}</h3>
      <ul className="items-list">
        {day.items.length > 0 ? (
          day.items.map(item => (
            <li key={item.id}>{item.text}</li>
          ))
        ) : (
          <li className="empty-item">
            <input
              type="text"
              value={newItemText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Add new item"
              className="inline-input"
            />
          </li>
        )}
        {day.items.length > 0 && (
          <li className="empty-item">
            <input
              type="text"
              value={newItemText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Add new item"
              className="inline-input"
            />
          </li>
        )}
      </ul>
    </div>
  );
};