import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import './Events.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null); // Kullanıcı bilgilerini saklamak için state

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return date.toLocaleDateString('tr-TR', options);
    };

    useEffect(() => {
        fetchEvents();
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch('http://localhost:8000/user-profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                localStorage.setItem('userId', userData._id); // userId'yi localStorage'a kaydediyoruz
            } else {
                console.error('Kullanıcı bilgilerini getirirken bir hata oluştu');
            }
        } catch (error) {
            console.error('Sunucu ile iletişimde bir hata oluştu:', error);
        }
    };

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

    const handleJoinEvent = async (eventId, createdBy) => {
        if (!user) {
            alert('Lütfen giriş yapınız.');
            return;
        }
        if (createdBy === user._id) {
            alert('Etkinliği oluşturan kişi etkinliğe katılamaz.');
            return;
        }
        // Kullanıcının zaten katılımcı olup olmadığını kontrol et
        const event = events.find(event => event._id === eventId);
        if (event && event.participants.some(participant => participant._id === user._id)) {
            alert('Bu etkinliğe zaten katıldınız.');
            return;
        }
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
                fetchEvents(); // Etkinlikleri yeniden getir
            } else {
                console.error('Etkinliğe katılma işleminde bir hata oluştu');
            }
        } catch (error) {
            console.error('Sunucu ile iletişimde bir hata oluştu:', error);
        }
    };

    const handleRemoveParticipant = async (eventId, userId) => {
        const reason = prompt('Ne için kullanıcıyı atmak istiyorsunuz?');
        if (!reason) {
            alert('Lütfen bir neden girin.');
            return;
        }

        const confirmation = window.confirm(`Kullanıcıyı şu nedenle atmak istediğinizden emin misiniz: "${reason}"?`);
        if (!confirmation) return;


        try {
            const response = await fetch(`http://localhost:8000/events/${eventId}/remove-participant/${userId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const updatedEvents = events.map(event => {
                    if (event._id === eventId) {
                        const updatedParticipants = event.participants.filter(participant => participant._id !== userId);
                        return { ...event, participants: updatedParticipants };
                    }
                    return event;
                });
                setEvents(updatedEvents);
            } else {
                console.error('Kullanıcıyı etkinlikten çıkarırken bir hata oluştu');
            }
        } catch (error) {
            console.error('Sunucu hatası:', error);
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
                            <p><strong>Oluşturan Kişi:</strong> {event.createdBy ? event.createdBy.username : 'Bilinmiyor'}</p>
                            <p><strong>Katılımcı Sayısı:</strong> {event.participants.length} / {event.maxParticipants}</p>
                            <p><strong>Katılımcılar:</strong></p>
                            {event.participants.length > 0 ? (
                                <ul>
                                    {event.participants.map(participant => (
                                        <li key={participant._id}>
                                            {participant.username}
                                            {event.createdBy && event.createdBy._id === user?._id && (
                                                <button
                                                    className="remove-participant-btn" id='remove'
                                                    onClick={() => handleRemoveParticipant(event._id, participant._id)}
                                                >
                                                    &times;
                                                </button>
                                            )}
                                            {participant._id === user?._id && (
                                                <span style={{ marginLeft: '8px', fontSize: '0.8em', color: '#888' }}>
                                                    (Ben)
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Henüz katılımcı yok.</p>
                            )}
                            <button
                                onClick={() => handleJoinEvent(event._id, event.createdBy ? event.createdBy._id : null)}
                                disabled={event.participants.length >= event.maxParticipants || !user}
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
