import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { App } from './App';

// This test ensures that when adding an item on a specific DayCard (e.g., Wednesday),
// the focus remains on that DayCard's add input instead of jumping to the first input (typically Friday).
describe.skip('App focus behavior when adding items', () => {
  it("keeps focus on the same day's add input (Wednesday) after pressing Enter", async () => {
    const user = userEvent.setup();

    // Use a Monday start for a known week: 2024-12-30 is a Monday.
    // With weekends hidden by default, rendered order is Fri -> Thu -> Wed -> Tue -> Mon.
    render(
      <MemoryRouter initialEntries={['/2024-12-30']}>
        <App />
      </MemoryRouter>
    );

    // Limit queries to the main content to avoid duplicate headings in the footer rich text
    const main = screen.getByRole('main');

    // Find the Wednesday card by its date heading (default format yyyy-MM-dd)
    const wednesdayHeading = await within(main).findByRole('heading', {
      name: '2025-01-01'
    });
    const wednesdayCard = wednesdayHeading.closest('div');
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
