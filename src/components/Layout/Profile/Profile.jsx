import React, { useEffect, useState, useCallback } from 'react';
import Navbar from '../Navbar/Navbar';
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
                // Cinsiyet değerini dönüştür
                const translatedUserData = {
                    ...userData,
                    gender: userData.gender === 'male' ? 'Erkek' : userData.gender === 'female' ? 'Kadın' : 'Diğer'
                };
                setUserData(translatedUserData);
                setUpdatedUserData(translatedUserData);
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

    const handleSaveChanges = async () => {
        if (!token) {
            console.error('Token bulunamadı');
            return;
        }
        // Cinsiyet değerini İngilizceye geri çevir
        const translatedData = {
            ...updatedUserData,
            gender: updatedUserData.gender === 'Erkek' ? 'male' : updatedUserData.gender === 'Kadın' ? 'female' : 'other'
        };
        console.log('Güncelleme için gönderilen veriler:', translatedData); // Debug için eklenen log
        try {
            const response = await fetch('http://localhost:8000/user-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // İsteği yaparken JWT'yi Authorization başlığı altında gönder
                },
                body: JSON.stringify(translatedData)
            });
            if (response.ok) {
                setIsEditing(false);
                fetchUserData(); // Verileri güncelle
            } else {
                const errorData = await response.json();
                console.error('Kullanıcı bilgilerini güncellerken bir hata oluştu', errorData);
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
                                    <option value="Erkek">Erkek</option>
                                    <option value="Kadın">Kadın</option>
                                    <option value="Diğer">Diğer</option>
                                </select>
                            ) : (
                                userData.gender
                            )}
                        </p>
                        {isEditing ? (
                            <div className="button-container">
                                <button onClick={handleSaveChanges}>Kaydet</button>
                                <button onClick={handleCancelEdit}>İptal</button>
                            </div>
                        ) : (
                            <div className="button-container">
                                <button onClick={handleEditButtonClick}>Düzenle</button>
                            </div>
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
