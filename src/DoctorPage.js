import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './DoctorPage.css'; // Make sure this file exists or remove this line

const DoctorPage = () => {
  // Authentication states
  const [authStep, setAuthStep] = useState('login'); // 'login', 'otp', 'register', 'dashboard'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    license: '',
    specialization: '',
    hospital: ''
  });

  // Generate OTP
  const generateOtp = () => {
    const otp = Math.floor(1000 + Math.random() * 9000);
    setGeneratedOtp(otp.toString());
    alert(`Your OTP is ${otp}`); // In production, replace with actual SMS service
    return otp;
  };

  // Handle login (send OTP)
  const handleLogin = (e) => {
    e.preventDefault();
    if (!phone) return alert('Please enter phone number');
    generateOtp();
    setAuthStep('otp');
  };

  // Verify OTP
  const verifyOtp = (e) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      const doctors = JSON.parse(localStorage.getItem('doctors')) || [];
      const existingDoctor = doctors.find(d => d.phone === phone);
      
      if (existingDoctor) {
        setCurrentDoctor(existingDoctor);
        setAuthStep('dashboard');
      } else {
        setAuthStep('register');
      }
    } else {
      alert('Invalid OTP');
    }
  };

  // Handle registration
  const handleRegister = (e) => {
    e.preventDefault();
    if (!newDoctor.name || !newDoctor.license) {
      return alert('Please fill all required fields');
    }

    const doctor = {
      phone,
      ...newDoctor,
      id: Date.now()
    };
    
    const doctors = JSON.parse(localStorage.getItem('doctors')) || [];
    doctors.push(doctor);
    localStorage.setItem('doctors', JSON.stringify(doctors));
    
    setCurrentDoctor(doctor);
    setAuthStep('dashboard');
  };

  // Render authentication screens
  if (!currentDoctor) {
    return (
      <div className="auth-container">
        {authStep === 'login' && (
          <div className="auth-form">
            <h2>Doctor Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <button type="submit">Send OTP</button>
              <p className="auth-note">
                New doctor? <span onClick={() => setAuthStep('register')}>Register directly</span>
              </p>
            </form>
          </div>
        )}

        {authStep === 'otp' && (
          <div className="auth-form">
            <h2>Enter OTP</h2>
            <form onSubmit={verifyOtp}>
              <input
                type="text"
                placeholder="OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <button type="submit">Verify OTP</button>
              <p className="auth-note">
                Didn't receive OTP? <span onClick={generateOtp}>Resend</span>
              </p>
            </form>
          </div>
        )}

        {authStep === 'register' && (
          <div className="auth-form">
            <h2>Doctor Registration</h2>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Full Name*"
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({...newDoctor, name: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Medical License Number*"
                value={newDoctor.license}
                onChange={(e) => setNewDoctor({...newDoctor, license: e.target.value})}
                required
              />
              <input
                type="text"
                placeholder="Specialization"
                value={newDoctor.specialization}
                onChange={(e) => setNewDoctor({...newDoctor, specialization: e.target.value})}
              />
              <input
                type="text"
                placeholder="Hospital/Clinic"
                value={newDoctor.hospital}
                onChange={(e) => setNewDoctor({...newDoctor, hospital: e.target.value})}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                readOnly
              />
              <button type="submit">Complete Registration</button>
              <p className="auth-note">
                Already registered? <span onClick={() => setAuthStep('login')}>Login instead</span>
              </p>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="doctor-dashboard">
      <header>
        <h1>Dr. {currentDoctor.name}'s Dashboard</h1>
        <div className="doctor-info">
          <p>License: {currentDoctor.license}</p>
          {currentDoctor.specialization && <p>Specialization: {currentDoctor.specialization}</p>}
          {currentDoctor.hospital && <p>Hospital: {currentDoctor.hospital}</p>}
        </div>
        <button 
          className="logout-btn"
          onClick={() => {
            setCurrentDoctor(null);
            setAuthStep('login');
            setPhone('');
            setOtp('');
            setNewDoctor({
              name: '',
              license: '',
              specialization: '',
              hospital: ''
            });
          }}
        >
          Logout
        </button>
      </header>
      
      {/* Add your dashboard content here */}
      <div className="calendar-container">
        <h3>Appointment Calendar</h3>
        <Calendar />
      </div>
    </div>
  );
};

export default DoctorPage;