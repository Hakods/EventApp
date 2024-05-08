import React, { useState } from 'react';
import Navbar from './Navbar';
import './Home.css';

const Home = () => {
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState('');
    const [eventDescription, setEventDescription] = useState('');

    const handleEventCreation = async () => {

        if (!eventName || !eventDate || !eventLocation || !eventDescription) {
            alert('Tüm etkinlik detaylarını doldurunuz.');
            // Kullanıcıya bir hata mesajı göstermek için istediğiniz bir yöntemi kullanabilirsiniz
            return;
        }



        try {
            const response = await fetch('http://localhost:8000/home', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    eventName,
                    eventDate,
                    eventLocation,
                    eventDescription,
                }),
            });

            if (response.ok) {
                const savedEvent = await response.json(); // savedEvent'i tanımlayın
                console.log('Etkinlik başarıyla kaydedildi:', savedEvent);
                setEventName('');
                setEventDate('');
                setEventLocation('');
                setEventDescription('');
                // Başarılı durumda response göndermek
                // Örneğin, kullanıcıya bir bildirim gösterebilir veya yönlendirme yapabilirsiniz
                // veya işlemin başarılı olduğunu göstermek için bir state güncelleyebilirsiniz
            } else {
                const errorData = await response.json(); // errorData'yı tanımlayın
                console.error('Etkinlik kaydederken bir hata oluştu:', errorData);
                // Hata durumunda response göndermek
                // Örneğin, kullanıcıya bir hata mesajı gösterebilir veya işlem başarısız olduğunu belirtmek için bir state güncelleyebilirsiniz
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
