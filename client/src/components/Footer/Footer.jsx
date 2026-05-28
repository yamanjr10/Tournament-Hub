import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTwitter, 
  faDiscord, 
  faGithub,
  faTwitch
} from '@fortawesome/free-brands-svg-icons';
import { 
  faTrophy,
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
          <path fill="#0f0f1a" d="M0,64L48,69.3C96,75,192,85,288,85.3C384,85,480,75,576,69.3C672,64,768,64,864,69.3C960,75,1056,85,1152,85.3C1248,85,1344,75,1392,69.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>
      
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-section">
              <div className="footer-logo">
                <FontAwesomeIcon icon={faTrophy} className="logo-icon" />
                <span>Tournament <span>Hub</span></span>
              </div>
              <p>Your premier destination for competitive gaming tournaments. Join thousands of players competing for glory and amazing prizes.</p>
              <div className="social-links">
                <a href="#"><FontAwesomeIcon icon={faTwitter} /></a>
                <a href="#"><FontAwesomeIcon icon={faDiscord} /></a>
                <a href="#"><FontAwesomeIcon icon={faTwitch} /></a>
                <a href="#"><FontAwesomeIcon icon={faGithub} /></a>
              </div>
            </div>

            <div className="footer-section">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/tournaments">Tournaments</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Support</h4>
              <ul>
                <li><a href="#">FAQ</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Contact Info</h4>
              <ul className="contact-info">
                <li>
                  <FontAwesomeIcon icon={faEnvelope} />
                  <span>support@tournamenthub.com</span>
                </li>
                <li>
                  <FontAwesomeIcon icon={faPhone} />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li>
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <span>123 Gaming Street, Esports City</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>
              Made with <FontAwesomeIcon icon={faHeart} className="heart-icon" /> for the gaming community
            </p>
            <p>&copy; {currentYear} TournamentHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;