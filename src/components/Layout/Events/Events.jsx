import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './Events.css';
import { useNavigate } from 'react-router-dom';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return date.toLocaleDateString('tr-TR', options);
    };

    useEffect(() => {
        const fetchUserAndEvents = async () => {
            await fetchUser();
            await fetchEvents();
        };

        fetchUserAndEvents();
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
                fetchEvents();
            } else {
                console.error('Etkinliğe katılma işleminde bir hata oluştu');
            }
        } catch (error) {
            console.error('Sunucu ile iletişimde bir hata oluştu:', error);
        }
    };

    const handleLeaveEvent = async (eventId) => {
        const confirm = window.confirm('Etkinlikten çıkmak istediğinizden emin misiniz?');
        if (!confirm) return;

        try {
            const response = await fetch(`http://localhost:8000/events/${eventId}/leave`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const updatedEvents = events.map(event => {
                    if (event._id === eventId) {
                        const updatedParticipants = event.participants.filter(participant => participant._id !== user._id);
                        return { ...event, participants: updatedParticipants };
                    }
                    return event;
                });
                setEvents(updatedEvents);
            } else {
                console.error('Etkinlikten çıkma işleminde bir hata oluştu');
            }
        } catch (error) {
            console.error('Sunucu ile iletişimde bir hata oluştu:', error);
        }
    };

    const handleRemoveParticipant = async (eventId, userId, username) => {
        const reason = prompt(`"${username}" kullanıcısını etkinlikten çıkarmak istediğinizin sebebini yazınız:`);
        if (!reason) return;

        const confirm = window.confirm(`"${username}" kullanıcısını etkinlikten "${reason}" sebebi yüzünden çıkarmak istediğinizden emin misiniz?`);
        if (!confirm) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:8000/events/${eventId}/remove-participant/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                sendNotificationEmail(username, reason);
                fetchEvents();
            } else {
                console.error('Katılımcıyı etkinlikten çıkarma işleminde bir hata oluştu');
            }
        } catch (error) {
            console.error('Katılımcıyı etkinlikten çıkarırken bir hata oluştu:', error);
        }
    };

    const sendNotificationEmail = async (username, reason) => {
        try {
            const response = await fetch('http://localhost:8000/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    recipient: user.email,
                    subject: 'Etkinlikten Atıldınız',
                    message: `Merhaba ${username},\n\nEtkinlikten şu nedenle atıldınız: ${reason}\n\nEtkinlik Yönetimi`
                })
            });
            if (response.ok) {
                console.log('Bildirim e-postası gönderildi');
            } else {
                console.error('Bildirim e-postası gönderilirken bir hata oluştu');
            }
        } catch (error) {
            console.error('E-posta gönderirken bir hata oluştu:', error);
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
                                                    className="remove-participant-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveParticipant(event._id, participant._id, participant.username);
                                                    }}
                                                >
                                                    &#10005;
                                                </button>
                                            )}
                                            {event.createdBy && event.createdBy._id !== user?._id && (
                                                <span style={{ marginLeft: '8px', fontSize: '0.8em', color: '#888' }}>
                                                    {participant._id === user?._id && '(Ben)'}
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Henüz katılımcı yok.</p>
                            )}
                            {user && (
                                <div className="button-container">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleJoinEvent(event._id, event.createdBy ? event.createdBy._id : null);
                                        }}
                                        disabled={event.participants.length >= event.maxParticipants || (user && event.createdBy && event.createdBy._id === user._id)}
                                    >
                                        Katıl
                                    </button>
                                    {event.participants.find(participant => participant._id === user._id) && (
                                        <button
                                            className="leave-event-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLeaveEvent(event._id);
                                            }}
                                        >
                                            Etkinlikten Çık
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Events;
