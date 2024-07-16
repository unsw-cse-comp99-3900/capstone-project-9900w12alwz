// src/components/Admin/Sidebar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { ListBox } from 'primereact/listbox';
import { ScrollPanel } from 'primereact/scrollpanel';
import { OverlayPanel } from 'primereact/overlaypanel';
import './css/Sidebar.css';
import { put } from '../../api';

const Sidebar = ({ isPanelCollapsed, setIsPanelCollapsed, prompts, selectedPrompt,
  setSelectedPrompt, addNewPrompt, setPrompts }) => {

  const [visibleOverlay, setVisibleOverlay] = useState(null); 
  const overlayPanelRefs = useRef({}); 

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
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setDefaultPrompt = async (promptId) => {
    try {
      const resetPrompts = prompts.map((prompt) => ({ ...prompt, is_default: 0 }));

      const updatedPrompts = resetPrompts.map((prompt) => {
        const updatedPrompt = prompt.id === promptId ? { ...prompt, is_default: 1 } : prompt;
        // console.log(updatedPrompt.id);
        // console.log(updatedPrompt.is_default);
        return updatedPrompt;
      });

      await Promise.all(updatedPrompts.map((prompt) => put(`/prompts/${prompt.id}/`, prompt)));
      
      const sortedPrompts = updatedPrompts.sort((a, b) => b.is_default - a.is_default);

      setPrompts(sortedPrompts);

      const defaultPrompt = updatedPrompts.find((prompt) => prompt.is_default === 1);
      setSelectedPrompt(defaultPrompt);
    } catch (error) {
      console.error('Error setting default prompt:', error);
    }
  };

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
            optionLabel="name"
            className="list-box"
            itemTemplate={(option) => {
              if (!overlayPanelRefs.current[option.id]) {
                overlayPanelRefs.current[option.id] = React.createRef();
              }
              return (
                <div className={`admin-list-box-item ${option.is_default ? 'default' : ''}`}>
                  <span className="admin-item-left">{option.name}</span>
                  <Button
                    icon="pi pi-ellipsis-h"
                    className="p-button-rounded p-button-text admin-item-right"
                    onClick={(e) => {
                      setVisibleOverlay(option.id);
                      overlayPanelRefs.current[option.id].current.toggle(e);
                    }}
                    style={{ marginLeft: 'auto' }}
                  />
                  <OverlayPanel
                    ref={overlayPanelRefs.current[option.id]}
                    dismissable
                    onHide={() => setVisibleOverlay(null)}
                  >
                    <div className="button-group">
                      <Button
                        label="Default"
                        className="p-button-secondary"
                        onClick={() => setDefaultPrompt(option.id)}
                      />
                    </div>
                  </OverlayPanel>
                </div>
              );
            }}
          />
        </ScrollPanel>
      )}
    </div>
  );
};

export default Sidebar;