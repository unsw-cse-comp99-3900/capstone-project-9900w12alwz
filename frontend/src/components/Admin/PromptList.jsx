// src/components/PromptList/PromptList.jsx
import React, { useRef, useEffect } from 'react';
import { Button } from 'primereact/button';
import { ListBox } from 'primereact/listbox';
import { OverlayPanel } from 'primereact/overlaypanel';
import { put, post, get } from '../../api';
import './css/PromptList.css';

const PromptList = ({ selectedGroup, prompts, setPrompts, selectedPrompt, setSelectedPrompt }) => {
  const overlayPanelRefs = useRef({});

  const onPromptSelect = (e) => {
    if (e.value && (!selectedPrompt || e.value.id !== selectedPrompt.id)) {
      setSelectedPrompt(e.value);
    }
  };

  const addNewPrompt = async () => {
    const newPrompt = { text: `New Prompt Text`, group: selectedGroup.group_id };
    try {
      const response = await post('/prompts/', newPrompt);
      setPrompts([...prompts, response.data]);
      setSelectedPrompt(response.data);
    } catch (error) {
      console.error('Error creating prompt:', error);
    }
  };

  const fetchGroupPrompts = async () => {
    try {
      const response = await get(`/groups/${selectedGroup.group_id}/prompts/`);
      const sortedPrompts = response.data.sort((a, b) => b.is_default - a.is_default);
      setPrompts(sortedPrompts);
      setSelectedPrompt(sortedPrompts.find(p => p.is_default === 1) || sortedPrompts[0]);
    } catch (error) {
      console.error('Error fetching group prompts:', error);
    }
  };

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupPrompts();
    }
  }, [selectedGroup]);

//   // set default prompt for every group
//   const setDefaultPrompt = async (promptId) => {
//     try {
//       // Set all prompts' is_default to 0 first
//       const resetPrompts = prompts.map((prompt) => ({ ...prompt, is_default: 0 }));

//       // Then set the selected prompt's is_default to 1
//       const updatedPrompts = resetPrompts.map((prompt) =>
//         prompt.id === promptId ? { ...prompt, is_default: 1 } : prompt
//       );

//       // Update all prompts in the backend
//       await Promise.all(updatedPrompts.map((prompt) => put(`/prompts/${prompt.id}/`, prompt)));

//       // Sort prompts to bring the default one on top
//       const sortedPrompts = updatedPrompts.sort((a, b) => b.is_default - a.is_default);

//       // Update state with sorted prompts and the newly set default prompt
//       setPrompts(sortedPrompts);
//       setSelectedPrompt(sortedPrompts.find((prompt) => prompt.is_default === 1) || sortedPrompts[0]);
//     } catch (error) {
//       console.error('Error setting default prompt:', error);
//     }
//   };

  const setDefaultPrompt = async (promptId) => {
    try {
      // 获取所有 prompts
      const response = await get('/prompts/');
      const allPrompts = response.data;
      // console.log('All Prompts:', allPrompts);

      // 将所有 prompts 的 is_default 设置为 0
      const resetPrompts = allPrompts.map((prompt) => ({ ...prompt, is_default: 0 }));

      // 设置选定的 prompt 的 is_default 为 1
      const updatedPrompts = resetPrompts.map((prompt) =>
        prompt.id === promptId ? { ...prompt, is_default: 1 } : prompt
      );

      // console.log('Updated Prompts:', updatedPrompts);

      // 更新所有 prompts 到后端
      await Promise.all(updatedPrompts.map((prompt) => put(`/prompts/${prompt.id}/`, prompt)));

      // 过滤出当前选定 group 的 prompts
      const currentGroupPrompts = updatedPrompts.filter((prompt) => prompt.group === selectedGroup.group_id);

      // console.log('Filtered Prompts for Group:', currentGroupPrompts);

      // 更新前端状态
      const sortedPrompts = currentGroupPrompts.sort((a, b) => b.is_default - a.is_default);
      setPrompts(sortedPrompts);
      const defaultPrompt = sortedPrompts.find((prompt) => prompt.is_default === 1);
      setSelectedPrompt(defaultPrompt);

      // 隐藏 OverlayPanel
      if (overlayPanelRefs.current[promptId]) {
        overlayPanelRefs.current[promptId].current.hide();
      }
    } catch (error) {
      console.error('Error setting default prompt:', error);
    }
  };

  return (
    <div className="prompt-list">
      <div className="prompt-list-header">
        <Button
          icon="pi pi-plus"
          label="Add New Prompt"
          className="add-new-prompt"
          onClick={addNewPrompt}
        />
      </div>
      <ListBox
        value={selectedPrompt}
        options={prompts}
        onChange={onPromptSelect}
        optionLabel="name"
        className="list-box prompts-list"
        itemTemplate={(option) => {
          if (!overlayPanelRefs.current[option.id]) {
            overlayPanelRefs.current[option.id] = React.createRef();
          }
          return (
            <div className={`prompt-list-item ${option.is_default ? 'default' : ''}`}>
              <span className="prompt-item-left">{option.name}</span>
              {option.is_default ? (
                <i className="pi pi-star prompt-item-right-default" style={{ marginLeft: 'auto' }}></i>
              ) : (
                <Button
                  icon="pi pi-ellipsis-h"
                  className="p-button-rounded p-button-text prompt-item-right"
                  onClick={(e) => {
                    overlayPanelRefs.current[option.id].current.toggle(e);
                  }}
                  style={{ marginLeft: 'auto' }}
                />
              )}
              <OverlayPanel
                ref={overlayPanelRefs.current[option.id]}
                dismissable
              >
                <div className="button-group">
                  <Button
                    label="Set Default"
                    className="p-button-secondary set-default-prompt"
                    onClick={() => setDefaultPrompt(option.id)}
                  />
                </div>
              </OverlayPanel>
            </div>
          );
        }}
      />
    </div>
  );
};

export default PromptList;

// import React from 'react';
// import { ListBox } from 'primereact/listbox';
// import './css/PromptList.css';

// const PromptList = ({ selectedPrompt, prompts, setSelectedPrompt }) => {
//   return (
//     <ListBox
//       value={selectedPrompt}
//       options={prompts}
//       onChange={(e) => setSelectedPrompt(e.value)}
//       optionLabel="name"
//       className="prompt-list"
//     />
//   );
// };

// export default PromptList;