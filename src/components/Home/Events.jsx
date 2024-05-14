import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import './Events.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [joinedEvents, setJoinedEvents] = useState([]); // Katıldığı etkinliklerin listesi

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return date.toLocaleDateString('tr-TR', options); // Türkçe tarih formatı için 'tr-TR'
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch('http://localhost:8000/events');
            if (response.ok) {
                const eventData = await response.json();
                setEvents(eventData);
            } else {
                console.error('Etkinlikleri getirirken bir hata oluştu');
            }
        } catch (error) {
            console.error('Sunucu ile iletişimde bir hata oluştu:', error);
        }
    };

    
// const fetchJoinedEvents = async () => {
//     try {
//         // Kullanıcının katıldığı etkinlikleri al
//         const response = await fetch('http://localhost:8000/user/joined-events', {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${accessToken}`
//             }
//         });
//         if (response.ok) {
//             const data = await response.json();
//             setJoinedEvents(data.joinedEvents);
//         } else {
//             console.error('Kullanıcının katıldığı etkinlikleri getirirken bir hata oluştu');
//         }
//     } catch (error) {
//         console.error('Sunucu ile iletişimde bir hata oluştu:', error);
//     }
// };

    const handleJoinEvent = async (eventId) => {
        try {
            const response = await fetch(`http://localhost:8000/events/${eventId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({}) // Kullanıcı bilgilerini göndermek gerekirse buraya ekleyebilirsiniz
            });
            if (response.ok) {
                // Etkinliklere tekrar istek yaparak güncel verileri al
                fetchEvents();
                setJoinedEvents([...joinedEvents, eventId]); // Katıldığı etkinlikleri güncelle
            } else {
                console.error('Etkinliğe katılma işleminde bir hata oluştu');
            }
        } catch (error) {
            console.error('Sunucu ile iletişimde bir hata oluştu:', error);
        }
    };

    const isJoined = (eventId) => joinedEvents.includes(eventId); // Etkinliğe katılıp katılmadığını kontrol etmek için yardımcı fonksiyon

    return (
        <div>
            <Navbar />
            <div className="event-list-container">
                <h2>Etkinlikler</h2>
                <div className="event-cards">
                    {events.map(event => (
                        <div key={event._id} className="event-card">
                            <h3>{event.eventName}</h3>
                            <p><strong>Tarih:</strong> {formatDate(event.eventDate)}</p>
                            <p><strong>Yer:</strong> {event.eventLocation}</p>
                            <p><strong>Açıklama:</strong> {event.eventDescription}</p>
                            <p><strong>Katılımcı Sayısı:</strong> {event.participants.length} / {event.maxParticipants}</p>
                            <button onClick={() => handleJoinEvent(event._id)} disabled={isJoined(event._id)}>Katıl</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Events;