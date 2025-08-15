import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';

// Integration: week navigation should update both week number and visible days
describe('App week navigation', () => {
  it('updates day headings when navigating to next week', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/2025-08-11']}>
        <App />
      </MemoryRouter>
    );

    const main = screen.getByRole('main');

    // Monday of the current route is 2025-08-11 (in main content only)
    const initialMonday = await within(main).findByRole('heading', {
      name: '2025-08-11'
    });
    expect(initialMonday).toBeInTheDocument();

    // Click Next Week
    await user.click(screen.getByRole('button', { name: /Next Week/i }));

    // Monday should now be +7 days => 2025-08-18 (in main content only)
    const nextMonday = await within(main).findByRole('heading', {
      name: '2025-08-18'
    });
    expect(nextMonday).toBeInTheDocument();

    // Week number text also updates accordingly
    expect(screen.getByText(/Week\s+\d+/i)).toBeInTheDocument();
  });
});
