// src/components/Admin/Admin.jsx
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import './Admin.css';
import Sidebar from '../components/Admin/Sidebar';
import PromptList from '../components/Admin/PromptList';
import { ListBox } from 'primereact/listbox'; 

import { get, post, put, del } from '../api';

const Admin = () => {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  useEffect(() => {
    if (prompts.length > 0 && (!selectedPrompt || !prompts.some(p => p.id === selectedPrompt.id))) {
      setSelectedPrompt(prompts.find(p => p.is_default === 1) || prompts[0]);
    }
  }, [prompts]);

  const fetchPrompts = async () => {
    try {
      const response = await get('/prompts/');
      const sortedPrompts = response.data.sort((a, b) => b.is_default - a.is_default);
      setPrompts(sortedPrompts);
      setSelectedPrompt(sortedPrompts.find(p => p.is_default === 1) || sortedPrompts[0]);
    } catch (error) {
      console.error('Error fetching prompts:', error);
    }
  };

  const addNewPrompt = async () => {
    const newPrompt = { text: `New Prompt Text`, is_default: 0 };
    try {
      const response = await post('/prompts/', newPrompt);
      const updatedPrompts = [...prompts, response.data];
      const sortedPrompts = updatedPrompts.sort((a, b) => b.is_default - a.is_default);
      setPrompts(sortedPrompts);
      setSelectedPrompt(response.data);
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const deletePrompt = async (promptId) => {
    try {
      await del(`/prompts/${promptId}/`);
      const updatedPrompts = prompts.filter(prompt => prompt.id !== promptId);
      const sortedPrompts = updatedPrompts.sort((a, b) => b.is_default - a.is_default);
      setPrompts(sortedPrompts);
      setSelectedPrompt(sortedPrompts.length > 0 ? sortedPrompts[0] : null);
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
        setPrompts={setPrompts}
      />
      <div className="main-content">
        <h1>Prompt</h1>
        <div>
          <div className="list-header">

          </div>
          <PromptList 
            selectedPrompt={selectedPrompt}
            prompts={prompts}
            setSelectedPrompt={setSelectedPrompt}
          />
        </div>
        <div className="input-container">
          <div className="input-group">
            <label htmlFor="prompt-id">Prompt ID</label>
            <InputText
              id="prompt-name"
              value={selectedPrompt ? selectedPrompt.id : ''}
              readOnly
            />
          </div>
          <div className="input-group">
            <label htmlFor="prompt-name">Prompt Name</label>
            <InputText
              id="prompt-name"
              value={selectedPrompt ? selectedPrompt.name : ''}
              onChange={(e) => {
                const updatedPrompt = { ...selectedPrompt, name: e.target.value };
                setSelectedPrompt(updatedPrompt);
              }}
            />
            <small id="prompt-help">
              Edit your prompt name here.
            </small>
          </div>
          <div className="input-group">
            <label htmlFor="prompt-text">Prompt Description</label>
            <textarea
              id="prompt-text"
              value={selectedPrompt ? selectedPrompt.text : ''}
              onChange={(e) => {
                const updatedPrompt = { ...selectedPrompt, text: e.target.value };
                setSelectedPrompt(updatedPrompt);
              }}
            />
            <small id="prompt-help">
              Edit your prompt description here.
            </small>
          </div>
        </div>
        <div className="button-group">
          <Button
            label="Confirm"
            icon="pi pi-check"
            onClick={async () => {
              try {
                await put(`/prompts/${selectedPrompt.id}/`, selectedPrompt);

                const updatedPrompts = prompts.map((prompt) =>
                  prompt.id === selectedPrompt.id ? selectedPrompt : prompt
                );
                const sortedPrompts = updatedPrompts.sort((a, b) => b.is_default - a.is_default);

                setPrompts(sortedPrompts);
                setSelectedPrompt(selectedPrompt);
                // console.log('Modified row data:', selectedPrompt);
              } catch (error) {
                console.error('Error updating prompt:', error);
              }
            }}
          />
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