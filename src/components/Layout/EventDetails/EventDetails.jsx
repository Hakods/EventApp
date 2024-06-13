import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import './EventDetails.css';
import { useParams } from 'react-router-dom';

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await fetch(`http://localhost:8000/events/${id}`);
                if (response.ok) {
                    const eventData = await response.json();
                    setEvent(eventData);
                } else {
                    console.error('Etkinlik detaylarını getirirken bir hata oluştu');
                    setError('Etkinlik detaylarını getirirken bir hata oluştu');
                }
            } catch (error) {
                console.error('Sunucu ile iletişimde bir hata oluştu:', error);
                setError('Sunucu ile iletişimde bir hata oluştu');
            }
        };

        fetchEventDetails();
    }, [id]);

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!event) {
        return <div className="loading">Yükleniyor...</div>;
    }

    return (
        <div>
            <Navbar/>
        <div className="event-details-container">
            <h2>{event.eventName}</h2>
            <p><strong>Tarih:</strong> {new Date(event.eventDate).toLocaleDateString('tr-TR')}</p>
            <p><strong>Yer:</strong> {event.eventLocation}</p>
            <p><strong>Açıklama:</strong> {event.eventDescription}</p>
            <p><strong>Katılımcılar:</strong></p>
            {event.participants.length > 0 ? (
                <ul>
                    {event.participants.map(participant => (
                        <li key={participant._id}>{participant.username}</li>
                    ))}
                </ul>
            ) : (
                <p>Henüz katılımcı yok.</p>
            )}
        </div>
        </div>
    );
};

export default EventDetails;