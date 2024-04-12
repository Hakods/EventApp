import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Register.css';

const Register = () => {
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        gender: ''
    });

    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const handleToggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // E-posta adresinin geçerli olup olmadığını kontrol et
        if (!validateEmail(formData.email)) {
            setError('Geçerli bir e-posta adresi girin.');
            return;
        }

        // Diğer alanların geçerliliğini kontrol et
        if (!validatePassword(formData.password)) {
            setError('Şifreniz en az 8 karakter uzunluğunda olmalıdır ve en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Şifreleriniz eşleşmiyor.');
            return;
        }

        try {
            // Backend'e kayıt isteği gönder
            const response = await axios.post('http://localhost:8000/register', formData);

            // Başarılı kayıt durumunda giriş sayfasına yönlendir
            if (response.status === 201) {
                navigate('/login');
            } else {
                setError('Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('Kayıt işlemi başarısız oldu:', error);
            setError('Kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.');
        }
    };


    const validateEmail = (email) => {
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const validatePassword = (password) => {
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        return re.test(password);
    };

    return (
        <div className="register-container">
            <h2>Kayıt Ol</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Kullanıcı Adı:</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>E-posta:</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>Şifre:</label>
                    <div className="password-input">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} />
                        <button type="button" onClick={handleTogglePasswordVisibility}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>
                {error && <p className="error-message">{error}</p>}
                <div className="form-group">
                    <label>Şifre Tekrar:</label>
                    <div className="password-input">
                        <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} />
                        <button type="button" onClick={handleToggleConfirmPasswordVisibility}>
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                </div>
                <div className="form-group">
                    <label>Cinsiyet:</label>
                    <div className="gender-options">
                        <label>
                            <input type="radio" name="gender" value="male" checked={formData.gender === 'male'} onChange={handleInputChange} />
                            Erkek
                        </label>
                        <label>
                            <input type="radio" name="gender" value="female" checked={formData.gender === 'female'} onChange={handleInputChange} />
                            Kadın
                        </label>
                    </div>
                </div>
                <button type="submit">Kayıt Ol</button>
            </form>
            <p>Üye misiniz? <Link to="/login">Giriş yapın.</Link></p>
        </div>
    );
};

export default Register;
