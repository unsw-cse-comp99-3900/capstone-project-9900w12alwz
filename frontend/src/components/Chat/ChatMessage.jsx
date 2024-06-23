import React from 'react';
import { Avatar } from 'primereact/avatar';
import './css/ChatMessage.css';

const ChatMessage = ({ message, isUser, showBubble }) => {
  return (
    <div className={`message-container ${isUser ? 'user' : 'other'} ${showBubble ? 'bubble' : ''}`}>
      {!isUser && showBubble && (
        <Avatar icon="pi pi-microchip-ai" className="message-avatar" shape="circle"/>
      )}
      <div className="message">{message}</div>
    </div>
  );
};

export default ChatMessage;
