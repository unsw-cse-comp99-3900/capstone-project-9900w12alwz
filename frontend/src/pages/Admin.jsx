import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { ListBox } from 'primereact/listbox';
import { ScrollPanel } from 'primereact/scrollpanel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import './Admin.css';

const Admin = () => {
  const [prompts, setPrompts] = useState([
    { id: 1, name: 'Item 1', details: 'Details of Item 1' },
    { id: 2, name: 'Item 2', details: 'Details of Item 2' },
    { id: 3, name: 'Item 3', details: 'Details of Item 3' },

  ]);
  const [selectedPrompt, setSelectedPrompt] = useState(prompts[0]);

  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  const overlayPanelRef = useRef(null);

  const columns = [
    { field: 'id', header: 'Id' },
    { field: 'name', header: 'Name' },
    { field: 'details', header: 'details' }
  ];

  useEffect(() => {
    if (!selectedPrompt && prompts.length > 0) {
      setSelectedPrompt(prompts[0]);
    }
  }, [prompts, selectedPrompt]);

  const onPromptSelect = (e) => {
    setSelectedPrompt(e.value);
  };

  const onCellEditComplete = (e) => {
    let { rowData, newValue, field, originalEvent: event } = e;
    if (rowData && newValue.trim().length > 0) {
      rowData[field] = newValue;

      // Update the prompt directly
      const updatedPrompts = prompts.map((prompt) =>
        prompt.id === rowData.id ? rowData : prompt
      );

      // Update the state
      setPrompts(updatedPrompts);
      setSelectedPrompt({ ...rowData }); // Ensure re-rendering
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
              onClick={() => {
                const newId = prompts.length > 0 ? Math.max(...prompts.map(prompt => prompt.id)) + 1 : 1;
                const newPrompt = { id: newId, name: `Item ${newId}`, details: `Details of Item ${newId}` };
                const updatedPrompts = [...prompts, newPrompt];
                setPrompts(updatedPrompts);
                setSelectedPrompt(newPrompt);
              }}
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
              itemTemplate={(option) => (
                <div className="list-box-item">
                  <span>{option.name}</span>
                  <Button
                    icon="pi pi-ellipsis-h"
                    className="p-button-rounded p-button-text"
                    style={{ marginLeft: 'auto' }}
                    onClick={(e) => overlayPanelRef.current.toggle(e)}
                  />
                  <OverlayPanel ref={overlayPanelRef} dismissable>
                    <div className="button-group">
                      <Button label="Edit" icon="pi pi-pencil" className="p-button-secondary" />
                      <Button label="Delete" icon="pi pi-trash" className="p-button-danger" />
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
            if (field === 'id') return null;
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
          <Button label="Delete" icon="pi pi-trash" className="p-button-danger" onClick={() => {
            const updatedPrompts = prompts.filter(prompt => prompt.id !== selectedPrompt.id);
            setPrompts(updatedPrompts);
            setSelectedPrompt(updatedPrompts.length > 0 ? updatedPrompts[0] : null);
          }} />
        </div>
      </div>
    </div>
  );
};

export default Admin;