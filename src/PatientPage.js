import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './App.css';

const PatientPage = () => {
  const [authStep, setAuthStep] = useState('login'); // 'login', 'otp', 'register', 'dashboard'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [patientDetails, setPatientDetails] = useState({ 
    name: '', 
    age: '', 
    place: '',
    phone: '' 
  });
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const navigate = useNavigate();

  // Generate random OTP
  const generateOtp = () => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    alert(`Your OTP is ${otp}`); // In real app, send via SMS service
    return otp;
  };

  // Handle login (send OTP)
  const handleLogin = (e) => {
    e.preventDefault();
    if (!phone) {
      alert('Please enter your phone number');
      return;
    }
    generateOtp();
    setAuthStep('otp');
  };

  // Verify OTP
  const verifyOtp = (e) => {
    e.preventDefault();
    if (otp === generatedOtp) {
      // Check if patient exists
      const patients = JSON.parse(localStorage.getItem('patients')) || [];
      const existingPatient = patients.find(p => p.phone === phone);
      
      if (existingPatient) {
        setPatientDetails(existingPatient);
        setAuthStep('dashboard');
      } else {
        setPatientDetails(prev => ({ ...prev, phone }));
        setAuthStep('register');
      }
    } else {
      alert('Invalid OTP');
    }
  };

  // Handle new patient registration
  const handleRegister = (e) => {
    e.preventDefault();
    if (!patientDetails.name || !patientDetails.age || !patientDetails.place) {
      alert('Please fill all fields');
      return;
    }
    
    const patients = JSON.parse(localStorage.getItem('patients')) || [];
    patients.push(patientDetails);
    localStorage.setItem('patients', JSON.stringify(patients));
    setAuthStep('dashboard');
  };

  // Appointment booking functions (from your original code)
  useEffect(() => {
    if (authStep === 'dashboard') {
      const storedSlots = JSON.parse(localStorage.getItem('slots')) || [];
      const filteredSlots = storedSlots.filter((slot) => 
        slot.date === selectedDate.toISOString().split('T')[0] && !slot.patient
      );
      setAvailableSlots(filteredSlots);
    }
  }, [selectedDate, authStep]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails({ ...patientDetails, [name]: value });
  };

  const handleBookSlot = () => {
    if (selectedSlot && patientDetails.name) {
      const updatedSlots = availableSlots.map((slot) =>
        slot.id === selectedSlot.id ? { ...slot, patient: patientDetails.name } : slot
      );
      localStorage.setItem('slots', JSON.stringify(updatedSlots));

      const appointment = { 
        ...patientDetails, 
        bookedSlot: selectedSlot.time, 
        date: selectedDate.toISOString().split('T')[0] 
      };
      const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
      appointments.push(appointment);
      localStorage.setItem('appointments', JSON.stringify(appointments));

      alert('Appointment booked successfully!');
      setSelectedSlot(null);
    } else {
      alert('Please select a time slot!');
    }
  };

  // Render different screens based on authStep
  switch (authStep) {
    case 'login':
      return (
        <div className="container auth-container">
          <h1>Patient Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="tel"
              placeholder="Enter Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="form-input"
              required
            />
            <button type="submit" className="btn btn-primary">
              Send OTP
            </button>
            <p className="auth-switch">
              New patient? <span onClick={() => setAuthStep('register')}>Register here</span>
            </p>
          </form>
        </div>
      );

    case 'otp':
      return (
        <div className="container auth-container">
          <h1>Verify OTP</h1>
          <form onSubmit={verifyOtp}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="form-input"
              required
            />
            <button type="submit" className="btn btn-primary">
              Verify
            </button>
            <p className="auth-switch">
              Didn't receive OTP? <span onClick={generateOtp}>Resend</span>
            </p>
          </form>
        </div>
      );

    case 'register':
      return (
        <div className="container auth-container">
          <h1>Patient Registration</h1>
          <form onSubmit={handleRegister}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={patientDetails.name}
              onChange={handleInputChange}
              className="form-input"
              required
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={patientDetails.age}
              onChange={handleInputChange}
              className="form-input"
              required
            />
            <input
              type="text"
              name="place"
              placeholder="City"
              value={patientDetails.place}
              onChange={handleInputChange}
              className="form-input"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={patientDetails.phone || phone}
              disabled
              className="form-input"
            />
            <button type="submit" className="btn btn-primary">
              Complete Registration
            </button>
          </form>
        </div>
      );

    case 'dashboard':
      return (
        <div className="container patient-container">
          <div className="patient-header">
            <h1>Welcome, {patientDetails.name}</h1>
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setAuthStep('login');
                setPhone('');
                setOtp('');
              }}
            >
              Logout
            </button>
          </div>

          <div className="calendar-container">
            <h3>Select Appointment Date</h3>
            <Calendar 
              onChange={handleDateChange} 
              value={selectedDate} 
              minDate={new Date()} 
            />
          </div>
          
          <div className="available-slots">
            <h3>Available Slots</h3>
            {availableSlots.length > 0 ? (
              <ul className="data-list">
                {availableSlots.map((slot) => (
                  <li 
                    key={slot.id} 
                    onClick={() => setSelectedSlot(slot)}
                    className={`slot-item ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                  >
                    <strong>{slot.time}</strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No available slots for this date.</p>
            )}
          </div>

          {selectedSlot && (
            <div className="book-slot-container">
              <button className="btn btn-primary" onClick={handleBookSlot}>
                Book Slot: {selectedSlot.time}
              </button>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};

export default PatientPage;