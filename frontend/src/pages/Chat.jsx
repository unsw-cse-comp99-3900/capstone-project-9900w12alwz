import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './Chat.css';
import Sidebar from '../components/Chat/Sidebar';
import ThemeSwitcher from "../components/ThemeSwitcher";
import ChatMessage from "../components/Chat/ChatMessage";
import InputBox from "../components/Chat/InputBox";
import { post } from '../api';

const Chat = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth >= 600);
  const [showBubble, setShowBubble] = useState(true);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem('chatMessages') || '[]');
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Convert raw data to tree data
  const convertToTreeData = (obj, parentKey = '', level = 1) => {
    const result = [];

    Object.keys(obj).forEach((key, index) => {
      const uniqueKey = parentKey ? `${parentKey}.${index}` : `${index}`;
      const label = `${key}`;

      let children = [];
      if (Array.isArray(obj[key])) {
        children = obj[key].map((item, i) => ({
          key: `${uniqueKey}.${i}`,
          label: item,
          children: null
        }));
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        children = convertToTreeData(obj[key], uniqueKey, level + 1);
      }

      const node = {
        key: uniqueKey,
        label: label,
        children: children.length ? children : null
      };
      result.push(node);
    });

    return result;
  };

  const addMessage = useCallback((message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  }, []);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const handleSend = useCallback(debounce(async (messagesToSend, uploadedFiles) => {
    messagesToSend.forEach(message => addMessage(message));

    const textMessages = messagesToSend
      .filter(message => ['text', 'fileWithText'].includes(message.type))
      .map(message => message.content)
      .join(' ');

    const formData = new FormData();
    formData.append('question', textMessages);
    uploadedFiles.forEach((file) => {
      formData.append(`image`, file);
    });

    setIsLoading(true);

    try {
      const response = await post('/chat/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { answer, type } = response.data.answer;

      if (type === 'capabilityMap') {
        const jsonString = answer.match(/```JSON\s+({[\s\S]*?})\s+```/)[1];
        const capabilityMap = JSON.parse(jsonString);
        const treeData = convertToTreeData(capabilityMap);
        addMessage({ content: treeData, isUser: false, type: 'capabilityMap' });
      } else if (type === 'image') {
        const [preContent, bpmnMatch, tailContent] = answer.split('```');
        addMessage({
          preContent: preContent.trim(),
          tailContent: tailContent?.trim(),
          bpmn: bpmnMatch?.split('\n').slice(1, -1).join('\n').trim(),
          isUser: false,
          type: 'bpmnWithPreText'
        });
      } else {
        addMessage({ content: answer, isUser: false });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300), [addMessage, convertToTreeData]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    const updateVh = () => {
      document.documentElement.style.setProperty('--doc-height', `${window.innerHeight}px`);
    };
    updateVh();
    window.addEventListener('resize', updateVh);

    const handleResize = () => {
      if (window.innerWidth < 600 && isSidebarVisible) {
        setIsSidebarVisible(false);
      } else if (window.innerWidth >= 600 && !isSidebarVisible) {
        setIsSidebarVisible(true);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', updateVh);
      window.removeEventListener('resize', handleResize);
    };
  }, [messages, isSidebarVisible]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarVisible(prev => !prev);
  }, []);

  const handlePopupClick = useCallback((event, item, menuRef, selectedItemRef) => {
    event.preventDefault();
    selectedItemRef.current = item;
    menuRef.current.toggle(event);
  }, []);

  const handleOptionClick = useCallback((item) => {
    setSidebarItems(prevItems => prevItems.filter(i => i.id !== item.id));
  }, []);

  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
  }, []);

  const resetConversation = useCallback(() => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  }, []);

  const goToAdmin = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  return (
    <div className="chat-container">
      <div className={`main-content ${isSidebarVisible ? 'with-sidebar' : ''}`}>
        <div className={`main-content-header ${!isSidebarVisible ? 'collapsed' : ''}`}>
        </div>
        <div className="main-tool-bar">
          <div className={`main-tool-bar-misc`}>
            <Button icon="pi pi-pen-to-square" className="new-chat-btn" onClick={resetConversation}/>
            <ThemeSwitcher/>
            <Button icon="pi pi-cog" onClick={goToAdmin} className="p-button-icon-only navigation-to-admin"/>
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
              <ChatMessage key={index} message={msg} isUser={msg.isUser} showBubble={showBubble}/>
            ))
          )}
          {isLoading && (
            <ChatMessage key="loading" message="Loading..." isUser={false} isLoading={true} showBubble={showBubble}/>
          )}
          <div ref={messagesEndRef}/>
        </div>
        <div className="input-box-container">
          <InputBox onSend={handleSend}/>
        </div>
      </div>
    </div>
  );
};

export default Chat;