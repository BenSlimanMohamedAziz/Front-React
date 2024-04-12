// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import OrganizerInfo from './components/OrganizerInfo';
import Login from './components/Login';
import OrganizerEvents from './components/OrganizerEvents';
import EventParticipants from './components/OrganizerParticipants';
import OrganizerProfile from './components/OrganizerProfile';
import AddNewEvent from './components/AddNewEvent';
import Register from './components/Register';
import './style/dashboard.css';

// src/App.js

const App = () => {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path='/Login' element={<Login />}></Route>
        <Route path='/Register' element={<Register />}></Route>
        <Route path='/Home' element={<OrganizerInfo />}></Route>
        <Route path="/Events-management/:organizerID/:organizerName/*" element={<OrganizerEvents />} />
        <Route path="/Participants-management/:organizerID/:organizerName/*" element={<EventParticipants />} />
        <Route path="/Organizer-settings/:organizerID/:organizerName/*" element={<OrganizerProfile />} />
        <Route path="/Add-Events/:organizerID/:organizerName/*" element={<AddNewEvent />} />
      </Routes>

    </Router>
  );
}

export default App;