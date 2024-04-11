import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };
   

 
    const handleSubmit = (e) => {
        e.preventDefault();
        // Giriş yapılacak işlemleri buraya ekleyin
        if (!validateEmail(formData.email)) {
            setError('Geçerli bir e-posta adresi girin.');
        }
        console.log(formData); // Örneğin, form verilerini konsola yazdırabilirsiniz
    };

    return (
        <div className="login-container">
            <h2>Giriş Yap</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>E-posta:</label>
                    <input type="email" name="email" value={formData.email}  onChange={handleInputChange} />
                </div>
                {error && <p className="error-message">{error}</p>}

                <div className="form-group">
                    <label>Şifre:</label>
                    <div className="password-input">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} />
                        <button type="button" onClick={handleTogglePasswordVisibility}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>
                <button type="submit">Giriş Yap</button>
            </form>
            <p>Henüz üye değil misiniz? <Link to="/register">Üye Ol.</Link></p>
        </div>
    );
};

export default Login;
