import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TournamentCard from '../../components/TournamentCard/TournamentCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter, faTrophy } from '@fortawesome/free-solid-svg-icons';
import './Tournament.css';

const Tournament = () => {
  const [tournaments, setTournaments] = useState([]);
  const [filteredTournaments, setFilteredTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    filterTournaments();
  }, [searchTerm, filter, tournaments]);

  const fetchTournaments = async () => {
    try {
      const response = await api.get('/tournaments');
      setTournaments(response.data);
      setFilteredTournaments(response.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTournaments = () => {
    let filtered = [...tournaments];
    
    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.status === filter);
    }
    
    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.game.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredTournaments(filtered);
  };

  return (
    <div className="tournament-page">
      <div className="container">
        <div className="page-header">
          <h1>
            <FontAwesomeIcon icon={faTrophy} />
            All Tournaments
          </h1>
          <p>Browse and join competitive gaming tournaments</p>
        </div>
        
        <div className="filters-section">
          <div className="search-bar">
            <FontAwesomeIcon icon={faSearch} />
            <input
              type="text"
              placeholder="Search tournaments by name or game..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-buttons">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
              All
            </button>
            <button className={filter === 'upcoming' ? 'active' : ''} onClick={() => setFilter('upcoming')}>
              Upcoming
            </button>
            <button className={filter === 'ongoing' ? 'active' : ''} onClick={() => setFilter('ongoing')}>
              Live
            </button>
            <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>
              Completed
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <div className="tournaments-count">
              Found {filteredTournaments.length} tournaments
            </div>
            <div className="tournaments-grid">
              {filteredTournaments.length === 0 ? (
                <div className="empty-state">
                  <FontAwesomeIcon icon={faTrophy} />
                  <h3>No tournaments found</h3>
                  <p>Try adjusting your search or filter</p>
                </div>
              ) : (
                filteredTournaments.map(tournament => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Tournament;