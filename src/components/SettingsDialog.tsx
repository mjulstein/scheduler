// SettingsDialog.tsx - Modal dialog for app settings using native <dialog>
import { type FC, useEffect, useRef } from 'react';
import classes from './SettingsDialog.module.css';

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dateFormat: string;
  setDateFormat: (value: string) => void;
  onReset: () => void;
}

export const SettingsDialog: FC<SettingsDialogProps> = ({
  isOpen,
  onClose,
  dateFormat,
  setDateFormat,
  onReset
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  // Define preset formats for select; when dateFormat is not one of these, we show "Custom..."
  const presetFormats = [
    'yyyy-MM-dd',
    'MM/dd/yyyy',
    'dd MMM, yyyy',
    'cccc, d LLLL yyyy',
    'd/M/yyyy',
    'EEE, MMM d',
    'MMM d, yyyy',
    'dd.MM.yyyy',
    'MMMM d, yyyy'
  ];
  const isPreset = presetFormats.includes(dateFormat);
  const selectValue = isPreset ? dateFormat : '__custom__';
  const inputValue = isPreset ? '' : dateFormat;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);

    if (isOpen && !dialog.open) {
      try {
        dialog.showModal();
      } catch {
        // Fallback: ensure open if showModal not available
        dialog.setAttribute('open', '');
      }
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
    };
  }, [isOpen, onClose]);

  return (
    <dialog ref={dialogRef} aria-labelledby="settings-title" className={classes.dialog}>
      <header className={classes.header}>
        <h2 id="settings-title" className={classes.title}>Settings</h2>
        <button className={classes.iconButton} aria-label="Close settings" onClick={onClose}>
          ✕
        </button>
      </header>

      <section className={classes.section}>
        <fieldset className={classes.fieldset}>
          <legend className={classes.legend}>Date format</legend>
          <div className={classes.row}>
            <label htmlFor="date-format-select" className="sr-only">Date format</label>
            <select
              id="date-format-select"
              value={selectValue}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '__custom__') {
                  // Switch to custom mode: if currently a preset, clear to prompt typing
                  if (isPreset) setDateFormat('');
                  // Focus custom input
                  setTimeout(() => customInputRef.current?.focus(), 0);
                } else {
                  setDateFormat(v);
                }
              }}
              className={classes.select}
            >
              <option value="yyyy-MM-dd">2025-01-31 (yyyy-MM-dd)</option>
              <option value="MM/dd/yyyy">01/31/2025 (MM/dd/yyyy)</option>
              <option value="dd MMM, yyyy">31 Jan, 2025 (dd MMM, yyyy)</option>
              <option value="cccc, d LLLL yyyy">Friday, 31 January 2025 (cccc, d LLLL yyyy)</option>
              <option value="d/M/yyyy">31/1/2025 (d/M/yyyy)</option>
              <option value="EEE, MMM d">Fri, Jan 31 (EEE, MMM d)</option>
              <option value="MMM d, yyyy">Jan 31, 2025 (MMM d, yyyy)</option>
              <option value="dd.MM.yyyy">31.01.2025 (dd.MM.yyyy)</option>
              <option value="MMMM d, yyyy">January 31, 2025 (MMMM d, yyyy)</option>
              <option value="__custom__">Custom...</option>
            </select>
            <label htmlFor="date-format-custom" className="sr-only">Custom format</label>
            <input
              id="date-format-custom"
              type="text"
              ref={customInputRef}
              value={inputValue}
              onChange={(e) => setDateFormat(e.target.value)}
              className={classes.input}
              placeholder="Custom format"
            />
          </div>
        </fieldset>
      </section>

      <section className={classes.dangerSection} aria-labelledby="danger-zone-title">
        <div>
          <h3 id="danger-zone-title" className={classes.dangerTitle}>Danger zone</h3>
          <p className={classes.dangerText}>Reset clears items and settings on this device.</p>
        </div>
        <button className={classes.dangerButton} onClick={onReset}>Reset state</button>
      </section>

      <footer className={classes.footer}>
        <button className={classes.primaryButton} onClick={onClose}>Close</button>
      </footer>
    </dialog>
  );
};
