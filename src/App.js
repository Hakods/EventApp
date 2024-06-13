import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register/Register';
import Login from './components/Login/Login';
import Home from './components/Layout/Home/Home';
import Events from './components/Layout/Events/Events';
import Profile from './components/Layout/Profile/Profile';
import EventDetails from './components/Layout/EventDetails/EventDetails';


function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/register" element={<Register/>} />
        <Route exact path="/login" element={<Login/>} />
        <Route exact path="/home" element={<Home/>} />
        <Route exact path="/events" element={<Events/>} />
        <Route exact path="/profile" element={<Profile/>} />
        <Route path="/event/:id" element={<EventDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
