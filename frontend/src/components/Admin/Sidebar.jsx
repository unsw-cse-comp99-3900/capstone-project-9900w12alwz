// src/components/Admin/Sidebar.jsx

import React, { useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { ListBox } from 'primereact/listbox';
import { ScrollPanel } from 'primereact/scrollpanel';
import { OverlayPanel } from 'primereact/overlaypanel';
import './css/Sidebar.css';

const Sidebar = ({ isPanelCollapsed, setIsPanelCollapsed, prompts, selectedPrompt, setSelectedPrompt, addNewPrompt, deletePrompt }) => {
  const overlayPanelRef = useRef(null);

  const onPromptSelect = (e) => {
    if (e.value && (!selectedPrompt || e.value.id !== selectedPrompt.id)) {
      setSelectedPrompt(e.value);
    }
  };

  const handleResize = () => {
    if (window.innerWidth < 1600) {
      setIsPanelCollapsed(true);
    } else {
      setIsPanelCollapsed(false);
    }
  };

  useEffect(() => {
    handleResize(); // Check initial screen width
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`sidebar ${isPanelCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <Button
          icon="pi pi-bars"
          className="p-button-icon-only"
          onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
        />
        {!isPanelCollapsed && (
          <Button
            icon="pi pi-pencil"
            className="p-button-icon-only"
            onClick={addNewPrompt}
          />
        )}
      </div>
      {!isPanelCollapsed && (
        <ScrollPanel className="scroll-panel">
          <ListBox
            value={selectedPrompt}
            options={prompts}
            onChange={onPromptSelect}
            optionLabel="text"
            className="list-box"
            itemTemplate={(option) => (
              <div className="admin-list-box-item">
                <span className="admin-item-left">PROMPT {option.id}</span>
                <Button
                  icon="pi pi-ellipsis-h"
                  className="p-button-rounded p-button-text admin-item-right"
                  onClick={(e) => overlayPanelRef.current.toggle(e)}
                  style={{ marginLeft: 'auto' }}
                />
                <OverlayPanel ref={overlayPanelRef} dismissable>
                  <div className="button-group">
                    <Button label="Default" className="p-button-secondary" />
                    {/* <Button
                      label="Delete"
                      icon="pi pi-trash"
                      className="p-button-danger"
                      onClick={() => deletePrompt(option.id)}
                    /> */}
                  </div>
                </OverlayPanel>
              </div>
            )}
          />
        </ScrollPanel>
      )}
    </div>
  );
};

export default Sidebar;