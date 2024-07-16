import React, { useEffect, useState } from 'react';
import './css/LoadingMessage.css';

const loadingTexts = [
  "Analyzing...",
  "Reading your message...",
  "Generating response...",
  "Processing data..."
];

const LoadingMessage = () => {
  const [currentText, setCurrentText] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentText((prevText) => (prevText + 1) % loadingTexts.length);
        setIsFading(false);
      }, 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`loading-message ${isFading ? 'fading' : ''}`}>
      <span>{loadingTexts[currentText]}</span>
    </div>
  );
};

export default LoadingMessage;
