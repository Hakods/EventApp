import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Giriş yapılacak işlemleri buraya ekleyin
        console.log(formData); // Örneğin, form verilerini konsola yazdırabilirsiniz
    };

    return (
        <div className="login-container">
            <h2>Giriş Yap</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>E-posta:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>Şifre:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} />
                </div>
                <Link to="/main"><button type="submit">Giriş Yap</button></Link>
            </form>
            <p>Henüz üye değil misiniz? <Link to="/">Üye Ol.</Link></p>
        </div>
    );
};

export default Login;
