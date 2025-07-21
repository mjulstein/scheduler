// WeekNavigation.tsx - Component for week navigation controls
import { type FC } from 'react';
import { getWeekNumber } from '../dateUtils';

interface WeekNavigationProps {
  weekOffset: number;
  setWeekOffset: (offset: number | ((prev: number) => number)) => void;
  showWeekends: boolean;
  setShowWeekends: (show: boolean | ((prev: boolean) => boolean)) => void;
  firstDayDate: string;
}

/**
 * Component for navigating between weeks and toggling weekend visibility
 */
export const WeekNavigation: FC<WeekNavigationProps> = ({
  setWeekOffset,
  showWeekends,
  setShowWeekends,
  firstDayDate
}) => {
  // Navigate to previous week
  const goToPreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  // Toggle weekend visibility
  const toggleWeekends = () => {
    setShowWeekends(prev => !prev);
  };

  return (
    <div className="week-navigation">
      <button onClick={goToPreviousWeek} className="nav-button">
        &larr; Previous Week
      </button>
      <span className="week-number">
        Week {firstDayDate ? getWeekNumber(new Date(firstDayDate)) : ''}
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