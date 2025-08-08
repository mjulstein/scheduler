import { DateTime } from 'luxon';
import type { DayData, DayItem } from './Types';

export function generateRichText({
  weekDays,
  itemsRef,
  dateFormat,
  headingLevel,
  showWeekends
}: {
  weekDays: DayData[];
  itemsRef: React.MutableRefObject<{ [date: string]: DayItem[] }>;
  dateFormat: string;
  headingLevel: string;
  showWeekends: boolean;
}): string {
  const headingTag = headingLevel || 'h3';
  const dayContents: string[] = [];
  for (const day of weekDays) {
    const date = DateTime.fromISO(day.date);
    const dayOfWeek = date.weekday % 7; // 0 is Sunday, 6 is Saturday
    if (!showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) continue;
    const items = itemsRef.current[day.date] || [];
    let dayContent = `<${headingTag}>${date.toFormat(dateFormat)}</${headingTag}>\n<ul>\n`;
    if (items.length === 0) {
      dayContent += '  <li></li>\n';
    } else {
      for (const item of items) {
        dayContent += `  <li>${item.text}</li>\n`;
      }
    }
    dayContent += '</ul>\n\n';
    dayContents.push(dayContent);
  }
  return dayContents.join('');
}
