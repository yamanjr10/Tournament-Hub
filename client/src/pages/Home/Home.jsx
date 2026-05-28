import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TournamentCard from '../../components/TournamentCard/TournamentCard';
import api from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTrophy, 
  faUsers, 
  faChartLine, 
  faGamepad,
  faArrowRight,
  faCrown,
  faFire,
  faCalendarAlt,
  faMedal,
  faStar,
  faRocket,
  faAward,
  faInfinity,
  faClock,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import './Home.css';

const Home = () => {
  const [featuredTournaments, setFeaturedTournaments] = useState([]);
  const [allTournaments, setAllTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ tournaments: 0, players: 0, matches: 0, users: 0 });
  const [ref, inView] = useInView({ triggerOnce: true });
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Set target date for next major tournament
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 0);
  targetDate.setHours(18, 0, 0, 0);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/tournaments');
      const tournaments = response.data || [];
      setAllTournaments(tournaments);
      
      // Get featured tournaments (first 3 or all if less)
      const featured = tournaments.slice(0, 3);
      setFeaturedTournaments(featured);
      
      // Calculate real stats
      const totalPlayers = tournaments.reduce((acc, t) => acc + (t.players?.length || 0), 0);
      const completedMatches = tournaments.filter(t => t.status === 'completed').length;
      const totalUsers = tournaments.reduce((acc, t) => {
        const uniquePlayers = new Set(t.players || []);
        return Math.max(acc, uniquePlayers.size);
      }, 0);
      
      setStats({
        tournaments: tournaments.length,
        players: totalPlayers,
        matches: completedMatches,
        users: totalUsers || 24
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: faTrophy, title: 'Competitive Tournaments', description: 'Join exciting tournaments with amazing prizes', color: '#e94560' },
    { icon: faUsers, title: 'Active Community', description: 'Connect with gamers worldwide and make friends', color: '#3498db' },
    { icon: faChartLine, title: 'Track Progress', description: 'Monitor your stats and climb leaderboards', color: '#27ae60' },
    { icon: faGamepad, title: 'Multiple Games', description: 'Various gaming titles to compete in', color: '#f39c12' },
    { icon: faMedal, title: 'Rank System', description: 'Climb through competitive ranks', color: '#9b59b6' },
    { icon: faAward, title: 'Big Prizes', description: 'Win amazing rewards and recognition', color: '#e74c3c' }
  ];

  const getUpcomingTournament = () => {
    const upcoming = allTournaments.find(t => t.status === 'upcoming');
    return upcoming || allTournaments[0];
  };

  const upcomingTournament = getUpcomingTournament();

  return (
    <div className="home">
      {/* Hero Section */}
<section className="hero-section">
  <div className="hero-overlay"></div>
  <div className="hero-particles"></div>
  
  <div className="hero-content-wrapper">
    <div className="container">
      <div className="hero-content">
        <div className="hero-badge">
          <FontAwesomeIcon icon={faFire} pulse />
          <span>#1 Gaming Tournament Platform 2026</span>
        </div>
        <h1 className="hero-title">
          Compete, Conquer, 
          <span className="gradient-text"> Rise to Glory</span>
        </h1>
        <p className="hero-subtitle">
          Join the ultimate gaming tournament platform where champions are made.
          Compete in exciting tournaments, win amazing prizes, and prove your skills!
        </p>
        <div className="hero-buttons">
          <Link to="/tournaments" className="btn-primary">
            Explore Tournaments
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
          <Link to="/register" className="btn-outline">
            Get Started
            <FontAwesomeIcon icon={faRocket} />
          </Link>
        </div>
      </div>
    </div>
  </div>
  
  {/* Wave at the very bottom */}
  <div className="hero-wave">
    <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <path fill="#0f0f1a" fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,85.3C640,85,800,75,960,69.3C1120,64,1280,64,1360,64L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
    </svg>
  </div>
</section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose <span className="gradient-text">TournamentHub</span></h2>
            <p>The premier destination for competitive gaming</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div className="feature-card" key={index} style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="feature-icon" style={{ background: `${feature.color}20`, color: feature.color }}>
                  <FontAwesomeIcon icon={feature.icon} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tournaments */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured <span className="gradient-text">Tournaments</span></h2>
            <p>Check out our most popular upcoming events</p>
          </div>
          {loading ? (
            <div className="loading">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="tournaments-grid">
              {featuredTournaments.length > 0 ? (
                featuredTournaments.map((tournament, index) => (
                  <div key={tournament.id} className="fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <TournamentCard tournament={tournament} featured={index === 0} />
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <FontAwesomeIcon icon={faTrophy} />
                  <h3>No Tournaments Yet</h3>
                  <p>Check back soon for exciting tournaments!</p>
                </div>
              )}
            </div>
          )}
          {allTournaments.length > 3 && (
            <div className="view-all">
              <Link to="/tournaments" className="btn-outline">
                View All Tournaments
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Tournaments Banner - With Real Tournament Data */}
      {upcomingTournament && (
        <section className="upcoming-banner">
          <div className="container">
            <div className="banner-content">
              <div className="banner-text">
                <h3>
                  <FontAwesomeIcon icon={faCalendarAlt} /> 
                  Next Major Tournament
                </h3>
                <h2>{upcomingTournament.title}</h2>
                <p>
                  <FontAwesomeIcon icon={faTrophy} /> Prize: {upcomingTournament.prize} | 
                  <FontAwesomeIcon icon={faUsers} /> {upcomingTournament.players?.length || 0}/{upcomingTournament.maxPlayers} Players |
                  <FontAwesomeIcon icon={faGamepad} /> {upcomingTournament.game}
                </p>
                <Link to={`/tournaments/${upcomingTournament.id}`} className="btn-primary">
                  View Tournament Details
                  <FontAwesomeIcon icon={faArrowRight} />
                </Link>
              </div>
              <div className="banner-countdown">
                <div className="countdown-item">
                  <span>{String(timeLeft.days).padStart(2, '0')}</span>
                  <label>Days</label>
                </div>
                <div className="countdown-item">
                  <span>{String(timeLeft.hours).padStart(2, '0')}</span>
                  <label>Hours</label>
                </div>
                <div className="countdown-item">
                  <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <label>Minutes</label>
                </div>
                <div className="countdown-item">
                  <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <label>Seconds</label>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Journey?</h2>
            <p>Join {stats.players || 100}+ players competing for glory and prizes</p>
            <Link to="/register" className="btn-primary">
              Register Now
              <FontAwesomeIcon icon={faCrown} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;