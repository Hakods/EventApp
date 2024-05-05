import React from 'react';
import Navbar from './Navbar'; // Navbar bileşeninin yolunu düzeltin
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <Navbar />
      <div className="container">
        <h1>Yeni Etkinlik Oluştur</h1>
        <form>
          <div className="form-group">
            <label>Etkinlik Adı:</label>
            <input type="text" name="eventName" />
          </div>
          <div className="form-group">
            <label>Etkinlik Tarihi:</label>
            <input type="date" name="eventDate" />
          </div>
          <div className="form-group">
            <label>Etkinlik Yeri:</label>
            <input type="text" name="eventLocation" />
          </div>
          <div className="form-group">
            <label>Etkinlik Detayları:</label>
            <input type="text" name="eventDetails" />
          </div>
          <button type="submit">Etkinlik Oluştur</button>
        </form>
      </div>
    </div>
  );
};

export default Home;