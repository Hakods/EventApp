import React from 'react';
import { Link } from 'react-router-dom'; // react-router-dom eklenmeli
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <h1>Etkinlik Uygulaması</h1>
      </div>
      <ul className="navbar-links">
        <li>Etkinlik Oluştur</li>
        <li>Etkinlikler</li>
        <li>Profil</li>
        {/* Çıkış Yap düğmesi Link bileşenine dönüştürüldü */}
        <li><Link to="/login">Çıkış Yap</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
