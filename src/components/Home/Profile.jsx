import React, { useEffect, useState, useCallback } from 'react';
import Navbar from './Navbar';
import "./Profile.css";

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [updatedUserData, setUpdatedUserData] = useState({
        username: '',
        email: '',
        gender: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const token = localStorage.getItem('token'); // localStorage'dan tokeni başlangıçta çek

    // Kullanıcı verilerini getiren fonksiyon
    const fetchUserData = useCallback(async () => {
        if (!token) {
            console.error('Token bulunamadı');
            return;
        }
        try {
            const response = await fetch('http://localhost:8000/user-profile', {
                headers: {
                    'Authorization': `Bearer ${token}` // İsteği yaparken JWT'yi Authorization başlığı altında gönder
                }
            });
            if (response.ok) {
                const userData = await response.json();
                setUserData(userData);
                setUpdatedUserData(userData);
            } else {
                console.error('Kullanıcı bilgilerini getirirken bir hata oluştu');
            }
        } catch (error) {
            console.error('Sunucu ile iletişimde bir hata oluştu:', error);
        }
    }, [token]);

    // Kullanıcı verilerini sayfa yüklendiğinde getir
    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    // Input alanlarında değişiklikleri yöneten fonksiyon
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    // Düzenleme moduna geçişi yöneten fonksiyon
    const handleEditButtonClick = () => {
        setIsEditing(true);
    };

    // Düzenlemeyi iptal eden fonksiyon
    const handleCancelEdit = () => {
        setIsEditing(false);
        setUpdatedUserData(userData); // Değişiklikleri iptal et ve orijinal verileri geri yükle
    };

    // Değişiklikleri kaydeden fonksiyon
    const handleSaveChanges = async () => {
        if (!token) {
            console.error('Token bulunamadı');
            return;
        }
        try {
            const response = await fetch('http://localhost:8000/user-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // İsteği yaparken JWT'yi Authorization başlığı altında gönder
                },
                body: JSON.stringify(updatedUserData)
            });
            if (response.ok) {
                setIsEditing(false);
                fetchUserData(); // Verileri güncelle
            } else {
                console.error('Kullanıcı bilgilerini güncellerken bir hata oluştu');
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
                {userData ? (
                    <div className="user-info">
                        <p>
                            <strong>Kullanıcı Adı:</strong> {isEditing ? (
                                <input
                                    type="text"
                                    name="username"
                                    value={updatedUserData.username}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                userData.username
                            )}
                        </p>
                        <p>
                            <strong>E-posta:</strong> {isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={updatedUserData.email}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                userData.email
                            )}
                        </p>
                        <p>
                            <strong>Cinsiyet:</strong> {isEditing ? (
                                <select
                                    name="gender"
                                    value={updatedUserData.gender}
                                    onChange={handleInputChange}
                                >
                                    <option value="male">Erkek</option>
                                    <option value="female">Kadın</option>
                                    <option value="other">Diğer</option>
                                </select>
                            ) : (
                                userData.gender
                            )}
                        </p>
                        {isEditing ? (
                            <>
                                <button onClick={handleSaveChanges}>Kaydet</button>
                                <button onClick={handleCancelEdit}>İptal</button>
                            </>
                        ) : (
                            <button onClick={handleEditButtonClick}>Düzenle</button>
                        )}
                    </div>
                ) : (
                    <p>Yükleniyor...</p>
                )}
            </div>
        </div>
    );
};

export default Profile;
