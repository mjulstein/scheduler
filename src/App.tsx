// App.tsx - Main application component
import { useState, useEffect, useRef } from 'react';
import './App.css';
import type { DayData, DayItem } from './Types';
import { getStateFromUrl, updateUrlWithState } from './urlState';
import { formatISODate, getMondayOfWeek } from './dateUtils';
import { WeekNavigation } from './components/WeekNavigation';
import { DayCard } from './components/DayCard';
import { RichTextSection } from './components/RichTextSection';
import { useSearchParams } from 'react-router-dom';
import { DateTime } from 'luxon';

/**
 * Main application component
 */
export const App = () => {
  // Initialize state from URL or use defaults
  const urlState = getStateFromUrl();

  const [weekDays, setWeekDays] = useState<DayData[]>([]);
  const [newItems, setNewItems] = useState<{ [key: string]: string }>(urlState?.newItems || {});
  const [showWeekends, setShowWeekends] = useState<boolean>(urlState?.showWeekends || false);
  const itemsRef = useRef<{ [date: string]: DayItem[] }>(urlState?.items || {});

  // Date format and week offset state in search params
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDateFormat = searchParams.get('dateFormat') || 'yyyy-MM-dd';
  const [dateFormat, setDateFormatState] = useState<string>(initialDateFormat);

  // Always read weekOffset from searchParams for rendering
  const getWeekOffset = () => {
    const param = searchParams.get('weekOffset');
    return !isNaN(Number(param)) ? Number(param) : 0;
  };

  // Helper to update dateFormat and search param together
  const setDateFormat = (value: string) => {
    setDateFormatState(value);
    setSearchParams(params => {
      params.set('dateFormat', value);
      params.set('weekOffset', String(getWeekOffset()));
      return params;
    });
  };

  // Helper to update weekOffset and search param together
  const setWeekOffsetAndUrl = (value: number) => {
    setSearchParams(params => {
      params.set('weekOffset', String(value));
      params.set('dateFormat', dateFormat);
      return params;
    });
    updateUrlWithState({
      weekOffset: value,
      showWeekends,
      items: itemsRef.current,
      newItems
    });
  };

  // Helper to update state and URL for showWeekends
  const setShowWeekendsAndUrl = (value: boolean) => {
    setShowWeekends(value);
    updateUrlWithState({
      weekOffset: getWeekOffset(),
      showWeekends: value,
      items: itemsRef.current,
      newItems
    });
  };

  // Heading level state from URL
  const initialHeadingLevel = searchParams.get('headingLevel') || 'h3';
  const [headingLevel, setHeadingLevel] = useState<string>(initialHeadingLevel);

  // Helper to update headingLevel and search param together
  const setHeadingLevelAndUrl = (value: string) => {
    setHeadingLevel(value);
    setSearchParams(params => {
      params.set('headingLevel', value);
      params.set('dateFormat', dateFormat);
      params.set('weekOffset', String(getWeekOffset()));
      return params;
    });
  };

  // Helper to get formatted day name for UI
  const getFormattedDayName = (date: Date) => {
    const luxonDate = DateTime.fromJSDate(date);
    return luxonDate.toFormat(dateFormat);
  };

  // Generate days based on weekOffset and showWeekends
  useEffect(() => {
    const weekOffset = getWeekOffset();
    // Generate the week's days based on weekOffset
    const today = new Date();
    const todayISODate = formatISODate(today);
    const monday = getMondayOfWeek(today, weekOffset);

    const days: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const isoDate = formatISODate(date);
      const dayName = getFormattedDayName(date);
      const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday

      // Skip weekends if showWeekends is false
      if (!showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) {
        continue;
      }

      // Use items from ref if they exist
      const items = itemsRef.current[isoDate] || [];

      days.push({
        date: isoDate,
        dayName,
        items,
        isToday: isoDate === todayISODate
      });

      // Initialize newItems state if not already set
      setNewItems(prev => ({
        ...prev,
        [isoDate]: prev[isoDate] || ''
      }));
    }

    // Reverse the order of days
    setWeekDays(days.reverse());
  }, [searchParams, showWeekends, dateFormat]);

  const handleAddItem = (dayDate: string) => {
    if (newItems[dayDate].trim() === '') return;
    const newItem = { id: Date.now().toString(), text: newItems[dayDate] };
    const currentItems = itemsRef.current[dayDate] || [];
    itemsRef.current[dayDate] = [...currentItems, newItem];
    setWeekDays(prevDays =>
      prevDays.map(day => {
        if (day.date === dayDate) {
          return {
            ...day,
            items: itemsRef.current[dayDate]
          };
        }
        return day;
      })
    );
    setNewItems(prev => ({
      ...prev,
      [dayDate]: ''
    }));
    updateUrlWithState({
      weekOffset: getWeekOffset(),
      showWeekends,
      items: itemsRef.current,
      newItems: { ...newItems, [dayDate]: '' }
    });
    setTimeout(() => {
      const inputs = document.querySelectorAll(`input[value=""]`);
      if (inputs.length > 0) {
        (inputs[0] as HTMLInputElement).focus();
      }
    }, 0);
  };

  const handleInputChange = (dayDate: string, value: string) => {
    setNewItems(prev => {
      const updated = { ...prev, [dayDate]: value };
      updateUrlWithState({
        weekOffset: getWeekOffset(),
        showWeekends,
        items: itemsRef.current,
        newItems: updated
      });
      return updated;
    });
  };

  return (
    <div className="app-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <h1>Weekly Planner</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <select
            value={dateFormat}
            onChange={e => setDateFormat(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="yyyy-MM-dd">YYYY-MM-DD</option>
            <option value="MM/dd/yyyy">MM/DD/YYYY</option>
            <option value="dd MMM, yyyy">DD MMM, YYYY</option>
            <option value="cccc, d LLLL yyyy">Full (Monday, 7 August 2025)</option>
            <option value="d/M/yyyy">7/8/2025</option>
            <option value="EEE, MMM d">Wed, Aug 7</option>
            <option value="MMM d, yyyy">Aug 7, 2025</option>
            <option value="dd.MM.yyyy">07.08.2025</option>
            <option value="MMMM d, yyyy">August 7, 2025</option>
            <option value="__custom__">Custom...</option>
          </select>
          <input
            type="text"
            value={dateFormat}
            onChange={e => setDateFormat(e.target.value)}
            style={{ minWidth: 140 }}
            placeholder="Custom format"
          />
        </div>
      </div>
      <div className="content-container">
        <div className="days-list">
          <WeekNavigation
            weekOffset={getWeekOffset()}
            setWeekOffset={setWeekOffsetAndUrl}
            showWeekends={showWeekends}
            setShowWeekends={setShowWeekendsAndUrl}
            firstDayDate={weekDays.length > 0 ? weekDays[0].date : ''}
          />

          {weekDays.map(day => (
            <DayCard
              key={day.date}
              day={day}
              newItemText={newItems[day.date] || ''}
              onInputChange={handleInputChange}
              onAddItem={handleAddItem}
            />
          ))}
        </div>
        <div>
          <RichTextSection
            weekDays={weekDays}
            itemsRef={itemsRef}
            dateFormat={dateFormat}
            showWeekends={showWeekends}
            headingLevel={headingLevel}
            setHeadingLevel={setHeadingLevelAndUrl}
          />
        </div>
      </div>
    </div>
  );
};
