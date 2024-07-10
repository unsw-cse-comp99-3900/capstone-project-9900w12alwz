import React, { useRef } from 'react';
import { Avatar } from 'primereact/avatar';
import { Button } from 'primereact/button';
import { Tree } from 'primereact/tree';
import { Parser } from '@json2csv/plainjs';
import { IconFileTypeSvg, IconFileTypeCsv, IconFileDescription } from '@tabler/icons-react';
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

  const bpmnRenderRef = useRef(null);

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

  const handleDownloadSvg = () => {
    if (bpmnRenderRef.current) {
      bpmnRenderRef.current.exportToImage();
    }
  };

  const getExtension = (filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop() : 'Unknown';
  };

  const renderMessageContent = () => {
    if (isLoading) {
      return <div className="message loading-message"><i className="pi pi-spinner pi-spin"></i></div>;
    }
    switch (message.type) {
      case 'capabilityMap':
        return (
          <div className="message-block" style={{ minWidth: '50%' }}>
            <div className="message"><Tree value={[message.content]} style={{ fontSize: '1rem' }}/>
            </div>
            <div className="message-tool-button-container">
              <Button
                className="p-button-rounded p-button-icon-only message-tool-button"
                onClick={handleDownloadCsv}
              >
                <IconFileTypeCsv className="message-tool-button-icon" size={20}/>
              </Button>
            </div>
          </div>
        );
      case 'bpmn':
        return (
          <div className="message-block" style={{ width: '100%' }}>
            <div className="message" style={{ width: '100%' }}>
              <BpmnRender ref={bpmnRenderRef} bpmnXML={message.content}/>
            </div>
            <div className="message-tool-button-container">
              <Button
                className="p-button-rounded p-button-icon-only message-tool-button"
                onClick={handleDownloadSvg}
              >
                <IconFileTypeSvg className="message-tool-button-icon" size={20}/>
              </Button>
            </div>
          </div>
        );
      case 'file':
      case 'fileWithText':
        const extension = getExtension(message.file.name);
        return (
          <div className="message" style={{ minWidth: '30%' }}>
            <div className="message-file-block">
              <IconFileDescription className="message-file-block-icon" size={35} />
              <div className="message-file-block-file-info">
                <div className="message-file-block-filename">
                  {message.file.name}
                </div>
                <div className="message-file-block-file-ext">
                  {extension.toUpperCase()}
                </div>
              </div>
            </div>
            {message.content && (
              <div className="message-file-block-text-content" style={{marginTop: '10px'}}>
                {message.content}
              </div>
            )}
          </div>
        );
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
