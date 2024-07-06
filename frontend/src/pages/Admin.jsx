import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { ListBox } from 'primereact/listbox';
import { ScrollPanel } from 'primereact/scrollpanel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import './Admin.css';

import { get, post, put, del } from '../api';  // 引入API方法

const Admin = () => {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(prompts[0]);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const overlayPanelRef = useRef(null);

  const columns = [
    { field: 'id', header: 'ID' },
    { field: 'text', header: 'Text' }
  ];

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    if (!selectedPrompt && prompts.length > 0) {
      setSelectedPrompt(prompts[0]);
    }
  }, [prompts, selectedPrompt]);

  const fetchPrompts = async () => {
    try {
      const response = await get('/prompts/');
      setPrompts(response.data);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  const onPromptSelect = (e) => {
    setSelectedPrompt(e.value);
  };

  const onCellEditComplete = async (e) => {
    let { rowData, newValue, field, originalEvent: event } = e;
    if (rowData && newValue.trim().length > 0) {
      rowData[field] = newValue;
      try {
        await put(`/prompts/${rowData.id}/`, rowData);
        // Update the state
        const updatedPrompts = prompts.map((prompt) =>
          prompt.id === rowData.id ? rowData : prompt
        );
        setPrompts(updatedPrompts);
        setSelectedPrompt({ ...rowData }); // Ensure re-rendering
      } catch (error) {
        console.error('Error updating prompt:', error);
        event.preventDefault();
      }
    } else {
      event.preventDefault();
    }
  };

  const cellEditor = (options) => {
    return textEditor(options);
  };

  const textEditor = (options) => {
    return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} onKeyDown={(e) => e.stopPropagation()} />;
  };

  const addNewPrompt = async () => {
    const newPrompt = { text: `New Prompt Text` };
    try {
      const response = await post('/prompts/', newPrompt);
      const updatedPrompts = [...prompts, response.data];
      setPrompts(updatedPrompts);
      setSelectedPrompt(response.data);
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const deletePrompt = async (promptId) => {
    try {
      await del(`/prompts/${promptId}/`);
      const updatedPrompts = prompts.filter(prompt => prompt.id !== promptId);
      setPrompts(updatedPrompts);
      setSelectedPrompt(updatedPrompts.length > 0 ? updatedPrompts[0] : null);
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  return (
    <div className="admin-container">
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
                <div className="list-box-item">
                  <span>{option.id}: {option.text}</span>
                  <Button
                    icon="pi pi-ellipsis-h"
                    className="p-button-rounded p-button-text"
                    style={{ marginLeft: 'auto' }}
                    onClick={(e) => overlayPanelRef.current.toggle(e)}
                  />
                  <OverlayPanel ref={overlayPanelRef} dismissable>
                    <div className="button-group">
                      <Button label="Edit" icon="pi pi-pencil" className="p-button-secondary" />
                      <Button
                        label="Delete"
                        icon="pi pi-trash"
                        className="p-button-danger"
                        onClick={() => deletePrompt(option.id)}
                      />
                    </div>
                  </OverlayPanel>
                </div>
              )}
            />
          </ScrollPanel>
        )}
      </div>
      <div className="main-content">
        <h1>Details</h1>
        <DataTable value={selectedPrompt ? [selectedPrompt] : []} editMode="cell" tableStyle={{ minWidth: '50rem' }}>
          {columns.map(({ field, header }) => {
            // if (field === 'id') return null;
            return (
              <Column
                key={field}
                field={field}
                header={header}
                editor={(options) => cellEditor(options)}
                onCellEditComplete={onCellEditComplete}
              />
            );
          })}
        </DataTable>
        <div className="button-group">
          <Button label="Confirm" icon="pi pi-check" onClick={() => console.log('Modified row data:', selectedPrompt)} />
          <Button
            label="Delete"
            icon="pi pi-trash"
            className="p-button-danger"
            onClick={() => deletePrompt(selectedPrompt.id)}
          />
        </div>
      </div>
    </div>
  );
};

export default Admin;