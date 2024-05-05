import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };
    
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateEmail(formData.email)) {
            setError('Geçerli bir e-posta adresi girin.');
            return;
        }
    
        try {
            const response = await axios.post('http://localhost:8000/login', formData);
            if (response.data.success) {
                // Kullanıcı doğrulandıysa ana sayfaya yönlendir
                navigate('/home');
            } else {
                setError('Kullanıcı adı veya şifre hatalı.');
            }
        } catch (error) {
            console.error('Giriş işlemi başarısız oldu:', error);
            setError('Giriş işlemi başarısız oldu. Lütfen tekrar deneyin.');
        }
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
            <p>Hesabınız yok mu? <Link to="/register">Kayıt olun.</Link></p>
        </div>
    );
};

export default Login;
