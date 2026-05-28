import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faClock, 
  faCheckCircle, 
  faHourglassHalf,
  faUsers,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import './MatchCard.css';

const MatchCard = ({ match, onSelectWinner, isAdmin = false }) => {
  const getStatusConfig = (status) => {
    const configs = {
      pending: { label: 'Pending', icon: faHourglassHalf, color: '#f39c12', bg: 'rgba(243,156,18,0.15)' },
      ongoing: { label: 'Live', icon: faClock, color: '#e74c3c', bg: 'rgba(231,76,60,0.15)' },
      completed: { label: 'Completed', icon: faCheckCircle, color: '#27ae60', bg: 'rgba(39,174,96,0.15)' }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(match.status);
  const isPlayer1Winner = match.winner === match.player1?.uid;
  const isPlayer2Winner = match.winner === match.player2?.uid;

  return (
    <div className="match-card">
      <div className="match-header">
        <div className="match-round">
          <FontAwesomeIcon icon={faTrophy} />
          <span>Round {match.round}</span>
        </div>
        <div className="match-status" style={{ background: statusConfig.bg, color: statusConfig.color }}>
          <FontAwesomeIcon icon={statusConfig.icon} />
          <span>{statusConfig.label}</span>
        </div>
      </div>

      <div className="match-players">
        <div className={`player ${isPlayer1Winner ? 'winner' : ''}`}>
          <div className="player-avatar">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="player-info">
            <span className="player-name">{match.player1?.username || 'TBD'}</span>
            {match.score && (
              <span className="player-score">{match.score.player1Score}</span>
            )}
          </div>
          {isPlayer1Winner && (
            <div className="winner-badge">
              <FontAwesomeIcon icon={faTrophy} />
              Winner
            </div>
          )}
        </div>

        <div className="vs-divider">
          <span>VS</span>
        </div>

        <div className={`player ${isPlayer2Winner ? 'winner' : ''}`}>
          <div className="player-avatar">
            <FontAwesomeIcon icon={faUsers} />
          </div>
          <div className="player-info">
            <span className="player-name">{match.player2?.username || 'TBD'}</span>
            {match.score && (
              <span className="player-score">{match.score.player2Score}</span>
            )}
          </div>
          {isPlayer2Winner && (
            <div className="winner-badge">
              <FontAwesomeIcon icon={faTrophy} />
              Winner
            </div>
          )}
        </div>
      </div>

      {match.matchDate && (
        <div className="match-date">
          <FontAwesomeIcon icon={faCalendarAlt} />
          <span>{new Date(match.matchDate).toLocaleString()}</span>
        </div>
      )}

      {isAdmin && match.status !== 'completed' && (
        <div className="admin-actions">
          <button 
            className="select-winner-btn"
            onClick={() => onSelectWinner && onSelectWinner(match.id, match.player1?.uid)}
          >
            Select {match.player1?.username} as Winner
          </button>
          <button 
            className="select-winner-btn"
            onClick={() => onSelectWinner && onSelectWinner(match.id, match.player2?.uid)}
          >
            Select {match.player2?.username} as Winner
          </button>
        </div>
      )}
    </div>
  );
};

export default MatchCard;