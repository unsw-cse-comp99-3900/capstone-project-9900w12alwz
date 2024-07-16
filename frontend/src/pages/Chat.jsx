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
  const navigate = useNavigate();

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

    // const initialMessages = [
    //
    // ];
    //
    // setTimeout(() => {
    //   setMessages(initialMessages);
    // }, 1000);

  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Convert raw data to tree data
  const convertToTreeData = (obj, parentKey = '', level = 1) => {
    const result = [];
    let currentIndex = 1;

    Object.keys(obj).forEach((key) => {
      const uniqueKey = parentKey ? `${parentKey}.${currentIndex}` : `${currentIndex}`;
      const labelWithLevel = parentKey ? `${parentKey}.${currentIndex} ${key}` : `${currentIndex} ${key}`;
      const children = convertToTreeData(obj[key], uniqueKey, level + 1);
      const node = {
        key: uniqueKey,
        label: labelWithLevel,
        children: children.length ? children : null
      };
      result.push(node);
      currentIndex += 1;
    });

    return result;
  };

  const addMessage = (message) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };

  const handleSend = async (messagesToSend, uploadedFiles) => {
    messagesToSend.forEach(message => {
      addMessage(message);
    });

    const textMessages = messagesToSend
      .filter(message => message.type === 'text' || message.type === 'fileWithText')
      .map(message => message.content)
      .join(' ');

    const formData = new FormData();
    formData.append('question', textMessages);
    uploadedFiles.forEach((file, index) => {
      formData.append(`image`, file);
    });

    setIsLoading(true);

    try {
      const response = await post('/chat/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const data = response.data.answer;
      if (data && data.answer) {
        const { answer, type } = data;

        if (type === 'capabilityMap') {
          const jsonString = answer.match(/```JSON\s+({[\s\S]*?})\s+```/)[1];
          const capabilityMap = JSON.parse(jsonString);
          // const csvString = answer.match(/CSV: (.*)$/s)[1].trim();
          const treeData = convertToTreeData(capabilityMap);
          addMessage({ content: treeData, isUser: false, type: 'capabilityMap' });
        } else if (type === 'image') {
          const preContent = answer.split('```xml')[0].trim();
          const bpmnMatch = answer.match(/```xml([\s\S]*?)```/);
          const bpmnPart = bpmnMatch ? bpmnMatch[1].trim() : '';
          const tailContent = answer.split('```')[2]?.trim();
          addMessage({
            preContent: preContent,
            tailContent: tailContent,
            bpmn: bpmnPart,
            isUser: false,
            type: 'bpmnWithPreText'
          });
        } else {
          addMessage({ content: answer, isUser: false });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Used to calculate and update the window height on the mobile device
  const updateVh = () => {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty('--doc-height', `${vh}px`);
  };

  useEffect(() => {
    updateVh();
    window.addEventListener('resize', updateVh);
    return () => window.removeEventListener('resize', updateVh);
  }, []);

  // Sidebar
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

  // Controls showing or hiding the sidebar according to the screen width.
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

  // Clear the conversation data (only frontend)
  const resetConversation = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
  };

  // Used to navigate to Admin page
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
          <InputBox onSend={handleSend}/>
        </div>
      </div>
    </div>
  );
};

export default Chat;
