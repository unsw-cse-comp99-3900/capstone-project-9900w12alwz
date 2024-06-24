import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './Chat.css';
import Sidebar from '../components/Chat/Sidebar';
import ThemeSwitcher from "../components/ThemeSwitcher";
import ChatMessage from "../components/Chat/ChatMessage";
import InputBox from "../components/Chat/InputBox";

const Chat = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth >= 600);
  const [showBubble, setShowBubble] = useState(true);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // const initialMessages = [
    //   { text: 'Hello!', isUser: false },
    //   { text: 'Hi there!', isUser: true }
    // ];
    // setTimeout(() => {
    //   setMessages(initialMessages);
    // }, 1000);

    // Simulate getting the chat list
    const initialSidebarItems = [
      { label: 'Item 1', id: 1 },
      { label: 'Item 2', id: 2 },
      { label: 'Item 3', id: 3 }
    ];
    setTimeout(() => {
      setSidebarItems(initialSidebarItems);
    }, 1000);
  }, []);

  // Simulate conversation
  const handleSend = async (message) => {
    setMessages(prevMessages => [...prevMessages, { text: message, isUser: true }]);

    try {
      const response = await fetch('http://localhost:8000/api/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question: message })
      });
      const data = await response.json();
      if (data && data.answer) {
        setMessages(prevMessages => [...prevMessages, { text: data.answer, isUser: false }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Upload file
  const handleUpload = () => {
    console.log('Upload clicked');
  };

  // Get the real window height
  const updateVh = () => {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--doc-height', `${vh}px`);
  };

  useEffect(() => {
    updateVh();
    window.addEventListener('resize', updateVh);
    return () => window.removeEventListener('resize', updateVh);
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Handle pop click on sidebar
  const handlePopupClick = (event, item, menuRef, selectedItemRef) => {
    event.preventDefault();
    selectedItemRef.current = item;
    menuRef.current.toggle(event);
  };

  // Handle option click in sidebar
  const handleOptionClick = (item) => {
    setSidebarItems(prevItems => prevItems.filter(i => i.id !== item.id));
  };

  // Prevent accidental scrolling of the main interface
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  // Sidebar auto hide
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 600 && isSidebarVisible) {
        setIsSidebarVisible(false);
      } else if (window.innerWidth >= 600 && !isSidebarVisible) {
        setIsSidebarVisible(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarVisible]);

  const navigate = useNavigate();

  const goToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="chat-container">
      <Sidebar
        items={sidebarItems}
        isVisible={isSidebarVisible}
        handlePopupClick={handlePopupClick}
        handleOptionClick={handleOptionClick}
        onScroll={stopPropagation}
        toggleSidebar={toggleSidebar}
      />
      <div className={`main-content ${isSidebarVisible ? 'with-sidebar' : ''}`}>
        <div className={`main-content-header ${!isSidebarVisible ? 'collapsed' : ''}`}>
        </div>
        <div className="main-tool-bar">
          <div className={`main-tool-bar-tools ${!isSidebarVisible ? 'collapsed' : ''}`}>
            <Button icon="pi pi-bars" onClick={toggleSidebar} className="toggle-sidebar-btn"/>
            <Button icon="pi pi-pen-to-square" className="new-chat-btn"/>
          </div>
          <div className={`main-tool-bar-misc`}>
            <ThemeSwitcher/>
            <Button icon="pi pi-cog" onClick={goToAdmin} className="p-button-rounded p-button-icon-only"/>
          </div>
        </div>
        <div className="messages">
          {messages.length === 0 ? (
            <div className="greeting-container">
              <i className={`pi pi-comments greeting-icon`}/>
              <h2>Welcome to the EA Assist</h2>
              <p>Start by typing your message in the input box below.</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <ChatMessage key={index} message={msg.text} isUser={msg.isUser} showBubble={showBubble}/>
            ))
          )}
          <div ref={messagesEndRef}/>
        </div>
        <div className="input-box-container">
          <InputBox onSend={handleSend} onUpload={handleUpload}/>
        </div>
      </div>
    </div>
  );
};

export default Chat;
