import React from 'react';
import './App.css';
import AdmissionForm from './AdmissionForm';
import ManagerPage from './ManagerPage'; // Import the ManagerPage component
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/admission-form" element={<AdmissionForm />} />
            <Route path="/manager-page" element={<ManagerPage />} /> {/* Add the route for the manager page */}
            {/* other routes */}
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;
