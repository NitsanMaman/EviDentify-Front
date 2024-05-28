import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import AdmissionForm from './AdmissionForm';
import ManagerPage from './ManagerPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admission-form" element={<AdmissionForm />} />
            <Route path="/manager-page" element={<ManagerPage />} />
            {/* other routes */}
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
