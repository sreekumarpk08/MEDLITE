import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import DoctorPage from './DoctorPage'; // No curly braces for default export

import PatientPage from './PatientPage';
import MedicineStorePage from './MedicineStorePage';
import './App.css';

// Add an Error Boundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="error">Component failed to load. Please check the console.</div>;
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <Link to="/doctor" className="nav-link">Doctor's Dashboard</Link>
          <Link to="/patient" className="nav-link">Patient's Dashboard</Link>
          <Link to="/medicine" className="nav-link">Medicine Store Dashboard</Link>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={
              <div className="container">
                <h1>Welcome to Medlite Hospital Portal</h1>
                <p>Select a dashboard:</p>
              </div>
            } />
            <Route path="/doctor" element={
              <ErrorBoundary>
                <DoctorPage />
              </ErrorBoundary>
            } />
            <Route path="/patient" element={
              <ErrorBoundary>
                <PatientPage />
              </ErrorBoundary>
            } />
            <Route path="/medicine" element={
              <ErrorBoundary>
                <MedicineStorePage />
              </ErrorBoundary>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;