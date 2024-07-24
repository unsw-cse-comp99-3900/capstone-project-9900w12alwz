// src/components/PromptList/PromptList.jsx
import React from 'react';
import { ListBox } from 'primereact/listbox';
import './css/PromptList.css';

const PromptList = ({ selectedPrompt, prompts, setSelectedPrompt }) => {
  return (
    <ListBox
      value={selectedPrompt}
      options={prompts}
      onChange={(e) => setSelectedPrompt(e.value)}
      optionLabel="name"
      className="prompt-list"
    />
  );
};

export default PromptList;