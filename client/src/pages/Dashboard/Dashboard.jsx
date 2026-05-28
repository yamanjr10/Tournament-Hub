import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faUsers, 
  faChartLine, 
  faCalendarAlt,
  faMedal,
  faGamepad,
  faUserFriends,
  faClock,
  faCheckCircle,
  faFire,
  faArrowRight,
  faUser,
  faEnvelope,
  faCrown
} from '@fortawesome/free-solid-svg-icons';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [joinedTournaments, setJoinedTournaments] = useState([]);
  const [matchHistory, setMatchHistory] = useState([]);
  const [allTournaments, setAllTournaments] = useState([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, winRate: 0, rank: 0 });
  const [loading, setLoading] = useState(true);
  const [ref, inView] = useInView({ triggerOnce: true });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const tournamentsRes = await api.get('/tournaments');
      const allTourns = tournamentsRes.data || [];
      setAllTournaments(allTourns);
      
      // Find tournaments the user has joined
      const userTournaments = allTourns.filter(t => 
        t.players?.some(p => p === user?.uid)
      );
      setJoinedTournaments(userTournaments);
      
      // Get user's matches
      const matchesRes = await api.get('/matches');
      const allMatches = matchesRes.data || [];
      const userMatches = allMatches.filter(m => 
        (m.player1 === user?.uid || m.player2 === user?.uid)
      );
      setMatchHistory(userMatches);
      
      // Calculate stats
      const wins = userMatches.filter(m => m.winner === user?.uid).length;
      const losses = userMatches.length - wins;
      const winRate = userMatches.length > 0 ? ((wins / userMatches.length) * 100).toFixed(1) : 0;
      
      setStats({
        wins: wins,
        losses: losses,
        winRate: winRate,
        rank: calculateRank(wins, userMatches.length)
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRank = (wins, totalMatches) => {
    if (totalMatches === 0) return 'Unranked';
    const ratio = wins / totalMatches;
    if (ratio >= 0.7) return 'Diamond';
    if (ratio >= 0.5) return 'Platinum';
    if (ratio >= 0.3) return 'Gold';
    return 'Silver';
  };

  const getRankIcon = () => {
    const rank = stats.rank;
    switch(rank) {
      case 'Diamond': return faCrown;
      case 'Platinum': return faMedal;
      case 'Gold': return faTrophy;
      default: return faMedal;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="dashboard-hero">
        <div className="container">
          <div className="welcome-section">
            <div className="welcome-text">
              <h1>Welcome back, <span className="gradient-text">{user?.username}</span></h1>
              <p>Ready to compete and climb the ranks?</p>
            </div>
            <div className="welcome-stats" ref={ref}>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(39,174,96,0.15)', color: '#27ae60' }}>
                  <FontAwesomeIcon icon={faTrophy} />
                </div>
                <div className="stat-info">
                  <h3>{inView && <CountUp end={stats.wins} duration={2} />}</h3>
                  <p>Total Wins</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(231,76,60,0.15)', color: '#e74c3c' }}>
                  <FontAwesomeIcon icon={faChartLine} />
                </div>
                <div className="stat-info">
                  <h3>{inView && <CountUp end={stats.losses} duration={2} />}</h3>
                  <p>Total Losses</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(233,69,96,0.15)', color: '#e94560' }}>
                  <FontAwesomeIcon icon={getRankIcon()} />
                </div>
                <div className="stat-info">
                  <h3>{stats.rank}</h3>
                  <p>Current Rank</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(52,152,219,0.15)', color: '#3498db' }}>
                  <FontAwesomeIcon icon={faMedal} />
                </div>
                <div className="stat-info">
                  <h3>{stats.winRate}%</h3>
                  <p>Win Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-grid">
          {/* User Profile Section */}
          <div className="dashboard-section profile-section">
            <div className="section-header">
              <h2>
                <FontAwesomeIcon icon={faUser} />
                Profile Information
              </h2>
            </div>
            <div className="profile-content">
              <div className="profile-avatar">
                <FontAwesomeIcon icon={faUser} />
              </div>
              <div className="profile-details">
                <div className="profile-field">
                  <label>Username</label>
                  <p>{user?.username}</p>
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>
                <div className="profile-field">
                  <label>Member Since</label>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
                <div className="profile-field">
                  <label>Tournaments Joined</label>
                  <p>{joinedTournaments.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tournaments Section */}
          <div className="dashboard-section tournaments-section">
            <div className="section-header">
              <h2>
                <FontAwesomeIcon icon={faGamepad} />
                Your Tournaments
              </h2>
              <span className="section-count">{joinedTournaments.length} Joined</span>
            </div>
            <div className="tournaments-list">
              {joinedTournaments.length === 0 ? (
                <div className="empty-state">
                  <FontAwesomeIcon icon={faTrophy} />
                  <h3>No Tournaments Yet</h3>
                  <p>Join your first tournament to get started!</p>
                  <Link to="/tournaments" className="btn-primary">Browse Tournaments</Link>
                </div>
              ) : (
                joinedTournaments.map(tournament => (
                  <Link to={`/tournaments/${tournament.id}`} key={tournament.id} className="tournament-item">
                    <div className="tournament-info">
                      <h3>{tournament.title}</h3>
                      <div className="tournament-details">
                        <span><FontAwesomeIcon icon={faGamepad} /> {tournament.game}</span>
                        <span><FontAwesomeIcon icon={faCalendarAlt} /> {new Date(tournament.startDate).toLocaleDateString()}</span>
                        <span className={`status-badge ${tournament.status}`}>{tournament.status}</span>
                      </div>
                    </div>
                    <div className="tournament-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(tournament.players?.length / tournament.maxPlayers) * 100}%` }}></div>
                      </div>
                      <span>{tournament.players?.length || 0}/{tournament.maxPlayers} Players</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Match History Section */}
          <div className="dashboard-section matches-section">
            <div className="section-header">
              <h2>
                <FontAwesomeIcon icon={faClock} />
                Match History
              </h2>
              <span className="section-count">{matchHistory.length} Matches</span>
            </div>
            <div className="matches-list">
              {matchHistory.length === 0 ? (
                <div className="empty-state">
                  <FontAwesomeIcon icon={faGamepad} />
                  <h3>No Matches Yet</h3>
                  <p>Your match history will appear here after you play</p>
                </div>
              ) : (
                matchHistory.slice(0, 5).map(match => {
                  const isWinner = match.winner === user?.uid;
                  const opponent = match.player1 === user?.uid ? match.player2 : match.player1;
                  
                  return (
                    <div key={match.id} className={`match-item ${isWinner ? 'win' : 'loss'}`}>
                      <div className="match-icon">
                        <FontAwesomeIcon icon={isWinner ? faTrophy : faClock} />
                      </div>
                      <div className="match-info">
                        <div className="match-versus">
                          <span className="player-name">You</span>
                          <span className="vs">VS</span>
                          <span className="player-name">Opponent</span>
                        </div>
                        <div className="match-result">
                          {isWinner ? (
                            <span className="win-badge">Victory!</span>
                          ) : (
                            <span className="loss-badge">Defeat</span>
                          )}
                        </div>
                        <div className="match-date">
                          <FontAwesomeIcon icon={faCalendarAlt} />
                          {new Date(match.matchDate || match.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="match-score">
                        <span className="score">{match.score?.player1Score || 0}</span>
                        <span>-</span>
                        <span className="score">{match.score?.player2Score || 0}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {matchHistory.length > 5 && (
              <div className="view-more">
                <Link to="/matches" className="btn-outline-small">
                  View All Matches
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="dashboard-section activity-section">
            <div className="section-header">
              <h2>
                <FontAwesomeIcon icon={faFire} />
                Recent Activity
              </h2>
            </div>
            <div className="activity-list">
              {joinedTournaments.length > 0 && (
                <div className="activity-item">
                  <div className="activity-icon" style={{ background: 'rgba(39,174,96,0.15)', color: '#27ae60' }}>
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                  <div className="activity-info">
                    <p>Joined tournament: {joinedTournaments[0]?.title}</p>
                    <span>Recently</span>
                  </div>
                </div>
              )}
              {matchHistory.filter(m => m.winner === user?.uid).length > 0 && (
                <div className="activity-item">
                  <div className="activity-icon" style={{ background: 'rgba(233,69,96,0.15)', color: '#e94560' }}>
                    <FontAwesomeIcon icon={faTrophy} />
                  </div>
                  <div className="activity-info">
                    <p>Won {matchHistory.filter(m => m.winner === user?.uid).length} matches</p>
                    <span>Overall record</span>
                  </div>
                </div>
              )}
              <div className="activity-item">
                <div className="activity-icon" style={{ background: 'rgba(52,152,219,0.15)', color: '#3498db' }}>
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <div className="activity-info">
                  <p>Total tournaments available: {allTournaments.length}</p>
                  <span>Active tournaments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;