import React , { useState } from 'react';
import Navbar from './Navbar'; // Navbar bileşeninin yolunu düzeltin
import './Home.css';

const Home = () => {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventDescription, setEventDescription] = useState('');

    const handleEventCreation = () => {
        // Etkinliği oluşturma işlemi burada yapılacak
        console.log('Etkinlik oluşturuldu:', {
            eventName,
            eventDate,
            eventLocation,
            eventDescription
        });
        // Verileri sıfırla
        setEventName('');
        setEventDate('');
        setEventLocation('');
        setEventDescription('');
    };
 
 
  
  return (
    <div className="BigHome">
      <Navbar/>
      <div className="home">
      <div className="container">
      <h2>Etkinlik Oluştur</h2>
            <div>
                <label> Etkinlik Adı: </label>
                <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} />
            </div>
            <div>
                <label> Etkinlik Tarihi: </label>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
            </div>
            <div>
                <label> Etkinlik Yeri: </label>
                <input type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
            </div>
            <div>
                <label> Etkinlik Açıklaması: </label>
                <textarea value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
            </div>
            <button onClick={handleEventCreation}>Etkinlik Oluştur</button>
      </div>
      </div>
    </div>
  );
};

export default Home;