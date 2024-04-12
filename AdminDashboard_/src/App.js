// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ParticipantsManagement from './components/ParticipantsManagement';
import OrganizersManagement from './components/OrganizersMgmt';
import AddNewEvent from './components/AddNewEvent';
import EventsManagement from './components/EventsMgmt';
import AddOrganizerForm from './components/AddOrganize';
import Login from './components/Login';
import Home from './components/Home';
import Settings from './components/Settings'
import './style/dashboard.css'
// src/App.js

const App = () => {
  return (

    <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Home" element={<Home />} />
            <Route path="/participants-management/:adminID" element={<ParticipantsManagement />} />
            <Route path="/add-new-event/:adminID" element={<AddNewEvent />} />
            <Route path="/Organizer-management/:adminID" element={<OrganizersManagement />} />
            <Route path="/Events-management/:adminID" element={<EventsManagement />} />
            <Route path="/add-new-Org/:adminID" element={<AddOrganizerForm />} />
            <Route path="/Settings/:adminID" element={<Settings />} />
          </Routes>
    </Router>
  );
}

export default App;