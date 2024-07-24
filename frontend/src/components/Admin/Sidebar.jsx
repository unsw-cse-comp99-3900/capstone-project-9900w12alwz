// src/components/Admin/Sidebar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';
import { ListBox } from 'primereact/listbox';
import { ScrollPanel } from 'primereact/scrollpanel';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Dialog } from 'primereact/dialog';
import './css/Sidebar.css';
import { get, post, del } from '../../api';
import ThemeSwitcher from "../ThemeSwitcher";

const Sidebar = ({ isPanelCollapsed, setIsPanelCollapsed, groups, selectedGroup, setSelectedGroup, setGroups }) => {
  const [visibleOverlay, setVisibleOverlay] = useState(null);
  const [warningVisible, setWarningVisible] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const overlayPanelRefs = useRef({});
  const navigate = useNavigate();

  const onGroupSelect = (e) => {
    if (e.value && (!selectedGroup || e.value.group_id !== selectedGroup.group_id)) {
      setSelectedGroup(e.value);
    }
  };

  const handleResize = () => {
    if (window.innerWidth < 600) {
      setIsPanelCollapsed(true);
    } else {
      setIsPanelCollapsed(false);
    }
  };

  const goToChat = () => {
    navigate('/chat');
  };

  const addNewGroup = async () => {
    const newGroup = { group_name: `New Group` };
    try {
      const response = await post('/groups/', newGroup);
      setGroups([...groups, response.data]);
      setSelectedGroup(response.data);
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const checkGroupEmpty = async (groupId) => {
    try {
      const response = await get(`/groups/${groupId}/prompts/`);
      return response.data.length === 0;
    } catch (error) {
      console.error('Error checking group prompts:', error);
      return false;
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (await checkGroupEmpty(groupId)) {
      deleteGroup(groupId);
    } else {
      setWarningVisible(true);
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      await del(`/groups/${groupId}/`);
      const updatedGroups = groups.filter(group => group.group_id !== groupId);
      setGroups(updatedGroups);
      setSelectedGroup(updatedGroups.length > 0 ? updatedGroups[0] : null); // 选择第一个 group 或 null
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  useEffect(() => {
    handleResize();
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
          <>
            <Button
              icon="pi pi-pen-to-square"
              className="p-button-icon-only"
              onClick={addNewGroup}
            />
            <ThemeSwitcher />
            <Button
              icon="pi pi-home"
              className="p-button-rounded p-button-icon-only"
              onClick={goToChat}
            />
          </>
        )}
      </div>
      {!isPanelCollapsed && (
        <ScrollPanel className="scroll-panel">
          <ListBox
            value={selectedGroup}
            options={groups}
            onChange={onGroupSelect}
            optionLabel="group_name"
            className="list-box"
            itemTemplate={(option) => {
              if (!overlayPanelRefs.current[option.group_id]) {
                overlayPanelRefs.current[option.group_id] = React.createRef();
              }
              return (
                <div className="admin-list-box-item">
                  <span className="admin-item-left">{option.group_name}</span>
                  <Button
                    icon="pi pi-ellipsis-h"
                    className="p-button-rounded p-button-text admin-item-right"
                    onClick={(e) => {
                      setVisibleOverlay(option.group_id);
                      overlayPanelRefs.current[option.group_id].current.toggle(e);
                    }}
                    style={{ marginLeft: 'auto' }}
                  />
                  <OverlayPanel
                    ref={overlayPanelRefs.current[option.group_id]}
                    dismissable
                    onHide={() => setVisibleOverlay(null)}
                  >
                    <div className="button-group">
                      <Button
                        label="Delete"
                        className="p-button-danger"
                        onClick={() => setGroupToDelete(option.group_id)}
                      />
                    </div>
                  </OverlayPanel>
                </div>
              );
            }}
          />
        </ScrollPanel>
      )}

      <Dialog
        header="Cannot Delete Group"
        visible={warningVisible}
        style={{ width: '50vw' }}
        footer={<Button label="OK" onClick={() => setWarningVisible(false)} />}
        onHide={() => setWarningVisible(false)}
      >
        <p>This group contains prompts and cannot be deleted. Please delete all prompts before deleting the group.</p>
      </Dialog>

      {groupToDelete && (
        <Dialog
          header="Confirm Deletion"
          visible={groupToDelete !== null}
          style={{ width: '50vw' }}
          footer={
            <>
              <Button label="No" onClick={() => setGroupToDelete(null)} />
              <Button
                label="Yes"
                className="p-button-danger"
                onClick={() => {
                  handleDeleteGroup(groupToDelete);
                  setGroupToDelete(null);
                }}
              />
            </>
          }
          onHide={() => setGroupToDelete(null)}
        >
          <p>Are you sure you want to delete this group?</p>
        </Dialog>
      )}
    </div>
  );
};

export default Sidebar;