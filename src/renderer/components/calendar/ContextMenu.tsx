import React from 'react';

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
}

function ContextMenu({ x, y, items }: ContextMenuProps) {
  return (
    <div style={{ position: 'fixed', top: y, left: x, zIndex: 1000, border: '1px solid white' }}>
      {items.map((item, index) => (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions,react/no-array-index-key,jsx-a11y/click-events-have-key-events
        <div key={index} onClick={item.onClick} style={{ padding: '10px' }}>
          {item.label}
        </div>
      ))}
    </div>
  );
}

export default ContextMenu;
