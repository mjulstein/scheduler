// WeekNavigation.tsx - Component for week navigation controls
import { type FC } from 'react';
import { getMondayOfWeek } from '../dateUtils';
import { DateTime } from 'luxon';

interface WeekNavigationProps {
  weekOffset: number;
  setWeekOffset:  (prev: number) =>  void;
  showWeekends: boolean;
  setShowWeekends: (prev: boolean) => void;
  firstDayDate: string;
}

/**
 * Component for navigating between weeks and toggling weekend visibility
 */
export const WeekNavigation: FC<WeekNavigationProps> = ({
  weekOffset,
  setWeekOffset,
  showWeekends,
  setShowWeekends,
  firstDayDate
}) => {
  // Navigate to previous week
  const goToPreviousWeek = () => {
    setWeekOffset(weekOffset - 1);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setWeekOffset(weekOffset + 1);
  };

  // Toggle weekend visibility
  const toggleWeekends = () => {
    setShowWeekends(!showWeekends);
  };

  return (
    <div className="week-navigation">
      <button onClick={goToPreviousWeek} className="nav-button">
        &larr; Previous Week
      </button>
      <span className="week-number">
        Week {(() => {
          // Always use the actual Monday for the current week, regardless of visible days
          const today = new Date();
          const monday = getMondayOfWeek(today, weekOffset);
          return DateTime.fromJSDate(monday).weekNumber;
        })()}
      </span>
      <button onClick={goToNextWeek} className="nav-button">
        Next Week &rarr;
      </button>
      <button
        onClick={toggleWeekends}
        className="toggle-button"
      >
        {showWeekends ? 'Hide Weekends' : 'Show Weekends'}
      </button>
    </div>
  );
};