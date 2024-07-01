import React from 'react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Tree } from 'primereact/tree';
import { Parser } from '@json2csv/plainjs';
import './css/ChatMessage.css';
import BpmnRender from "./BpmnRender";

const flattenTreeData = (node, parentKey = '') => {
  const rows = [];
  const currentKey = parentKey ? `${parentKey} > ${node.label}` : node.label;

  rows.push({ key: node.key, label: currentKey });

  if (node.children) {
    node.children.forEach(child => {
      rows.push(...flattenTreeData(child, currentKey));
    });
  }
  return rows;
};

const ChatMessage = ({ message, isUser, isLoading, showBubble }) => {

  const handleDownloadCsv = () => {
    try {
      const flattenedData = flattenTreeData(message.content);
      const fields = ['key', 'label'];
      const parser = new Parser({ fields });
      const csv = parser.parse(flattenedData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error converting JSON to CSV:', error);
    }
  };

  const renderMessageContent = () => {
    if (isLoading) {
      return <div className="message loading-message"><i className="pi pi-spinner pi-spin"></i></div>;
    }
    switch (message.type) {
      case 'capabilityMap':
        return (
          <div className="message"><Tree value={[message.content]}/>
            <Button
              icon="pi pi-download"
              onClick={handleDownloadCsv}
            />
          </div>
        );
      case 'bpmn':
        return (
          <div className="message" style={{width: '100%'}}>
            <BpmnRender bpmnXML={message.content}/>
          </div>
        );
      case 'text':
      default:
        return (
          <div className="message">
            {message.content}
          </div>
        );
    }
  };

  return (
    <div className={`message-container ${isUser ? 'user' : 'other'} ${showBubble ? 'bubble' : ''}`}>
      {!isUser && (
        <div className="message-avatar">
          <Avatar icon="pi pi-microchip-ai" shape="circle"/>
        </div>
      )}
      {renderMessageContent()}
    </div>
  );
};

export default ChatMessage;
