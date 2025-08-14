// WeekNavigation.tsx - Component for week navigation controls
import { type FC } from 'react';
import { DateTime } from 'luxon';

interface WeekNavigationProps {
  weekStartISO: string;
  setWeekStartISO: (iso: string) => void;
  showWeekends: boolean;
  setShowWeekends: (value: boolean) => void;
}

/**
 * Component for navigating between weeks and toggling weekend visibility
 */
export const WeekNavigation: FC<WeekNavigationProps> = ({
  weekStartISO,
  setWeekStartISO,
  showWeekends,
  setShowWeekends
}) => {
  // Navigate to previous week
  const goToPreviousWeek = () => {
    const current = DateTime.fromISO(weekStartISO);
    setWeekStartISO(current.minus({ days: 7 }).toISODate()!);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    const current = DateTime.fromISO(weekStartISO);
    setWeekStartISO(current.plus({ days: 7 }).toISODate()!);
  };

  // Toggle weekend visibility
  const toggleWeekends = () => {
    setShowWeekends(!showWeekends);
  };

  const weekNumber = DateTime.fromISO(weekStartISO).weekNumber;

  return (
    <div className="week-navigation">
      <button onClick={goToPreviousWeek} className="nav-button">
        &larr; Previous Week
      </button>
      <span className="week-number">Week {weekNumber}</span>
      <button onClick={goToNextWeek} className="nav-button">
        Next Week &rarr;
      </button>
      <button onClick={toggleWeekends} className="toggle-button">
        {showWeekends ? 'Hide Weekends' : 'Show Weekends'}
      </button>
    </div>
  );
};
