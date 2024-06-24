import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './App.css';
import Chat from "./pages/Chat";

const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" />} />
        {/*<Route path="/admin" element={< />} />*/}
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  )
    ;
}

export default App;