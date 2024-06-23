import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import 'primereact/resources/themes/viva-dark/theme.css';
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
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 模拟后端返回初始消息
    const initialMessages = [
      { text: 'Hello!', isUser: false },
      { text: 'Hi there!', isUser: true }
    ];
    setTimeout(() => {
      setMessages(initialMessages);
    }, 1000); // 1秒延时模拟后端请求
  }, []);

  const handleSend = (message) => {
    setMessages(prevMessages => [...prevMessages, { text: message, isUser: true }]);

    // 模拟后端返回
    setTimeout(() => {
      setMessages(prevMessages => [...prevMessages, { text: `Echo: ${message}`, isUser: false }]);
    }, 1000); // 1秒延时模拟后端响应
  };

  const handleUpload = () => {
    console.log('Upload clicked');
  };

  const updateVh = () => {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--doc-height', `${vh}px`);
  };

  useEffect(() => {
    updateVh();
    window.addEventListener('resize', updateVh);
    return () => window.removeEventListener('resize', updateVh);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const handlePopupClick = (event, item, menuRef, selectedItemRef) => {
    event.preventDefault();
    selectedItemRef.current = item;
    menuRef.current.toggle(event);
  };

  const handleOptionClick = () => {
    console.log('Option clicked');
  };

  const stopPropagation = (e) => {
    e.stopPropagation();
  };

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

  return (
    <div className="chat-container">
      <Sidebar
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
          </div>
        </div>
        <div className="messages">
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg.text} isUser={msg.isUser} showBubble={showBubble}/>
          ))}
        </div>
        <div className="input-box-container">
          <InputBox onSend={handleSend} onUpload={handleUpload}/>
        </div>
      </div>
    </div>
  );
};

export default Chat;
