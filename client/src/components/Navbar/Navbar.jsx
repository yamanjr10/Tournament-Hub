import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faUser, 
  faSignOutAlt, 
  faBars,
  faTimes,
  faDashboard,
  faShieldAlt,
  faGamepad
} from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          <FontAwesomeIcon icon={faTrophy} className="logo-icon" />
          <span>Tournament <span className="logo-highlight">Hub</span></span>
        </Link>

        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} />
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" onClick={closeMobileMenu}>
            <FontAwesomeIcon icon={faGamepad} />
            Home
          </Link>
          <Link to="/tournaments" onClick={closeMobileMenu}>
            <FontAwesomeIcon icon={faTrophy} />
            Tournaments
          </Link>
          
          {user && (
            <>
              <Link to="/dashboard" onClick={closeMobileMenu}>
                <FontAwesomeIcon icon={faDashboard} />
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" onClick={closeMobileMenu}>
                  <FontAwesomeIcon icon={faShieldAlt} />
                  Admin
                </Link>
              )}
            </>
          )}

          <div className="nav-auth">
            {user ? (
              <div className="user-menu">
                <span className="user-name">
                  <FontAwesomeIcon icon={faUser} />
                  {user.username}
                </span>
                <button onClick={handleLogout} className="logout-btn">
                  <FontAwesomeIcon icon={faSignOutAlt} />
                  Logout
                </button>
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login" onClick={closeMobileMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn-register" onClick={closeMobileMenu}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;