import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import './Events.css';

const Events = () => {
    const [events, setEvents] = useState([]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return date.toLocaleDateString('tr-TR', options);
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

    const handleJoinEvent = async (eventId) => {
        try {
            const response = await fetch(`http://localhost:8000/events/${eventId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({})
            });
            if (response.ok) {
                const updatedEvents = events.map(event => {
                    if (event._id === eventId) {
                        return { ...event, participants: [...event.participants, 'newParticipantId'] };
                    }
                    return event;
                });
                setEvents(updatedEvents);
            } else {
                console.error('Etkinliğe katılma işleminde bir hata oluştu');
            }
        } catch (error) {
            console.error('Sunucu ile iletişimde bir hata oluştu:', error);
        }
    };

    
    
    
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
                            <button
                                onClick={() => handleJoinEvent(event._id)}
                                disabled={event.participants.length >= event.maxParticipants}
                            >
                                {event.participants.length >= event.maxParticipants ? 'Etkinlik Dolu' : 'Katıl'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Events;
