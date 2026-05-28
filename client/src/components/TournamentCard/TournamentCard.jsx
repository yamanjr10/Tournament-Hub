import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faUsers, 
  faCalendarAlt, 
  faGamepad,
  faArrowRight,
  faClock,
  faDollarSign,
  faFire
} from '@fortawesome/free-solid-svg-icons';
import './TournamentCard.css';

const TournamentCard = ({ tournament, featured = false }) => {
  const navigate = useNavigate();

  const getStatusConfig = (status) => {
    const configs = {
      upcoming: { 
        label: 'Upcoming', 
        icon: faClock, 
        color: '#f39c12',
        bg: 'rgba(243,156,18,0.15)'
      },
      ongoing: { 
        label: 'Live Now', 
        icon: faFire, 
        color: '#e74c3c',
        bg: 'rgba(231,76,60,0.15)'
      },
      completed: { 
        label: 'Completed', 
        icon: faTrophy, 
        color: '#3498db',
        bg: 'rgba(52,152,219,0.15)'
      }
    };
    return configs[status] || configs.upcoming;
  };

  const statusConfig = getStatusConfig(tournament.status);
  const progress = ((tournament.players?.length || 0) / tournament.maxPlayers) * 100;
  
  // Fix date formatting - properly parse the date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date TBD';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date TBD';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Date TBD';
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/tournaments/${tournament.id}`);
  };

  return (
    <div className={`tournament-card ${featured ? 'featured' : ''}`} onClick={handleViewDetails}>
      {featured && (
        <div className="featured-badge">
          <FontAwesomeIcon icon={faFire} />
          <span>Featured</span>
        </div>
      )}
      
      <div className="card-badge" style={{ background: statusConfig.bg, color: statusConfig.color }}>
        <FontAwesomeIcon icon={statusConfig.icon} />
        <span>{statusConfig.label}</span>
      </div>
      
      <div className="card-image">
        <img src={tournament.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500'} alt={tournament.title} />
        <div className="image-overlay"></div>
      </div>
      
      <div className="card-content">
        <h3 className="tournament-title">{tournament.title}</h3>
        
        <div className="tournament-meta">
          <span className="game-tag">
            <FontAwesomeIcon icon={faGamepad} />
            {tournament.game}
          </span>
          <span className="prize-tag">
            <FontAwesomeIcon icon={faDollarSign} />
            {tournament.prize}
          </span>
        </div>
        
        <p className="tournament-description">{tournament.description?.substring(0, 100)}...</p>
        
        <div className="tournament-stats">
          <div className="stat-item">
            <FontAwesomeIcon icon={faUsers} />
            <div>
              <strong>{tournament.players?.length || 0}/{tournament.maxPlayers}</strong>
              <span>Players</span>
            </div>
          </div>
          <div className="stat-item">
            <FontAwesomeIcon icon={faCalendarAlt} />
            <div>
              <strong>{formatDate(tournament.startDate)}</strong>
              <span>Start Date</span>
            </div>
          </div>
        </div>
        
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span className="progress-text">{Math.round(progress)}% Full</span>
        </div>
        
        <button className="view-btn" onClick={handleViewDetails}>
          View Details
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
};

export default TournamentCard;