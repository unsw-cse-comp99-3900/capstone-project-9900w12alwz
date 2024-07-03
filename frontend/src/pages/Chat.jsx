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
import { post } from '../api';

const Chat = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(window.innerWidth >= 600);
  const [showBubble, setShowBubble] = useState(true);
  const [sidebarItems, setSidebarItems] = useState([]);
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const treeData = {
      key: "1.Strategic Capabilities",
      label: "1.Strategic Capabilities",
      children: [
        {
          key: "1.1 Product Strategy",
          label: "1.1 Product Strategy",
          children: [
            { key: "1.1.1 Market Research", label: "1.1.1 Market Research" },
            { key: "1.1.2 Competitive Analysis", label: "1.1.2 Competitive Analysis" }
          ]
        },
        {
          key: "1.2 Business Development",
          label: "1.2 Business Development",
          children: [
            { key: "1.2.1 Partnership Management", label: "1.2.1 Partnership Management" },
            { key: "1.2.2 Customer Relationship Management", label: "1.2.2 Customer Relationship Management" }
          ]
        }
      ]
    };

    const bpmnSample = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_0jjyxz7" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="17.7.1">
  <bpmn:process id="Process_0xl4bnu" isExecutable="false">
    <bpmn:startEvent id="StartEvent_15y1osc" />
    <bpmn:endEvent id="Event_06j7amu" />
    <bpmn:endEvent id="Event_1hq6ijz" />
    <bpmn:exclusiveGateway id="Gateway_0u3gh9h" />
    <bpmn:intermediateThrowEvent id="Event_1kanrdd" />
    <bpmn:intermediateThrowEvent id="Event_1jp3mgo" />
    <bpmn:intermediateThrowEvent id="Event_1ysq5jz" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_0xl4bnu">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_15y1osc">
        <dc:Bounds x="192" y="92" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_06j7amu_di" bpmnElement="Event_06j7amu">
        <dc:Bounds x="392" y="92" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1hq6ijz_di" bpmnElement="Event_1hq6ijz">
        <dc:Bounds x="612" y="92" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_0u3gh9h_di" bpmnElement="Gateway_0u3gh9h" isMarkerVisible="true">
        <dc:Bounds x="765" y="85" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1kanrdd_di" bpmnElement="Event_1kanrdd">
        <dc:Bounds x="952" y="92" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1jp3mgo_di" bpmnElement="Event_1jp3mgo">
        <dc:Bounds x="1142" y="92" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1ysq5jz_di" bpmnElement="Event_1ysq5jz">
        <dc:Bounds x="1332" y="92" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
    `

    const initialMessages = [
      {
        content: 'Generate a capability map',
        isUser: true,
        type: 'text'
      },
      {
        content: treeData,
        isUser: false,
        type: 'capabilityMap'
      },
      {
        content: 'Generate a BPMN',
        isUser: true,
        type: 'text'
      },
      {
        content: bpmnSample,
        isUser: false,
        type: 'bpmn'
      }
    ];

    setTimeout(() => {
      setMessages(initialMessages);
    }, 1000);

    // Simulate getting the chat list
    // const initialSidebarItems = [
    //   { label: 'Item 1', id: 1 },
    //   { label: 'Item 2', id: 2 },
    //   { label: 'Item 3', id: 3 }
    // ];
    // setTimeout(() => {
    //   setSidebarItems(initialSidebarItems);
    // }, 1000);
  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const addMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  const handleSend = async (fileMessages, textMessage) => {
    if (fileMessages.length > 0) {
      fileMessages.forEach(fileMessage => {
        addMessage({ content: fileMessage, isUser: true, type: 'file' });
      });
    }
    if (textMessage) {
      addMessage({ content: textMessage, isUser: true, type: 'text' });
    }
    setIsLoading(true);

    try {
      const response = await post('/chat/', { question: textMessage });
      const data = response.data;
      if (data && data.answer) {
        addMessage({ content: data.answer, isUser: false });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = (files) => {
    console.log('Upload clicked:', files);
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

  const handleOptionClick = (item) => {
    setSidebarItems(prevItems => prevItems.filter(i => i.id !== item.id));
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

  const resetConversation = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  const navigate = useNavigate();

  const goToAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="chat-container">
      <div className={`main-content ${isSidebarVisible ? 'with-sidebar' : ''}`}>
        <div className={`main-content-header ${!isSidebarVisible ? 'collapsed' : ''}`}>
        </div>
        <div className="main-tool-bar">
          <div className={`main-tool-bar-tools ${!isSidebarVisible ? 'collapsed' : ''}`}>
            <Button icon="pi pi-pen-to-square" className="new-chat-btn" onClick={resetConversation}/>
            <ThemeSwitcher/>
          </div>
          <div className={`main-tool-bar-misc`}>
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
              <ChatMessage key={index} message={msg} isUser={msg.isUser} showBubble={showBubble}/>
            ))
          )}
          {isLoading && (
            <ChatMessage key="loading" message="Loading..." isUser={false} isLoading={true} showBubble={showBubble}/>
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
