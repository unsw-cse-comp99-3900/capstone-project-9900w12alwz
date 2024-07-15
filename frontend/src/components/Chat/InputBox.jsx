import React, { useState, useRef } from 'react';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { FileUpload } from 'primereact/fileupload';
import './css/InputBox.css';

const InputBox = ({ onSend }) => {
  const [message, setMessage] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const fileUploadRef = useRef(null);

  const handleSendClick = () => {
    const trimmedMessage = message.trim();
    const messagesToSend = [];

    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        const fileMessage = {
          content: trimmedMessage, // Text content (optional)
          file: {
            name: file.name,
            size: file.size,
            type: file.type,
          },
          isUser: true,
          type: trimmedMessage ? 'fileWithText' : 'file',
        };
        messagesToSend.push(fileMessage);
      });
    } else if (trimmedMessage) {
      const textMessage = {
        content: trimmedMessage,
        isUser: true,
        type: 'text',
      };
      messagesToSend.push(textMessage);
    }

    if (messagesToSend.length > 0) {
      onSend?.(messagesToSend, uploadedFiles);
      resetInput();
    }
  };

  const resetInput = () => {
    setMessage('');
    setUploadedFiles([]);
    document.getElementById('messageInput').style.height = '35px';
  };

  const handleUpload = (e) => {
    const files = e.files;
    setUploadedFiles(files);
    fileUploadRef.current.clear();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  const handleDeleteFile = (index) => {
    setUploadedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="input-box-container">
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="file-item">
              <div className="file-list-file-name" title={file.name}>
                {file.name}
              </div>
              <Button
                icon="pi pi-times"
                className="p-button-text p-button-danger file-list-remove-item-btn"
                onClick={() => handleDeleteFile(index)}
              />
            </div>
          ))}
        </div>
      )}
      <div className="input-box">
        <FileUpload
          ref={fileUploadRef}
          mode="basic"
          name="files[]"
          accept="*"
          customUpload
          chooseLabel=""
          chooseOptions={{ icon: 'pi pi-paperclip', className: 'p-button-rounded p-button-text upload-btn' }}
          onSelect={handleUpload}
          auto
        />
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
        <Button
          icon="pi pi-send"
          className="p-button-rounded p-button-text send-btn"
          onClick={handleSendClick}
          disabled={message.trim() === '' && uploadedFiles.length === 0}
        />
      </div>
    </div>
  );
};

export default InputBox;
