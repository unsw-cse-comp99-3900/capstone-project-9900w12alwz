import React from 'react';
import './css/MainContent.css'; // 用于样式

const MainContent = ({ isSidebarOpen }) => {
  const tasks = [
    { icon: 'pi pi-rocket', text: 'Superhero shark story' },
    { icon: 'pi pi-lightbulb', text: 'Design a fun coding game' },
    { icon: 'pi pi-graduation-cap', text: 'Overcome procrastination' },
    { icon: 'pi pi-map', text: 'Experience Seoul like a local' }
  ];

  return (
    <div className={`main-content ${isSidebarOpen ? 'with-sidebar' : ''}`}>
      <div className="header">
        <h1>ChatGPT 3.5</h1>
      </div>
      <div className="tasks">
        {tasks.map((task, index) => (
          <div className="task" key={index}>
            <i className={task.icon}></i>
            <p>{task.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainContent;
