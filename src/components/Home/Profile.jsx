import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';
import "./Profile.css"

const Profile = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch('http://localhost:8000/user-profile');
            if (response.ok) {
                const userData = await response.json();
                setUserData(userData);
            } else {
                console.error('Kullanıcı bilgilerini getirirken bir hata oluştu');
            }
        } catch (error) {
            console.error('Sunucu ile iletişimde bir hata oluştu:', error);
        }
    };

    return (
        <div>
            <Navbar />
            <div className="profile-container">
                <h2>Profil</h2>
                {userData && (
                    <div className="user-info">
                        <p><strong>Kullanıcı Adı:</strong> {userData.username}</p>
                        <p><strong>E-posta:</strong> {userData.email}</p>
                        <p><strong>Cinsiyet:</strong> {userData.gender}</p>
                        {/* Diğer kullanıcı bilgilerini buraya ekleyebilirsiniz */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;

