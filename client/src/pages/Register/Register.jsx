import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faUserPlus,
  faEye,
  faEyeSlash,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validatePassword = (pass) => {
    const hasMinLength = pass.length >= 6;
    const hasNumber = /\d/.test(pass);
    const hasLetter = /[a-zA-Z]/.test(pass);
    return { hasMinLength, hasNumber, hasLetter };
  };

  const passwordValid = validatePassword(password);
  const passwordsMatch = password === confirmPassword && password !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!passwordValid.hasMinLength) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setLoading(true);

    const result = await register(username, email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <div className="register-icon">
              <FontAwesomeIcon icon={faUserPlus} />
            </div>
            <h2>Create Account</h2>
            <p>Join the ultimate gaming community</p>
          </div>

          {error && (
            <div className="error-message">
              <FontAwesomeIcon icon={faUserPlus} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <div className="input-icon">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <div className="input-icon">
                <FontAwesomeIcon icon={faLock} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            {password && (
              <div className="password-requirements">
                <div className={`req-item ${passwordValid.hasMinLength ? 'valid' : ''}`}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>At least 6 characters</span>
                </div>
                <div className={`req-item ${passwordValid.hasLetter ? 'valid' : ''}`}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Contains letters</span>
                </div>
                <div className={`req-item ${passwordValid.hasNumber ? 'valid' : ''}`}>
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span>Contains numbers</span>
                </div>
              </div>
            )}

            <div className="input-group">
              <div className="input-icon">
                <FontAwesomeIcon icon={faLock} />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>

            {confirmPassword && (
              <div className={`password-match ${passwordsMatch ? 'valid' : 'invalid'}`}>
                <FontAwesomeIcon icon={faCheckCircle} />
                <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
              </div>
            )}

            <button type="submit" className="register-btn" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
              <FontAwesomeIcon icon={faUserPlus} />
            </button>
          </form>

          <div className="register-footer">
            <p>
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;