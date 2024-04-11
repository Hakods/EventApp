import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './components/Register/Register';
import Login from './components/Login/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/register" element={<Register/>} />
        <Route exact path="/login" element={<Login/>} />
      </Routes>
    </Router>
  );
}

export default App;
