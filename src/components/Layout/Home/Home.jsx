import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './Home.css';

const Home = () => {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [maxParticipants, setMaxParticipants] = useState(0); // Maksimum katılımcı sayısı için state

    const handleEventCreation = async () => {
        // Tarih geçmiş mi kontrolü
        const today = new Date().toISOString().split('T')[0];
        if (eventDate < today) {
            alert('Geçmiş tarihli bir etkinlik oluşturamazsınız.');
            return;
        }

        if (!eventName || !eventDate || !eventLocation || !eventDescription || maxParticipants <= 0) {
            alert('Tüm etkinlik detaylarını ve maksimum katılımcı sayısını doldurunuz.');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/home', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Local storage'dan token'i al
                },
                body: JSON.stringify({
                    eventName,
                    eventDate,
                    eventLocation,
                    eventDescription,
                    maxParticipants // Maksimum katılımcı sayısını gönder
                }),
            });

            if (response.ok) {
                const savedEvent = await response.json();
                console.log('Etkinlik başarıyla kaydedildi:', savedEvent);
                setEventName('');
                setEventDate('');
                setEventLocation('');
                setEventDescription('');
                setMaxParticipants(0); // Maksimum katılımcı sayısını sıfırla
                // Başarılı durumda response göndermek
            } else {
                const errorData = await response.json();
                console.error('Etkinlik kaydederken bir hata oluştu:', errorData);
                // Hata durumunda response göndermek
            }
        } catch (error) {
            console.error('Sunucu hatası:', error);
        }
    };

    return (
        <div className="BigHome">
            <Navbar />
            <div className="home">
                <div className="container">
                    <h2>Etkinlik Oluştur</h2>
                    <div>
                        <label>Etkinlik Adı:</label>
                        <input type="text" value={eventName} onChange={(e) => setEventName(e.target.value)} />
                    </div>
                    <div>
                        <label>Etkinlik Tarihi:</label>
                        <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
                    </div>
                    <div>
                        <label>Etkinlik Yeri:</label>
                        <input type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)} />
                    </div>
                    <div>
                        <label>Etkinlik Açıklaması:</label>
                        <textarea value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
                    </div>
                    <div>
                        <label>Maksimum Katılımcı Sayısı:</label>
                        <input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(parseInt(e.target.value))} />
                    </div>
                    <button onClick={handleEventCreation}>Etkinlik Oluştur</button>
                </div>
            </div>
        </div>
    );
};

export default Home;
