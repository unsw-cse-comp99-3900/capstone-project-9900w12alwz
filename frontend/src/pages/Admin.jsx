import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { ListBox } from 'primereact/listbox';
import { ScrollPanel } from 'primereact/scrollpanel';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';
import './Admin.css';
import Sidebar from '../components/Admin/Sidebar';

import { get, post, put, del } from '../api';

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
    if (prompts.length > 0 && (!selectedPrompt || !prompts.some(p => p.id === selectedPrompt.id))) {
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
    if (e.value && (!selectedPrompt || e.value.id !== selectedPrompt.id)) {
      setSelectedPrompt(e.value);
    }
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
      <Sidebar
        isPanelCollapsed={isPanelCollapsed}
        setIsPanelCollapsed={setIsPanelCollapsed}
        prompts={prompts}
        selectedPrompt={selectedPrompt}
        setSelectedPrompt={setSelectedPrompt}
        addNewPrompt={addNewPrompt}
        deletePrompt={deletePrompt}
      />
      <div className="main-content">
        <h1>Prompt</h1>
        {/* <DataTable value={selectedPrompt ? [selectedPrompt] : []} editMode="cell" tableStyle={{ minWidth: '50rem' }}>
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
        </DataTable> */}
        <div className="input-container">
          <div className="input-group">
            <label htmlFor="prompt-id">Prompt ID</label>
            <InputText
              id="prompt-id"
              value={selectedPrompt ? selectedPrompt.id : ''}
              readOnly
            />
          </div>
          <div className="input-group">
            <label htmlFor="prompt-text">Prompt Text</label>
            <textarea
              id="prompt-text"
              value={selectedPrompt ? selectedPrompt.text : ''}
              onChange={(e) => {
                const updatedPrompt = { ...selectedPrompt, text: e.target.value };
                setSelectedPrompt(updatedPrompt);

                const updatedPrompts = prompts.map((prompt) =>
                  prompt.id === updatedPrompt.id ? updatedPrompt : prompt
                );
                setPrompts(updatedPrompts);
              }}
            />
            <small id="prompt-help">
              Edit your prompt description here.
            </small>
          </div>
        </div>
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