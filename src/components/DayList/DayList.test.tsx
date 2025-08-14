/* eslint-disable prettier/prettier */
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { DayData } from './Types.ts';
import { DayList } from './DayList';
import { useState } from 'react';

// Helper wrapper to manage local state for DayList in tests
function DayListTestHarness({ initialDays }: { initialDays: DayData[] }) {
  const [days, setDays] = useState<DayData[]>(initialDays);
  const [newItemTextByDate, setNewItemTextByDate] = useState<Record<string, string>>({});

  return (
    <DayList
      days={days}
      newItemTextByDate={newItemTextByDate}
      onInputChange={(dayDate, value) =>
        setNewItemTextByDate((prev) => ({ ...prev, [dayDate]: value }))
      }
      onAddItem={(dayDate) => {
        setDays((prev) =>
          prev.map((d) =>
            d.date === dayDate
              ? {
                  ...d,
                  items: [
                    ...d.items,
                    {
                      id: `${dayDate}-item-${d.items.length + 1}`,
                      text: (newItemTextByDate[dayDate] || '').trim()
                    }
                  ]
                }
              : d
          )
        );
        setNewItemTextByDate((prev) => ({ ...prev, [dayDate]: '' }));
      }}
    />
  );
}

// Focus behavior belongs to DayList/DayCard area; keep the integration test here.
describe('DayList', () => {
  it("keeps focus on the same day's add input (Wednesday) after pressing Enter", async () => {
    const user = userEvent.setup();

    // Minimal week including the Wednesday in question; headings show yyyy-MM-dd
    const initialDays: DayData[] = [
      { date: '2024-12-30', dayName: '2024-12-30', items: [], isToday: false }, // Mon
      { date: '2024-12-31', dayName: '2024-12-31', items: [], isToday: false }, // Tue
      { date: '2025-01-01', dayName: '2025-01-01', items: [], isToday: false }, // Wed
      { date: '2025-01-02', dayName: '2025-01-02', items: [], isToday: false }, // Thu
      { date: '2025-01-03', dayName: '2025-01-03', items: [], isToday: false } // Fri (heading value not used)
    ];

    render(<DayListTestHarness initialDays={initialDays} />);

    // Find the Wednesday card by its date heading (default format yyyy-MM-dd)
    const wednesdayHeading = await screen.findByRole('heading', {
      name: '2025-01-01'
    });
    // DayCard root is an <article>
    const wednesdayCard = wednesdayHeading.closest('article');
    expect(wednesdayCard).toBeTruthy();

    // Type into the Wednesday add input and press Enter
    const addInput = within(wednesdayCard!).getByPlaceholderText(
      'Add new item'
    ) as HTMLInputElement;
    await user.type(addInput, 'Test item on Wednesday{enter}');

    // After adding, there should be a new item plus another add input in the same card
    const updatedAddInput = within(wednesdayCard!).getByPlaceholderText(
      'Add new item'
    ) as HTMLInputElement;

    // Assert that the focus remains on the Wednesday card's add input
    expect(document.activeElement).toBe(updatedAddInput);
  });
});
