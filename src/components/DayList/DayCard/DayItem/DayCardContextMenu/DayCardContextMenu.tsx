import type { FC } from 'react';
import classes from './DayCardContextMenu.module.css';

interface DayCardContextMenuProps {
  itemId: string;
  onDelete?: () => void;
  onClose: () => void;
}

export const DayCardContextMenu: FC<DayCardContextMenuProps> = ({
  onDelete,
  onClose
}) => {
  return (
    <nav aria-label="Item actions" className={classes.contextMenu}>
      <ul className={classes.list}>
        <li>
          <button
            type="button"
            onClick={() => {
              onDelete?.();
              onClose();
            }}
          >
            Delete
          </button>
        </li>
        <li>
          <button type="button" onClick={onClose}>
            Move to top
          </button>
        </li>
        <li>
          <button type="button" onClick={onClose}>
            Move to bottom
          </button>
        </li>
        <li>
          <button type="button" onClick={onClose}>
            Move up
          </button>
        </li>
        <li>
          <button type="button" onClick={onClose}>
            Move down
          </button>
        </li>
        <li>
          <button type="button" onClick={onClose}>
            Copy text
          </button>
        </li>
      </ul>
    </nav>
  );
};
