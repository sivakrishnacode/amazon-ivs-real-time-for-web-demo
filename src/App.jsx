import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import DemoList from './pages/DemoList.jsx';
import DemoView from './pages/DemoView.jsx';
import Settings from './pages/Settings.jsx';

export default function App() {
  return (
    <Router>
      <div className="app-container" style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/demos" element={<DemoList />} />
          <Route path="/demos/:id" element={<DemoView />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}
