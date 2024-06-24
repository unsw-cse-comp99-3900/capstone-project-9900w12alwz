import React from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import './css/InputBox.css';

const InputBox = ({ onSend, onUpload }) => {
  const [message, setMessage] = React.useState('');

  const handleSendClick = () => {
    if (message.trim() !== '') {
      if (onSend) {
        onSend(message);
      }
      setMessage('');
      const inputElement = document.getElementById('messageInput');
      if (inputElement) {
        inputElement.style.height = '35px';
      }
    }
  };

  const handleUploadClick = () => {
    if (onUpload) {
      onUpload();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="input-box">
      <Button icon="pi pi-paperclip" className="p-button-rounded p-button-text upload-btn" onClick={handleUploadClick} />
      <InputTextarea
        id="messageInput"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="message-input"
        placeholder="Type your message..."
        rows={1}
        autoResize
        onKeyDown={handleKeyDown}
      />
      <Button icon="pi pi-send"
              className="p-button-rounded p-button-text send-btn"
              onClick={handleSendClick}
              disabled={message.trim() === ''}
      />
    </div>
  );
};

export default InputBox;
