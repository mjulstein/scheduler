/* eslint-disable prettier/prettier */
// DayList.tsx - Container for rendering a list of DayCards
import type { FC } from 'react';
import type { DayData, DayItem } from '../../Types';
import { DayCard } from './DayCard';

interface DayListProps {
  days: DayData[];
  newItemTextByDate: { [key: string]: string };
  onInputChange: (dayDate: string, value: string) => void;
  onAddItem: (dayDate: string) => void;
  onSaveItem?: (dayDate: string, itemId: string, value: string) => void;
  onDeleteItem?: (dayDate: string, itemId: string) => void;
  onReorderItems?: (dayDate: string, newItems: DayItem[]) => void;
}

export const DayList: FC<DayListProps> = ({
  days,
  newItemTextByDate,
  onInputChange,
  onAddItem,
  onSaveItem,
  onDeleteItem,
  onReorderItems
}) => {
  return (
    <>
      {days.map((day) => (
        <DayCard
          key={day.date}
          day={day}
          newItemText={newItemTextByDate[day.date] || ''}
          onInputChange={onInputChange}
          onAddItem={onAddItem}
          onSaveItem={onSaveItem}
          onDeleteItem={onDeleteItem}
          onReorderItems={onReorderItems}
        />
      ))}
    </>
  );
};
