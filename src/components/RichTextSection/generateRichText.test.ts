import { describe, it, expect } from 'vitest';
import { generateRichText } from './generateRichText';
import type { DayData, DayItem } from '../DayList';

function makeWeek(weekStartISO: string, showWeekends: boolean) {
  // weekStartISO is Monday
  const monday = new Date(weekStartISO + 'T00:00:00');
  const addDays = (d: number) => {
    const dt = new Date(monday);
    dt.setDate(monday.getDate() + d);
    return dt.toISOString().slice(0, 10);
  };
  const all: DayData[] = Array.from({ length: 7 }, (_, i) => {
    const iso = addDays(i);
    return {
      date: iso,
      dayName: iso,
      items: [],
      isToday: false
    };
  });
  const filtered = showWeekends
    ? all
    : all.filter((d) => {
        const day = new Date(d.date + 'T00:00:00').getDay();
        return day !== 0 && day !== 6; // exclude Sun(0) and Sat(6)
      });
  // App reverses for display so Monday is at the bottom
  return filtered.reverse();
}

describe('generateRichText ordering', () => {
  it('keeps order identical to provided weekDays (weekends on)', () => {
    const weekDays = makeWeek('2025-08-11', true); // Monday 2025-08-11
    const itemsRef = { current: {} as Record<string, DayItem[]> };
    // Put a marker item on each date so the day appears
    for (const d of weekDays)
      itemsRef.current[d.date] = [{ id: '1', text: d.date }];

    const html = generateRichText({
      weekDays,
      itemsRef,
      dateFormat: 'cccc',
      headingLevel: 'h3',
      showWeekends: true
    });

    // Expect first heading to be the first element in weekDays (top of list)
    const firstDate = weekDays[0].date; // should be Sunday when weekends on
    const lastDate = weekDays[weekDays.length - 1].date; // Monday at bottom
    expect(html.indexOf(firstDate)).toBeLessThan(html.indexOf(lastDate));
  });

  it('includes Friday when weekends are off and orders Friday..Monday', () => {
    const weekDays = makeWeek('2025-08-11', false); // Mon-Fri, reversed -> Fri..Mon
    const itemsRef = { current: {} as Record<string, DayItem[]> };
    for (const d of weekDays)
      itemsRef.current[d.date] = [{ id: '1', text: d.date }];

    const html = generateRichText({
      weekDays,
      itemsRef,
      dateFormat: 'yyyy-MM-dd',
      headingLevel: 'h3',
      showWeekends: false
    });

    expect(html).toContain(weekDays[0].date); // Friday present
    expect(html).toContain(weekDays[weekDays.length - 1].date); // Monday present

    // Ensure first appears before last in the HTML
    expect(html.indexOf(weekDays[0].date)).toBeLessThan(
      html.indexOf(weekDays[weekDays.length - 1].date)
    );
  });
});
