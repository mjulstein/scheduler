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
import { SettingsDialog } from './components/SettingsDialog';

/**
 * Main application component
 */
export const App = () => {
  // Initialize state from URL or use defaults
  const urlState = getStateFromUrl();

  const [weekDays, setWeekDays] = useState<DayData[]>([]);
  const [newItems, setNewItems] = useState<{ [key: string]: string }>(
    urlState?.newItems || {}
  );
  const [showWeekends, setShowWeekends] = useState<boolean>(
    urlState?.showWeekends || false
  );
  const itemsRef = useRef<{ [date: string]: DayItem[] }>(urlState?.items || {});

  // Date format and weekStart state in search params
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDateFormat = searchParams.get('dateFormat') || 'yyyy-MM-dd';
  const [dateFormat, setDateFormatState] = useState<string>(initialDateFormat);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const normalizeToIsoMonday = (iso: string): string => {
    const dt = DateTime.fromISO(iso);
    if (!dt.isValid) return iso;
    return dt.set({ weekday: 1, hour: 0, minute: 0, second: 0, millisecond: 0 }).toISODate()!;
  };

  // Helper: get normalized Monday ISO from search param or today
  const getWeekStartISO = (): string => {
    const param = searchParams.get('weekStart');
    if (param) {
      return normalizeToIsoMonday(param);
    }
    const today = new Date();
    const monday = getMondayOfWeek(today, 0);
    return formatISODate(monday);
  };

  // Helper: ensure weekStart is present in URL (first mutation)
  const ensureWeekStartInUrl = () => {
    if (!searchParams.get('weekStart')) {
      const iso = getWeekStartISO();
      setSearchParams((params) => {
        params.set('weekStart', normalizeToIsoMonday(iso));
        // preserve other params already present
        if (!params.get('dateFormat')) params.set('dateFormat', dateFormat);
        return params;
      });
    }
  };

  // Helper to update dateFormat and search param together
  const setDateFormat = (value: string) => {
    setDateFormatState(value);
    setSearchParams((params) => {
      params.set('dateFormat', value);
      // only set weekStart if it already exists; first-time set happens on mutation handlers
      const weekStart = params.get('weekStart');
      if (weekStart) params.set('weekStart', normalizeToIsoMonday(weekStart));
      return params;
    });
  };

  // Setters to update state and URL for showWeekends
  const setShowWeekendsAndUrl = (value: boolean) => {
    setShowWeekends(value);
    ensureWeekStartInUrl();
    updateUrlWithState({
      weekStart: getWeekStartISO(),
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
    setSearchParams((params) => {
      params.set('headingLevel', value);
      params.set('dateFormat', dateFormat);
      const weekStart = params.get('weekStart');
      if (weekStart) params.set('weekStart', normalizeToIsoMonday(weekStart));
      return params;
    });
  };

  // Helper to get formatted day name for UI
  const getFormattedDayName = (date: Date) => {
    const luxonDate = DateTime.fromJSDate(date);
    return luxonDate.toFormat(dateFormat);
  };

  // Generate days based on weekStart and showWeekends
  useEffect(() => {
    const weekStartISO = getWeekStartISO();

    const monday = DateTime.fromISO(weekStartISO);
    const today = new Date();
    const todayISODate = formatISODate(today);

    const days: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      const jsDate = monday.plus({ days: i }).toJSDate();
      const isoDate = formatISODate(jsDate);
      const dayName = getFormattedDayName(jsDate);
      const dayOfWeek = jsDate.getDay(); // 0 is Sunday, 6 is Saturday

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
      setNewItems((prev) => ({
        ...prev,
        [isoDate]: prev[isoDate] || ''
      }));
    }

    // Reverse the order of days
    setWeekDays(days.reverse());
  }, [searchParams, showWeekends, dateFormat]);

  // Set page title
  useEffect(() => {
    const weekStartParam = searchParams.get('weekStart');
    if (!weekStartParam) {
      document.title = 'Week Planner';
      return;
    }
    const dt = DateTime.fromISO(normalizeToIsoMonday(weekStartParam));
    if (!dt.isValid) {
      document.title = 'Week Planner';
      return;
    }
    const weekNumber = dt.weekNumber;
    const weekYear = dt.weekYear;
    document.title = `Week ${weekNumber} ${weekYear}`;
  }, [searchParams, showWeekends, dateFormat]);

  const setWeekStartISO = (iso: string) => {
    // Navigation is a mutation: always set weekStart param
    const normalized = normalizeToIsoMonday(iso);
    setSearchParams((params) => {
      params.set('weekStart', normalized);
      if (!params.get('dateFormat')) params.set('dateFormat', dateFormat);
      return params;
    });
    updateUrlWithState({
      weekStart: normalized,
      showWeekends,
      items: itemsRef.current,
      newItems
    });
  };

  const handleAddItem = (dayDate: string) => {
    if (newItems[dayDate].trim() === '') return;
    const newItem = { id: Date.now().toString(), text: newItems[dayDate] };
    const currentItems = itemsRef.current[dayDate] || [];
    itemsRef.current[dayDate] = [...currentItems, newItem];
    setWeekDays((prevDays) =>
      prevDays.map((day) => {
        if (day.date === dayDate) {
          return {
            ...day,
            items: itemsRef.current[dayDate]
          };
        }
        return day;
      })
    );
    setNewItems((prev) => ({
      ...prev,
      [dayDate]: ''
    }));
    ensureWeekStartInUrl();
    updateUrlWithState({
      weekStart: getWeekStartISO(),
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
    setNewItems((prev) => {
      const updated = { ...prev, [dayDate]: value };
      ensureWeekStartInUrl();
      updateUrlWithState({
        weekStart: getWeekStartISO(),
        showWeekends,
        items: itemsRef.current,
        newItems: updated
      });
      return updated;
    });
  };

  const handleReset = () => {
    // Clear in-memory state
    itemsRef.current = {};
    setNewItems({});
    setShowWeekends(false);
    setHeadingLevel('h3');
    setDateFormatState('yyyy-MM-dd');

    // Clear search params (removes weekStart, dateFormat, headingLevel, etc.)
    setSearchParams({});

    // Clear URL hash state
    const url = new URL(window.location.href);
    url.hash = '';
    window.history.replaceState({}, '', url.toString());

    // Reset title; effect will also enforce this
    document.title = 'Week Planner';
  };

  return (
    <>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          Weekly Planner
        </h1>
        <button
          className="icon-button"
          aria-label="Open settings"
          onClick={() => setIsSettingsOpen(true)}
          title="Settings"
        >
          ⚙
        </button>
      </header>
      <main id="main-content" className="days-list">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <WeekNavigation
            weekStartISO={getWeekStartISO()}
            setWeekStartISO={setWeekStartISO}
            showWeekends={showWeekends}
            setShowWeekends={setShowWeekendsAndUrl}
          />
        </div>

        {weekDays.map((day) => (
          <DayCard
            key={day.date}
            day={day}
            newItemText={newItems[day.date] || ''}
            onInputChange={handleInputChange}
            onAddItem={handleAddItem}
          />
        ))}
      </main>
      <footer>
        <RichTextSection
          weekDays={weekDays}
          itemsRef={itemsRef}
          dateFormat={dateFormat}
          showWeekends={showWeekends}
          headingLevel={headingLevel}
          setHeadingLevel={setHeadingLevelAndUrl}
        />
      </footer>

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        dateFormat={dateFormat}
        setDateFormat={setDateFormat}
        onReset={handleReset}
      />
    </>
  );
};
