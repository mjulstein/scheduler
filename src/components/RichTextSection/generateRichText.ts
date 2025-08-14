import type { DayData, DayItem } from '../DayList';

export function generateRichText({
  weekDays,
  itemsRef,
  headingLevel
}: {
  weekDays: DayData[];
  itemsRef: React.MutableRefObject<Record<string, DayItem[]>>;
  dateFormat: string;
  headingLevel: string;
  showWeekends: boolean;
}): string {
  const headingTag = headingLevel || 'h3';
  const dayContents: string[] = [];
  for (const day of weekDays) {
    // Trust the provided order and day label from DayList
    const headingText = day.dayName;
    const items = itemsRef.current[day.date] || [];
    let dayContent = `<${headingTag}>${headingText}</${headingTag}>\n<ul>\n`;
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
