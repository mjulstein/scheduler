// SettingsDialog.tsx - Modal dialog for app settings
import { type FC } from 'react';

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
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-content">
        <div className="modal-header">
          <h2 id="settings-title" style={{ margin: 0 }}>Settings</h2>
          <button className="icon-button" aria-label="Close settings" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-section">
          <label htmlFor="date-format-select" className="modal-label">Date format</label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              id="date-format-select"
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              style={{ minWidth: 180 }}
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
              onChange={(e) => setDateFormat(e.target.value)}
              style={{ minWidth: 220 }}
              placeholder="Custom format"
              aria-label="Custom date format"
            />
          </div>
        </div>

        <div className="modal-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Danger zone</strong>
            <div style={{ color: '#666', fontSize: 12 }}>Reset clears items and settings on this device.</div>
          </div>
          <button className="danger-button" onClick={onReset}>Reset state</button>
        </div>

        <div className="modal-footer">
          <button className="nav-button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

