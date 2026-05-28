import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faUsers, 
  faCalendarAlt, 
  faGamepad,
  faArrowLeft,
  faDollarSign,
  faClock,
  faFire,
  faUserPlus,
  faCheckCircle,
  faTimes,
  faMedal,
  faShareAlt,
  faBookmark,
  faFlag,
  faInfoCircle,
  faList,
  faDiagramProject,
  faAward,
  faUser,
  faShieldAlt,
  faHeart,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import './TournamentDetails.css';

const TournamentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTournament();
  }, [id]);

  const fetchTournament = async () => {
    try {
      const response = await api.get(`/tournaments/${id}`);
      setTournament(response.data);
    } catch (error) {
      console.error('Error fetching tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setJoining(true);
    try {
      await api.post(`/tournaments/join/${id}`, { userId: user.uid });
      await fetchTournament();
      setModalMessage('Successfully joined the tournament!');
      setModalType('success');
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000);
    } catch (error) {
      setModalMessage(error.response?.data?.message || 'Failed to join tournament');
      setModalType('error');
      setShowModal(true);
      setTimeout(() => setShowModal(false), 3000);
    } finally {
      setJoining(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return { full: 'Date TBD', short: 'Date TBD' };
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return { full: 'Date TBD', short: 'Date TBD' };
      return {
        full: date.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        short: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    } catch (e) {
      return { full: 'Date TBD', short: 'Date TBD' };
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      upcoming: { 
        label: 'Upcoming', 
        icon: faClock, 
        color: '#f39c12',
        bg: 'rgba(243,156,18,0.15)',
        message: 'Registration is open! Join now to secure your spot.'
      },
      ongoing: { 
        label: 'Live Now', 
        icon: faFire, 
        color: '#e74c3c',
        bg: 'rgba(231,76,60,0.15)',
        message: 'Tournament is currently in progress!'
      },
      completed: { 
        label: 'Completed', 
        icon: faCheckCircle, 
        color: '#27ae60',
        bg: 'rgba(39,174,96,0.15)',
        message: 'Tournament has concluded. Check the results!'
      }
    };
    return configs[status] || configs.upcoming;
  };

  const calculatePrizeTiers = () => {
    const prizeAmount = parseInt(tournament?.prize?.replace(/[^0-9]/g, '') || 0);
    return [
      { place: '1st Place', prize: tournament?.prize || '$0', icon: faTrophy, color: '#FFD700', bg: 'rgba(255,215,0,0.1)' },
      { place: '2nd Place', prize: `$${Math.floor(prizeAmount * 0.3).toLocaleString()}`, icon: faMedal, color: '#C0C0C0', bg: 'rgba(192,192,192,0.1)' },
      { place: '3rd Place', prize: `$${Math.floor(prizeAmount * 0.15).toLocaleString()}`, icon: faAward, color: '#CD7F32', bg: 'rgba(205,127,50,0.1)' }
    ];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading tournament details...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="error-container">
        <div className="error-content">
          <FontAwesomeIcon icon={faTimes} />
          <h2>Tournament Not Found</h2>
          <p>The tournament you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/tournaments')} className="btn-primary">
            Back to Tournaments
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(tournament.status);
  const isJoined = user && tournament.players?.includes(user.uid);
  const isFull = (tournament.players?.length || 0) >= tournament.maxPlayers;
  const progress = ((tournament.players?.length || 0) / tournament.maxPlayers) * 100;
  const dateInfo = formatDate(tournament.startDate);
  const prizeTiers = calculatePrizeTiers();

  return (
    <div className="tournament-details-page">
      <div className="container">
        {/* Back Button */}
        <div className="back-btn-wrapper">
          <button onClick={() => navigate('/tournaments')} className="back-btn">
            <FontAwesomeIcon icon={faArrowLeft} />
            Back to Tournaments
          </button>
        </div>

        {/* Main Content */}
        <div className="details-wrapper">
          {/* Hero Section */}
          <div className="details-hero">
            <div className="hero-image">
              <img src={tournament.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200'} alt={tournament.title} />
              <div className="hero-overlay"></div>
              <div className="status-badge" style={{ background: statusConfig.bg, color: statusConfig.color }}>
                <FontAwesomeIcon icon={statusConfig.icon} />
                {statusConfig.label}
              </div>
            </div>
            
            <div className="hero-content">
              <div className="tournament-breadcrumb">
                <span>Tournaments</span>
                <span>/</span>
                <span>{tournament.game}</span>
                <span>/</span>
                <span className="current">{tournament.title}</span>
              </div>
              
              <h1 className="tournament-title">{tournament.title}</h1>
              
              <div className="tournament-meta-tags">
                <span className="meta-tag game">
                  <FontAwesomeIcon icon={faGamepad} />
                  {tournament.game}
                </span>
                <span className="meta-tag prize">
                  <FontAwesomeIcon icon={faDollarSign} />
                  {tournament.prize}
                </span>
                <span className="meta-tag date">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  {dateInfo.short}
                </span>
              </div>
              
              <div className="action-buttons">
                <button className="share-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <FontAwesomeIcon icon={faShareAlt} />
                  Share
                </button>
                <button className="save-btn">
                  <FontAwesomeIcon icon={faBookmark} />
                  Save
                </button>
                <button className="report-btn">
                  <FontAwesomeIcon icon={faFlag} />
                  Report
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              <FontAwesomeIcon icon={faInfoCircle} />
              Overview
            </button>
            <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
              <FontAwesomeIcon icon={faList} />
              Details
            </button>
            <button className={`tab-btn ${activeTab === 'bracket' ? 'active' : ''}`} onClick={() => setActiveTab('bracket')}>
              <FontAwesomeIcon icon={faDiagramProject} />
              Bracket
            </button>
            <button className={`tab-btn ${activeTab === 'players' ? 'active' : ''}`} onClick={() => setActiveTab('players')}>
              <FontAwesomeIcon icon={faUsers} />
              Players ({tournament.players?.length || 0})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Total Players</span>
                      <strong className="stat-value">{tournament.players?.length || 0}/{tournament.maxPlayers}</strong>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Start Date</span>
                      <strong className="stat-value">{dateInfo.full}</strong>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FontAwesomeIcon icon={faClock} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Status</span>
                      <strong className="stat-value" style={{ color: statusConfig.color }}>
                        {statusConfig.label}
                      </strong>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FontAwesomeIcon icon={faDollarSign} />
                    </div>
                    <div className="stat-info">
                      <span className="stat-label">Prize Pool</span>
                      <strong className="stat-value">{tournament.prize}</strong>
                    </div>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span>Registration Progress</span>
                    <span>{Math.round(progress)}% Full</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="status-message" style={{ color: statusConfig.color }}>
                    <FontAwesomeIcon icon={statusConfig.icon} />
                    {statusConfig.message}
                  </p>
                </div>

                <div className="description-section">
                  <h3>
                    <FontAwesomeIcon icon={faInfoCircle} />
                    About This Tournament
                  </h3>
                  <p>{tournament.description}</p>
                </div>

                <div className="prize-distribution">
                  <h3>
                    <FontAwesomeIcon icon={faAward} />
                    Prize Distribution
                  </h3>
                  <div className="prize-tiers">
                    {prizeTiers.map((tier, index) => (
                      <div key={index} className="prize-tier" style={{ background: tier.bg }}>
                        <div className="prize-icon" style={{ color: tier.color }}>
                          <FontAwesomeIcon icon={tier.icon} />
                        </div>
                        <div className="prize-info">
                          <span className="prize-place">{tier.place}</span>
                          <strong className="prize-amount">{tier.prize}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {tournament.status === 'upcoming' && !isJoined && !isFull && (
                  <button className="join-btn" onClick={handleJoin} disabled={joining}>
                    <FontAwesomeIcon icon={faUserPlus} />
                    {joining ? 'Joining...' : 'Join Tournament Now'}
                  </button>
                )}

                {isJoined && (
                  <div className="joined-message">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    <div>
                      <strong>You're registered!</strong>
                      <p>You have successfully joined this tournament. Check your dashboard for updates.</p>
                    </div>
                  </div>
                )}

                {isFull && !isJoined && tournament.status === 'upcoming' && (
                  <div className="full-message">
                    <FontAwesomeIcon icon={faTimes} />
                    <div>
                      <strong>Tournament is Full</strong>
                      <p>All spots have been filled. Check back for future tournaments!</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="details-tab">
                <div className="info-grid">
                  <div className="info-section">
                    <h4><FontAwesomeIcon icon={faGamepad} /> Game Information</h4>
                    <ul>
                      <li><strong>Game:</strong> {tournament.game}</li>
                      <li><strong>Platform:</strong> PC / Cross-Platform</li>
                      <li><strong>Region:</strong> Worldwide</li>
                      <li><strong>Game Mode:</strong> Competitive 5v5</li>
                      <li><strong>Skill Level:</strong> All Ranks Welcome</li>
                    </ul>
                  </div>
                  
                  <div className="info-section">
                    <h4><FontAwesomeIcon icon={faCalendarAlt} /> Schedule</h4>
                    <ul>
                      <li><strong>Registration Opens:</strong> {formatDate(tournament.createdAt)?.short || 'Now Open'}</li>
                      <li><strong>Registration Closes:</strong> {dateInfo.short}</li>
                      <li><strong>Tournament Starts:</strong> {dateInfo.full}</li>
                      <li><strong>Check-in Time:</strong> 1 hour before start</li>
                      <li><strong>Estimated Duration:</strong> 4-6 hours</li>
                    </ul>
                  </div>
                  
                  <div className="info-section">
                    <h4><FontAwesomeIcon icon={faTrophy} /> Tournament Rules</h4>
                    <ul>
                      <li><strong>Format:</strong> Single Elimination</li>
                      <li><strong>Min Players:</strong> {Math.ceil(tournament.maxPlayers / 2)}</li>
                      <li><strong>Max Players:</strong> {tournament.maxPlayers}</li>
                      <li><strong>Match Format:</strong> Best of 3</li>
                      <li><strong>Map Selection:</strong> Team captains alternate bans</li>
                    </ul>
                  </div>
                  
                  <div className="info-section">
                    <h4><FontAwesomeIcon icon={faShieldAlt} /> Requirements</h4>
                    <ul>
                      <li><strong>Age:</strong> 13+ (or age of majority)</li>
                      <li><strong>Connection:</strong> Stable internet (min 10 Mbps)</li>
                      <li><strong>Equipment:</strong> Working microphone & headset</li>
                      <li><strong>Account:</strong> Valid game account required</li>
                      <li><strong>Anti-Cheat:</strong> Must be installed and running</li>
                    </ul>
                  </div>
                </div>

                <div className="code-conduct">
                  <h4><FontAwesomeIcon icon={faShieldAlt} /> Code of Conduct</h4>
                  <div className="conduct-grid">
                    <div className="conduct-item">
                      <FontAwesomeIcon icon={faHeart} />
                      <span>Respect all participants and staff</span>
                    </div>
                    <div className="conduct-item">
                      <FontAwesomeIcon icon={faShieldAlt} />
                      <span>No cheating or unfair advantages</span>
                    </div>
                    <div className="conduct-item">
                      <FontAwesomeIcon icon={faStar} />
                      <span>Good sportsmanship at all times</span>
                    </div>
                    <div className="conduct-item">
                      <FontAwesomeIcon icon={faFlag} />
                      <span>Report issues to moderators immediately</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bracket Tab */}
            {activeTab === 'bracket' && (
              <div className="bracket-tab">
                <div className="bracket-placeholder">
                  <FontAwesomeIcon icon={faDiagramProject} />
                  <h3>Tournament Bracket</h3>
                  <p>The bracket will be generated once the tournament starts and all players are confirmed.</p>
                  <div className="bracket-info">
                    <div className="bracket-info-item">
                      <strong>Format:</strong> Single Elimination
                    </div>
                    <div className="bracket-info-item">
                      <strong>Matches:</strong> Best of 3
                    </div>
                    <div className="bracket-info-item">
                      <strong>Players:</strong> {tournament.players?.length || 0}/{tournament.maxPlayers}
                    </div>
                  </div>
                  {tournament.players?.length >= 4 && (
                    <div className="bracket-preview">
                      <p>✓ {tournament.players.length} players registered - Bracket ready!</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Players Tab */}
            {activeTab === 'players' && (
              <div className="players-tab">
                <div className="players-header">
                  <h3><FontAwesomeIcon icon={faUsers} /> Registered Players</h3>
                  <span className="players-count">{tournament.players?.length || 0} / {tournament.maxPlayers}</span>
                </div>
                <div className="players-grid">
                  {tournament.players?.length > 0 ? (
                    tournament.players.map((player, index) => (
                      <div key={index} className="player-card">
                        <div className="player-avatar">
                          <FontAwesomeIcon icon={faUser} />
                        </div>
                        <div className="player-details">
                          <h4>Player {index + 1}</h4>
                          <span>ID: {player.substring(0, 8)}...</span>
                          <div className="player-status online">Online</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-players">
                      <FontAwesomeIcon icon={faUsers} />
                      <h4>No players yet</h4>
                      <p>Be the first to join this tournament!</p>
                      {tournament.status === 'upcoming' && !isJoined && (
                        <button className="join-small-btn" onClick={handleJoin}>
                          Join Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success/Error Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className={`modal-content ${modalType}`}>
            <FontAwesomeIcon icon={modalType === 'success' ? faCheckCircle : faTimes} />
            <h3>{modalType === 'success' ? 'Success!' : 'Error'}</h3>
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentDetails;