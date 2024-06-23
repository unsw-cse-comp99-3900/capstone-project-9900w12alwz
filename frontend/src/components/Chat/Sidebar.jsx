import React, { useRef } from 'react';
import { Button } from 'primereact/button';
import { ListBox } from 'primereact/listbox';
import { Menu } from 'primereact/menu';
import itemsData from './items.json';
import './css/Sidebar.css';
const Sidebar = ({ isVisible, handlePopupClick, handleOptionClick, onScroll, toggleSidebar }) => {
  const menuRef = useRef(null);
  const selectedItemRef = useRef(null);

  const itemTemplate = (option) => (
    <div className="listbox-item-template" key={option.id}>
      <span className="item-label">{option.label}</span>
      <Button icon="pi pi-ellipsis-h" className="p-button-text p-button-plain align-right-button"
              onClick={(e) => handlePopupClick(e, option, menuRef, selectedItemRef)}/>
    </div>
  );

  return (
    <>
      {isVisible && window.innerWidth < 600 && <div className="overlay" onClick={toggleSidebar}></div>}
      <aside className={`sidebar ${isVisible ? 'visible' : 'hidden'}`} onScroll={onScroll}>
        <div className="sidebar-header">
        </div>
        <div className="sidebar-content">
          <ListBox options={itemsData} itemTemplate={itemTemplate} className="p-mt-3"/>
        </div>
        <Menu
          model={[
            { label: 'Option 1', command: handleOptionClick },
            { label: 'Option 2' }
          ]}
          popup
          ref={menuRef}
          id="popup_menu"
        />
      </aside>
    </>
  );
};

export default Sidebar;
