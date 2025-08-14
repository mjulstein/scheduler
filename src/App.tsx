// App.tsx - Main application component
import { useState, useEffect, useRef } from 'react';
import './App.css';
import type { DayData, DayItem } from './components/DayList/Types.ts';
import { getStateFromUrl, updateUrlWithState } from './urlState';
import { formatISODate, getMondayOfWeek } from './dateUtils';
import { WeekNavigation } from './components/WeekNavigation';
// Replace direct DayCard usage with DayList
import { DayList } from './components/DayList';
import { RichTextSection } from './components/RichTextSection';
import {
  useSearchParams,
  useLocation,
  useNavigate,
  Navigate
} from 'react-router-dom';
import { DateTime } from 'luxon';
import { SettingsDialog } from './components/SettingsDialog';

/**
 * Main application component
 */
export const App = () => {
  // Initialize items from URL hash only
  const urlState = getStateFromUrl();

  const [weekDays, setWeekDays] = useState<DayData[]>([]);
  const [newItems, setNewItems] = useState<{ [key: string]: string }>({});
  const itemsRef = useRef<{ [date: string]: DayItem[] }>(urlState || {});

  const location = useLocation();
  const navigate = useNavigate();

  // Date format, heading level, and showWeekends in search params
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDateFormat = searchParams.get('dateFormat') || 'yyyy-MM-dd';
  const [dateFormat, setDateFormatState] = useState<string>(initialDateFormat);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const initialHeadingLevel = searchParams.get('headingLevel') || 'h3';
  const [headingLevel, setHeadingLevel] = useState<string>(initialHeadingLevel);
  const initialShowWeekendsParam = searchParams.get('weekends');
  const [showWeekends, setShowWeekends] = useState<boolean>(
    initialShowWeekendsParam === '1' || initialShowWeekendsParam === 'true'
  );

  // Utils
  const normalizeToIsoMonday = (iso: string): string => {
    const dt = DateTime.fromISO(iso);
    if (!dt.isValid) return iso;
    return dt
      .set({ weekday: 1, hour: 0, minute: 0, second: 0, millisecond: 0 })
      .toISODate()!;
  };

  const getFirstPathSegment = (): string | null => {
    const segs = location.pathname.split('/').filter(Boolean);
    return segs.length > 0 ? segs[0] : null;
  };

  const replaceFirstPathSegment = (newSeg: string | null, replace = true) => {
    const segs = location.pathname.split('/').filter(Boolean);
    const rest = segs.slice(1);
    const finalSegs = newSeg ? [newSeg, ...rest] : rest;
    const newPath = '/' + finalSegs.join('/');
    navigate(newPath + location.search + location.hash, { replace });
  };

  // Helpers for dateFormat and headingLevel in search params
  const setDateFormat = (value: string) => {
    setDateFormatState(value);
    setSearchParams((params) => {
      params.set('dateFormat', value);
      return params;
    });
    ensureWeekStartInPath();
  };

  const setHeadingLevelAndUrl = (value: string) => {
    setHeadingLevel(value);
    setSearchParams((params) => {
      params.set('headingLevel', value);
      params.set('dateFormat', dateFormat);
      return params;
    });
    ensureWeekStartInPath();
  };

  // Determine the current week's Monday ISO from path or today
  const getWeekStartISO = (): string => {
    const first = getFirstPathSegment();
    if (first) {
      const dt = DateTime.fromISO(first);
      if (dt.isValid) return normalizeToIsoMonday(first);
    }
    const today = new Date();
    const monday = getMondayOfWeek(today, 0);
    return formatISODate(monday);
  };

  // Ensure path has weekStart on first mutation when no subroute exists
  const ensureWeekStartInPath = () => {
    const first = getFirstPathSegment();
    if (!first) {
      const mondayIso = DateTime.now().set({ weekday: 1 }).toISODate()!;
      replaceFirstPathSegment(mondayIso, true);
    }
  };

  // Setters to update state and URL for showWeekends (search param)
  const setShowWeekendsAndUrl = (value: boolean) => {
    setShowWeekends(value);
    setSearchParams((params) => {
      if (value) params.set('weekends', '1');
      else params.delete('weekends');
      return params;
    });
    ensureWeekStartInPath();
  };

  // Generate days based on path-derived weekStart and showWeekends
  useEffect(() => {
    const weekStartISO = getWeekStartISO();

    const monday = DateTime.fromISO(weekStartISO);
    const today = new Date();
    const todayISODate = formatISODate(today);

    const days: DayData[] = [];

    for (let i = 0; i < 7; i++) {
      const jsDate = monday.plus({ days: i }).toJSDate();
      const isoDate = formatISODate(jsDate);
      const luxonDate = DateTime.fromJSDate(jsDate);
      const dayName = luxonDate.toFormat(dateFormat);
      const dayOfWeek = jsDate.getDay(); // 0 is Sunday, 6 is Saturday

      if (!showWeekends && (dayOfWeek === 0 || dayOfWeek === 6)) continue;

      const items = itemsRef.current[isoDate] || [];

      days.push({
        date: isoDate,
        dayName,
        items,
        isToday: isoDate === todayISODate
      });

      setNewItems((prev) => ({
        ...prev,
        [isoDate]: prev[isoDate] || ''
      }));
    }

    setWeekDays(days.reverse());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, showWeekends, dateFormat]);

  // Set page title based on path weekStart
  useEffect(() => {
    const first = getFirstPathSegment();
    if (!first) {
      document.title = 'Week Planner';
      return;
    }
    const dt = DateTime.fromISO(first);
    if (!dt.isValid) {
      document.title = 'Week Planner';
      return;
    }
    const monday = DateTime.fromISO(normalizeToIsoMonday(first));
    const weekNumber = monday.weekNumber;
    const weekYear = monday.weekYear;
    document.title = `Week ${weekNumber} ${weekYear}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, showWeekends, dateFormat]);

  // Week navigation updates the first path segment
  const setWeekStartISO = (iso: string) => {
    const normalized = normalizeToIsoMonday(iso);
    replaceFirstPathSegment(normalized, false);
    // Base64 hash only stores items
    updateUrlWithState(itemsRef.current);
  };

  const handleAddItem = (dayDate: string) => {
    if ((newItems[dayDate] || '').trim() === '') return;
    const newItem = { id: Date.now().toString(), text: newItems[dayDate] };
    const currentItems = itemsRef.current[dayDate] || [];
    itemsRef.current[dayDate] = [...currentItems, newItem];
    setWeekDays((prevDays) =>
      prevDays.map((day) =>
        day.date === dayDate
          ? { ...day, items: itemsRef.current[dayDate] }
          : day
      )
    );
    setNewItems((prev) => ({ ...prev, [dayDate]: '' }));
    ensureWeekStartInPath();
    // Persist only items to base64 hash
    updateUrlWithState(itemsRef.current);
  };

  const handleInputChange = (dayDate: string, value: string) => {
    setNewItems((prev) => ({ ...prev, [dayDate]: value }));
    // Do not persist free-text inputs in base64 or search params
  };

  const handleSaveItem = (dayDate: string, itemId: string, value: string) => {
    const currentItems = itemsRef.current[dayDate] || [];
    const idx = currentItems.findIndex((i) => i.id === itemId);
    if (idx === -1) return;
    const updated = [...currentItems];
    updated[idx] = { ...updated[idx], text: value };
    itemsRef.current[dayDate] = updated;
    setWeekDays((prevDays) =>
      prevDays.map((d) => (d.date === dayDate ? { ...d, items: updated } : d))
    );
    updateUrlWithState(itemsRef.current);
  };

  const handleDeleteItem = (dayDate: string, itemId: string) => {
    const currentItems = itemsRef.current[dayDate] || [];
    const updated = currentItems.filter((i) => i.id !== itemId);
    itemsRef.current[dayDate] = updated;
    setWeekDays((prevDays) =>
      prevDays.map((d) => (d.date === dayDate ? { ...d, items: updated } : d))
    );
    updateUrlWithState(itemsRef.current);
  };

  const handleReset = () => {
    // Clear in-memory state
    itemsRef.current = {};
    setNewItems({});
    setShowWeekends(false);
    setHeadingLevel('h3');
    setDateFormatState('yyyy-MM-dd');

    // Keep path as-is; clear search params and hash
    setSearchParams({});
    const url = new URL(window.location.href);
    url.hash = '';
    window.history.replaceState({}, '', url.toString());

    document.title = 'Week Planner';
  };

  return (
    <>
      {(() => {
        const seg = getFirstPathSegment();
        if (!seg) return null; // no subroutes; don't change URL
        const dt = DateTime.fromISO(seg);
        if (!dt.isValid) {
          const currentMonday = DateTime.now().set({ weekday: 1 }).toISODate()!;
          const segs = location.pathname.split('/').filter(Boolean).slice(1);
          const newPath = '/' + [currentMonday, ...segs].join('/');
          return (
            <Navigate to={newPath + location.search + location.hash} replace />
          );
        }
        const mondayIso = normalizeToIsoMonday(seg);
        if (mondayIso !== seg) {
          const segs = location.pathname.split('/').filter(Boolean).slice(1);
          const newPath = '/' + [mondayIso, ...segs].join('/');
          return (
            <Navigate to={newPath + location.search + location.hash} replace />
          );
        }
        return null;
      })()}

      <header>
        <div
          role="heading"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            justifyContent: 'space-between'
          }}
        >
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            Week Planner
          </h1>
          <button
            className="icon-button"
            aria-label="Open settings"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
          >
            ⚙<span className="sr-only">Open settings</span>
          </button>
        </div>
        <div
          role="toolbar"
          aria-label="Toolbar"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8
          }}
        >
          <WeekNavigation
            weekStartISO={getWeekStartISO()}
            setWeekStartISO={setWeekStartISO}
            showWeekends={showWeekends}
            setShowWeekends={setShowWeekendsAndUrl}
          />
        </div>
      </header>
      <main id="main-content">
        <DayList
          days={weekDays}
          newItemTextByDate={newItems}
          onInputChange={handleInputChange}
          onAddItem={handleAddItem}
          onSaveItem={handleSaveItem}
          onDeleteItem={handleDeleteItem}
          onReorderItems={(dayDate, newItemsForDay) => {
            // Update in-memory items and refresh day list
            itemsRef.current[dayDate] = newItemsForDay;
            setWeekDays((prevDays) =>
              prevDays.map((d) =>
                d.date === dayDate ? { ...d, items: newItemsForDay } : d
              )
            );
            // Persist only items to base64 hash
            updateUrlWithState(itemsRef.current);
          }}
        />
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
