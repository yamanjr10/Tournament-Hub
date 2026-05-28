import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTrophy,
    faUsers,
    faGamepad,
    faPlus,
    faEdit,
    faTrash,
    faChartLine,
    faCalendarAlt,
    faDollarSign,
    faEye,
    faCheckCircle,
    faClock,
    faFire,
    faUserPlus,
    faUserMinus,
    faBan,
    faRefresh,
    faSearch,
    faFilter,
    faDownload,
    faBell,
    faCog,
    faDashboard,
    faList,
    faMedal,
    faAward,
    faCrown,
    faUser,
    faEnvelope,
    faPhone,
    faGlobe,
    faStar,
    faHeart,
    faShieldAlt,
    faTimes,
    faCheck,
    faSpinner,
    faArrowUp,
    faArrowDown,
    faRocket,
    faGavel,
    faBalanceScale,
    faWallet,
    faLevelUpAlt,
    faChartBar,
    faDatabase,
    faShieldVirus,
    faSave,
} from "@fortawesome/free-solid-svg-icons";
import "./Admin.css";

const Admin = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [tournaments, setTournaments] = useState([]);
    const [users, setUsers] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [activeTab, setActiveTab] = useState("overview");

    // Modal states
    const [showCreateTournament, setShowCreateTournament] = useState(false);
    const [showEditTournament, setShowEditTournament] = useState(false);
    const [showEditUser, setShowEditUser] = useState(false);
    const [showKickUser, setShowKickUser] = useState(false);
    const [showBoostRank, setShowBoostRank] = useState(false);
    const [showUpdateStats, setShowUpdateStats] = useState(false);
    const [selectedTournament, setSelectedTournament] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form states
    const [newTournament, setNewTournament] = useState({
        title: "",
        game: "",
        description: "",
        prize: "",
        maxPlayers: 16,
        startDate: "",
        imageUrl: "",
    });

    const [userStatsUpdate, setUserStatsUpdate] = useState({
        wins: 0,
        losses: 0,
        totalMatches: 0,
    });

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [tournamentsRes, usersRes, matchesRes] = await Promise.all([
                api.get("/tournaments"),
                api.get("/admin/users"),
                api.get("/matches"),
            ]);

            setTournaments(tournamentsRes.data || []);
            setUsers(usersRes.data || []);
            setMatches(matchesRes.data || []);

            const totalPlayers = tournamentsRes.data.reduce(
                (acc, t) => acc + (t.players?.length || 0),
                0,
            );
            const completedTournaments = tournamentsRes.data.filter(
                (t) => t.status === "completed",
            ).length;
            const ongoingTournaments = tournamentsRes.data.filter(
                (t) => t.status === "ongoing",
            ).length;
            const upcomingTournaments = tournamentsRes.data.filter(
                (t) => t.status === "upcoming",
            ).length;
            const totalPrize = tournamentsRes.data.reduce((acc, t) => {
                const prize = parseInt(t.prize?.replace(/[^0-9]/g, "") || 0);
                return acc + prize;
            }, 0);

            setStats({
                totalUsers: usersRes.data.length,
                totalTournaments: tournamentsRes.data.length,
                totalMatches: matchesRes.data.length,
                totalPlayers,
                completedTournaments,
                ongoingTournaments,
                upcomingTournaments,
                totalPrize,
                activeUsers: usersRes.data.filter(
                    (u) => u.tournamentsJoined?.length > 0,
                ).length,
                adminCount: usersRes.data.filter((u) => u.role === "admin")
                    .length,
                topPerformers: [...usersRes.data]
                    .sort((a, b) => (b.wins || 0) - (a.wins || 0))
                    .slice(0, 5),
            });
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    // ============ TOURNAMENT MANAGEMENT ============

    const handleCreateTournament = async (e) => {
        e.preventDefault();
        try {
            await api.post("/tournaments/create", newTournament);
            setShowCreateTournament(false);
            setNewTournament({
                title: "",
                game: "",
                description: "",
                prize: "",
                maxPlayers: 16,
                startDate: "",
                imageUrl: "",
            });
            fetchAdminData();
            alert("✅ Tournament created successfully!");
        } catch (error) {
            alert("❌ Failed to create tournament: " + error.message);
        }
    };

    const handleUpdateTournament = async (e) => {
        e.preventDefault();
        try {
            await api.put(
                `/tournaments/${selectedTournament.id}`,
                selectedTournament,
            );
            setShowEditTournament(false);
            setSelectedTournament(null);
            fetchAdminData();
            alert("✅ Tournament updated successfully!");
        } catch (error) {
            alert("❌ Failed to update tournament: " + error.message);
        }
    };

    const handleDeleteTournament = async (id, title) => {
        if (
            window.confirm(
                `⚠️ Are you sure you want to delete "${title}"? This action cannot be undone!`,
            )
        ) {
            try {
                await api.delete(`/admin/tournament/${id}`);
                fetchAdminData();
                alert("✅ Tournament deleted successfully");
            } catch (error) {
                alert("❌ Failed to delete tournament: " + error.message);
            }
        }
    };

    const handleUpdateTournamentStatus = async (id, newStatus) => {
        try {
            await api.put(`/tournaments/${id}`, { status: newStatus });
            fetchAdminData();
            alert(`✅ Tournament status updated to ${newStatus}`);
        } catch (error) {
            alert("❌ Failed to update status: " + error.message);
        }
    };

    // ============ USER MANAGEMENT ============

    const handleUpdateUserRole = async (userId, currentRole) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        if (
            window.confirm(
                `⚠️ Change user role from ${currentRole.toUpperCase()} to ${newRole.toUpperCase()}?`,
            )
        ) {
            try {
                await api.put(`/admin/users/${userId}/role`, { role: newRole });
                fetchAdminData();
                alert(`✅ User role updated to ${newRole}`);
            } catch (error) {
                alert("❌ Failed to update role: " + error.message);
            }
        }
    };

    const handleKickUser = async () => {
        if (!selectedUser) return;
        if (
            window.confirm(
                `⚠️ Are you sure you want to KICK "${selectedUser.username}"? They will lose access to all tournaments!`,
            )
        ) {
            try {
                // Remove user from all tournaments
                for (const tournament of tournaments) {
                    if (tournament.players?.includes(selectedUser.uid)) {
                        const updatedPlayers = tournament.players.filter(
                            (p) => p !== selectedUser.uid,
                        );
                        await api.put(`/tournaments/${tournament.id}`, {
                            players: updatedPlayers,
                        });
                    }
                }
                // Update user role to banned
                await api.put(`/admin/users/${selectedUser.id}/role`, {
                    role: "banned",
                });
                setShowKickUser(false);
                setSelectedUser(null);
                fetchAdminData();
                alert(
                    `✅ User "${selectedUser.username}" has been kicked and banned!`,
                );
            } catch (error) {
                alert("❌ Failed to kick user: " + error.message);
            }
        }
    };

    const handleBoostRank = async () => {
        if (!selectedUser) return;
        const newWins = selectedUser.wins + 10;
        const newTotalMatches = selectedUser.totalMatches + 10;
        const winRate = ((newWins / newTotalMatches) * 100).toFixed(1);

        if (
            window.confirm(
                `⚠️ Boost "${selectedUser.username}" rank? This will add +10 wins and +10 matches.`,
            )
        ) {
            try {
                await api.put(`/admin/users/${selectedUser.id}/stats`, {
                    wins: newWins,
                    totalMatches: newTotalMatches,
                    winRate: winRate,
                });
                setShowBoostRank(false);
                setSelectedUser(null);
                fetchAdminData();
                alert(`✅ User "${selectedUser.username}" rank boosted!`);
            } catch (error) {
                alert("❌ Failed to boost rank: " + error.message);
            }
        }
    };

    const handleUpdateUserStats = async () => {
        if (!selectedUser) return;
        if (window.confirm(`⚠️ Update stats for "${selectedUser.username}"?`)) {
            try {
                await api.put(`/admin/users/${selectedUser.id}/stats`, {
                    wins: userStatsUpdate.wins,
                    losses: userStatsUpdate.losses,
                    totalMatches: userStatsUpdate.wins + userStatsUpdate.losses,
                });
                setShowUpdateStats(false);
                setSelectedUser(null);
                setUserStatsUpdate({ wins: 0, losses: 0, totalMatches: 0 });
                fetchAdminData();
                alert(`✅ User stats updated successfully!`);
            } catch (error) {
                alert("❌ Failed to update stats: " + error.message);
            }
        }
    };

    const handleResetUserPassword = async (userId, email) => {
        if (
            window.confirm(
                `⚠️ Reset password for user? They will receive an email to set a new password.`,
            )
        ) {
            try {
                await api.post(`/admin/users/${userId}/reset-password`, {
                    email,
                });
                alert(`✅ Password reset email sent to ${email}`);
            } catch (error) {
                alert("❌ Failed to reset password: " + error.message);
            }
        }
    };

    // ============ MATCH MANAGEMENT ============

    const handleGenerateMatches = async (tournamentId) => {
        const tournament = tournaments.find((t) => t.id === tournamentId);
        if (!tournament || tournament.players.length < 2) {
            alert("Need at least 2 players to generate matches");
            return;
        }

        if (window.confirm(`Generate matches for "${tournament.title}"?`)) {
            try {
                await api.post("/matches/generate", {
                    tournamentId,
                    players: tournament.players,
                });
                fetchAdminData();
                alert("✅ Matches generated successfully!");
            } catch (error) {
                alert("❌ Failed to generate matches: " + error.message);
            }
        }
    };

    const handleUpdateMatchResult = async (
        matchId,
        winnerId,
        score1,
        score2,
    ) => {
        try {
            await api.put(`/matches/result/${matchId}`, {
                winnerId,
                score1,
                score2,
            });
            fetchAdminData();
            alert("✅ Match result updated!");
        } catch (error) {
            alert("❌ Failed to update match: " + error.message);
        }
    };

    // ============ STATS MANAGEMENT ============

    const handleResetAllData = async () => {
        if (
            window.confirm(
                `⚠️⚠️⚠️ DANGER: This will reset ALL data! Tournaments, Users, Matches will be deleted. This cannot be undone! Type "CONFIRM" to proceed.`,
            )
        ) {
            const confirmText = prompt('Type "CONFIRM" to reset all data:');
            if (confirmText === "CONFIRM") {
                try {
                    await api.post("/admin/reset-all");
                    fetchAdminData();
                    alert("✅ All data has been reset!");
                } catch (error) {
                    alert("❌ Failed to reset data: " + error.message);
                }
            }
        }
    };

    const getRankBadge = (wins, losses) => {
        const total = wins + losses;
        if (total === 0)
            return { rank: "Unranked", color: "#6c6c7a", icon: faMedal };
        const winRate = (wins / total) * 100;
        if (winRate >= 70)
            return { rank: "Diamond", color: "#00b4d8", icon: faCrown };
        if (winRate >= 50)
            return { rank: "Platinum", color: "#48cae4", icon: faMedal };
        if (winRate >= 30)
            return { rank: "Gold", color: "#f1c40f", icon: faAward };
        return { rank: "Silver", color: "#95a5a6", icon: faStar };
    };

    const getStatusBadge = (status) => {
        const configs = {
            upcoming: {
                label: "Upcoming",
                icon: faClock,
                color: "#f39c12",
                bg: "rgba(243,156,18,0.15)",
            },
            ongoing: {
                label: "Live",
                icon: faFire,
                color: "#e74c3c",
                bg: "rgba(231,76,60,0.15)",
            },
            completed: {
                label: "Completed",
                icon: faCheckCircle,
                color: "#27ae60",
                bg: "rgba(39,174,96,0.15)",
            },
        };
        const config = configs[status] || configs.upcoming;
        return (
            <span
                className="status-badge"
                style={{ background: config.bg, color: config.color }}
            >
                <FontAwesomeIcon icon={config.icon} />
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>Loading admin dashboard...</p>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <div className="container">
                    <div className="admin-header-content">
                        <div className="admin-title">
                            <h1>
                                <FontAwesomeIcon icon={faShieldAlt} /> Admin
                                Control Center
                            </h1>
                            <p>
                                Welcome back,{" "}
                                <span className="gradient-text">
                                    {user?.username}
                                </span>
                                ! You have full control over the platform.
                            </p>
                        </div>
                        <div className="admin-header-actions">
                            <button
                                className="refresh-btn"
                                onClick={fetchAdminData}
                            >
                                <FontAwesomeIcon icon={faRefresh} /> Refresh
                            </button>
                            <button
                                className="danger-btn"
                                onClick={handleResetAllData}
                            >
                                <FontAwesomeIcon icon={faBan} /> Reset All Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Tab Navigation */}
                <div className="admin-tabs">
                    <button
                        className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
                        onClick={() => setActiveTab("overview")}
                    >
                        <FontAwesomeIcon icon={faChartLine} /> Overview
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "tournaments" ? "active" : ""}`}
                        onClick={() => setActiveTab("tournaments")}
                    >
                        <FontAwesomeIcon icon={faTrophy} /> Tournaments
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
                        onClick={() => setActiveTab("users")}
                    >
                        <FontAwesomeIcon icon={faUsers} /> Users
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "matches" ? "active" : ""}`}
                        onClick={() => setActiveTab("matches")}
                    >
                        <FontAwesomeIcon icon={faGamepad} /> Matches
                    </button>
                    <button
                        className={`tab-btn ${activeTab === "control" ? "active" : ""}`}
                        onClick={() => setActiveTab("control")}
                    >
                        <FontAwesomeIcon icon={faGavel} /> Control Panel
                    </button>
                </div>

                {/* Overview Tab */}
                {activeTab === "overview" && stats && (
                    <div className="overview-tab">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon users">
                                    <FontAwesomeIcon icon={faUsers} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.totalUsers}</h3>
                                    <p>Total Users</p>
                                    <span className="stat-trend">
                                        {stats.activeUsers} active
                                    </span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon tournaments">
                                    <FontAwesomeIcon icon={faTrophy} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.totalTournaments}</h3>
                                    <p>Tournaments</p>
                                    <span className="stat-trend">
                                        {stats.ongoingTournaments} ongoing
                                    </span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon matches">
                                    <FontAwesomeIcon icon={faGamepad} />
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.totalMatches}</h3>
                                    <p>Total Matches</p>
                                    <span className="stat-trend">
                                        {stats.completedTournaments} completed
                                    </span>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon prize">
                                    <FontAwesomeIcon icon={faDollarSign} />
                                </div>
                                <div className="stat-info">
                                    <h3>
                                        ${stats.totalPrize.toLocaleString()}
                                    </h3>
                                    <p>Total Prize Pool</p>
                                    <span className="stat-trend">
                                        Across all tournaments
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="status-breakdown">
                            <h3>
                                <FontAwesomeIcon icon={faChartBar} /> Tournament
                                Status
                            </h3>
                            <div className="status-item">
                                <div className="status-label">
                                    <FontAwesomeIcon icon={faClock} />
                                    <span>Upcoming</span>
                                    <strong>{stats.upcomingTournaments}</strong>
                                </div>
                                <div className="status-bar">
                                    <div
                                        className="bar-fill upcoming"
                                        style={{
                                            width: `${(stats.upcomingTournaments / stats.totalTournaments) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div className="status-item">
                                <div className="status-label">
                                    <FontAwesomeIcon icon={faFire} />
                                    <span>Ongoing</span>
                                    <strong>{stats.ongoingTournaments}</strong>
                                </div>
                                <div className="status-bar">
                                    <div
                                        className="bar-fill ongoing"
                                        style={{
                                            width: `${(stats.ongoingTournaments / stats.totalTournaments) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                            <div className="status-item">
                                <div className="status-label">
                                    <FontAwesomeIcon icon={faCheckCircle} />
                                    <span>Completed</span>
                                    <strong>
                                        {stats.completedTournaments}
                                    </strong>
                                </div>
                                <div className="status-bar">
                                    <div
                                        className="bar-fill completed"
                                        style={{
                                            width: `${(stats.completedTournaments / stats.totalTournaments) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="top-performers">
                            <h3>
                                <FontAwesomeIcon icon={faCrown} /> Top
                                Performers
                            </h3>
                            <div className="performers-grid">
                                {stats.topPerformers.map((performer, index) => {
                                    const rankInfo = getRankBadge(
                                        performer.wins || 0,
                                        performer.losses || 0,
                                    );
                                    return (
                                        <div
                                            key={index}
                                            className="performer-card"
                                        >
                                            <div className="performer-rank">
                                                #{index + 1}
                                            </div>
                                            <div className="performer-avatar">
                                                <FontAwesomeIcon
                                                    icon={faUser}
                                                />
                                            </div>
                                            <div className="performer-info">
                                                <h4>{performer.username}</h4>
                                                <div className="performer-stats">
                                                    <span>
                                                        <FontAwesomeIcon
                                                            icon={faTrophy}
                                                        />{" "}
                                                        {performer.wins || 0}{" "}
                                                        wins
                                                    </span>
                                                    <span>
                                                        <FontAwesomeIcon
                                                            icon={faChartLine}
                                                        />{" "}
                                                        {(
                                                            (performer.wins /
                                                                (performer.wins +
                                                                    performer.losses ||
                                                                    1)) *
                                                            100
                                                        ).toFixed(1)}
                                                        % WR
                                                    </span>
                                                    <span
                                                        style={{
                                                            color: rankInfo.color,
                                                        }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={rankInfo.icon}
                                                        />{" "}
                                                        {rankInfo.rank}
                                                    </span>
                                                </div>
                                            </div>
                                            {index === 0 && (
                                                <div className="crown-badge">
                                                    <FontAwesomeIcon
                                                        icon={faCrown}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tournaments Tab */}
                {activeTab === "tournaments" && (
                    <div className="tournaments-tab">
                        <div className="table-filters">
                            <div className="search-box">
                                <FontAwesomeIcon icon={faSearch} />
                                <input
                                    type="text"
                                    placeholder="Search tournaments..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <div className="filter-box">
                                <FontAwesomeIcon icon={faFilter} />
                                <select
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(e.target.value)
                                    }
                                >
                                    <option value="all">All Status</option>
                                    <option value="upcoming">Upcoming</option>
                                    <option value="ongoing">Ongoing</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <button
                                className="create-btn"
                                onClick={() => setShowCreateTournament(true)}
                            >
                                <FontAwesomeIcon icon={faPlus} /> Create
                                Tournament
                            </button>
                        </div>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Game</th>
                                        <th>Prize</th>
                                        <th>Status</th>
                                        <th>Players</th>
                                        <th>Start Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tournaments
                                        .filter(
                                            (t) =>
                                                t.title
                                                    .toLowerCase()
                                                    .includes(
                                                        searchTerm.toLowerCase(),
                                                    ) &&
                                                (filterStatus === "all" ||
                                                    t.status === filterStatus),
                                        )
                                        .map((tournament) => (
                                            <tr key={tournament.id}>
                                                <td>
                                                    <strong>
                                                        {tournament.title}
                                                    </strong>
                                                </td>
                                                <td>{tournament.game}</td>
                                                <td className="prize-cell">
                                                    {tournament.prize}
                                                </td>
                                                <td>
                                                    <select
                                                        value={
                                                            tournament.status
                                                        }
                                                        onChange={(e) =>
                                                            handleUpdateTournamentStatus(
                                                                tournament.id,
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="status-select"
                                                    >
                                                        <option value="upcoming">
                                                            Upcoming
                                                        </option>
                                                        <option value="ongoing">
                                                            Ongoing
                                                        </option>
                                                        <option value="completed">
                                                            Completed
                                                        </option>
                                                    </select>
                                                </td>
                                                <td>
                                                    {tournament.players
                                                        ?.length || 0}
                                                    /{tournament.maxPlayers}
                                                </td>
                                                <td>
                                                    {new Date(
                                                        tournament.startDate,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="actions-cell">
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => {
                                                            setSelectedTournament(
                                                                tournament,
                                                            );
                                                            setShowEditTournament(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faEdit}
                                                        />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() =>
                                                            handleDeleteTournament(
                                                                tournament.id,
                                                                tournament.title,
                                                            )
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faTrash}
                                                        />
                                                    </button>
                                                    <button
                                                        className="action-btn generate"
                                                        onClick={() =>
                                                            handleGenerateMatches(
                                                                tournament.id,
                                                            )
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faGamepad}
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Users Tab with Full Control */}
                {activeTab === "users" && (
                    <div className="users-tab">
                        <div className="users-stats">
                            <div className="user-stat-card">
                                <FontAwesomeIcon icon={faUsers} />
                                <div>
                                    <h4>{users.length}</h4>
                                    <p>Total Registered</p>
                                </div>
                            </div>
                            <div className="user-stat-card">
                                <FontAwesomeIcon icon={faUserPlus} />
                                <div>
                                    <h4>
                                        {
                                            users.filter(
                                                (u) =>
                                                    u.tournamentsJoined
                                                        ?.length > 0,
                                            ).length
                                        }
                                    </h4>
                                    <p>Active Players</p>
                                </div>
                            </div>
                            <div className="user-stat-card">
                                <FontAwesomeIcon icon={faCrown} />
                                <div>
                                    <h4>
                                        {
                                            users.filter(
                                                (u) => u.role === "admin",
                                            ).length
                                        }
                                    </h4>
                                    <p>Administrators</p>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>W/L</th>
                                        <th>Win Rate</th>
                                        <th>Rank</th>
                                        <th>Tournaments</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((userData) => {
                                        const rankInfo = getRankBadge(
                                            userData.wins || 0,
                                            userData.losses || 0,
                                        );
                                        const winRate =
                                            userData.wins + userData.losses > 0
                                                ? (
                                                      (userData.wins /
                                                          (userData.wins +
                                                              userData.losses)) *
                                                      100
                                                  ).toFixed(1)
                                                : 0;
                                        return (
                                            <tr key={userData.id}>
                                                <td>
                                                    <div className="user-cell">
                                                        <div className="user-avatar">
                                                            <FontAwesomeIcon
                                                                icon={faUser}
                                                            />
                                                        </div>
                                                        <strong>
                                                            {userData.username}
                                                        </strong>
                                                    </div>
                                                </td>
                                                <td>{userData.email}</td>
                                                <td>
                                                    <span
                                                        className={`role-badge ${userData.role}`}
                                                    >
                                                        {userData.role ===
                                                        "admin" ? (
                                                            <>
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faCrown
                                                                    }
                                                                />{" "}
                                                                Admin
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faUser
                                                                    }
                                                                />{" "}
                                                                User
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="win-cell">
                                                        {userData.wins || 0}
                                                    </span>{" "}
                                                    /{" "}
                                                    <span className="loss-cell">
                                                        {userData.losses || 0}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="winrate-cell">
                                                        <div className="winrate-bar">
                                                            <div
                                                                className="winrate-fill"
                                                                style={{
                                                                    width: `${winRate}%`,
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span>{winRate}%</span>
                                                    </div>
                                                </td>
                                                <td
                                                    style={{
                                                        color: rankInfo.color,
                                                    }}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={rankInfo.icon}
                                                    />{" "}
                                                    {rankInfo.rank}
                                                </td>
                                                <td>
                                                    {userData.tournamentsJoined
                                                        ?.length || 0}
                                                </td>
                                                <td className="actions-cell">
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => {
                                                            setSelectedUser(
                                                                userData,
                                                            );
                                                            setUserStatsUpdate({
                                                                wins:
                                                                    userData.wins ||
                                                                    0,
                                                                losses:
                                                                    userData.losses ||
                                                                    0,
                                                                totalMatches:
                                                                    (userData.wins ||
                                                                        0) +
                                                                    (userData.losses ||
                                                                        0),
                                                            });
                                                            setShowUpdateStats(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faChartLine}
                                                            title="Edit Stats"
                                                        />
                                                    </button>
                                                    <button
                                                        className="action-btn boost"
                                                        onClick={() => {
                                                            setSelectedUser(
                                                                userData,
                                                            );
                                                            setShowBoostRank(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faLevelUpAlt}
                                                            title="Boost Rank"
                                                        />
                                                    </button>
                                                    <button
                                                        className="action-btn kick"
                                                        onClick={() => {
                                                            setSelectedUser(
                                                                userData,
                                                            );
                                                            setShowKickUser(
                                                                true,
                                                            );
                                                        }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={faBan}
                                                            title="Kick User"
                                                        />
                                                    </button>
                                                    <button
                                                        className="action-btn role"
                                                        onClick={() =>
                                                            handleUpdateUserRole(
                                                                userData.id,
                                                                userData.role,
                                                            )
                                                        }
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={
                                                                userData.role ===
                                                                "admin"
                                                                    ? faUserMinus
                                                                    : faUserPlus
                                                            }
                                                            title="Toggle Role"
                                                        />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Control Panel Tab */}
                {activeTab === "control" && (
                    <div className="control-tab">
                        <div className="control-grid">
                            <div className="control-card">
                                <div className="control-icon">
                                    <FontAwesomeIcon icon={faDatabase} />
                                </div>
                                <h3>Database Management</h3>
                                <p>Export, backup, or reset database</p>
                                <div className="control-buttons">
                                    <button
                                        className="control-btn"
                                        onClick={() =>
                                            alert("Export feature coming soon")
                                        }
                                    >
                                        <FontAwesomeIcon icon={faDownload} />{" "}
                                        Export Data
                                    </button>
                                    <button
                                        className="control-btn danger"
                                        onClick={handleResetAllData}
                                    >
                                        <FontAwesomeIcon icon={faBan} /> Reset
                                        All
                                    </button>
                                </div>
                            </div>
                            <div className="control-card">
                                <div className="control-icon">
                                    <FontAwesomeIcon icon={faBalanceScale} />
                                </div>
                                <h3>System Settings</h3>
                                <p>Configure platform settings</p>
                                <div className="control-buttons">
                                    <button
                                        className="control-btn"
                                        onClick={() =>
                                            alert("Settings panel coming soon")
                                        }
                                    >
                                        <FontAwesomeIcon icon={faCog} />{" "}
                                        Configure
                                    </button>
                                </div>
                            </div>
                            <div className="control-card">
                                <div className="control-icon">
                                    <FontAwesomeIcon icon={faShieldVirus} />
                                </div>
                                <h3>Security</h3>
                                <p>Manage security settings</p>
                                <div className="control-buttons">
                                    <button
                                        className="control-btn"
                                        onClick={() =>
                                            alert("Security panel coming soon")
                                        }
                                    >
                                        <FontAwesomeIcon icon={faShieldAlt} />{" "}
                                        Security Settings
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateTournament && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowCreateTournament(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>
                                <FontAwesomeIcon icon={faPlus} /> Create
                                Tournament
                            </h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowCreateTournament(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTournament}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={newTournament.title}
                                    onChange={(e) =>
                                        setNewTournament({
                                            ...newTournament,
                                            title: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Game</label>
                                    <input
                                        type="text"
                                        value={newTournament.game}
                                        onChange={(e) =>
                                            setNewTournament({
                                                ...newTournament,
                                                game: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Prize</label>
                                    <input
                                        type="text"
                                        value={newTournament.prize}
                                        onChange={(e) =>
                                            setNewTournament({
                                                ...newTournament,
                                                prize: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    rows="3"
                                    value={newTournament.description}
                                    onChange={(e) =>
                                        setNewTournament({
                                            ...newTournament,
                                            description: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Max Players</label>
                                    <input
                                        type="number"
                                        value={newTournament.maxPlayers}
                                        onChange={(e) =>
                                            setNewTournament({
                                                ...newTournament,
                                                maxPlayers: parseInt(
                                                    e.target.value,
                                                ),
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="datetime-local"
                                        value={newTournament.startDate}
                                        onChange={(e) =>
                                            setNewTournament({
                                                ...newTournament,
                                                startDate: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="submit-btn">
                                    <FontAwesomeIcon icon={faCheck} /> Create
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() =>
                                        setShowCreateTournament(false)
                                    }
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditTournament && selectedTournament && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowEditTournament(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>
                                <FontAwesomeIcon icon={faEdit} /> Edit
                                Tournament
                            </h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowEditTournament(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateTournament}>
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    value={selectedTournament.title}
                                    onChange={(e) =>
                                        setSelectedTournament({
                                            ...selectedTournament,
                                            title: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Game</label>
                                    <input
                                        type="text"
                                        value={selectedTournament.game}
                                        onChange={(e) =>
                                            setSelectedTournament({
                                                ...selectedTournament,
                                                game: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Prize</label>
                                    <input
                                        type="text"
                                        value={selectedTournament.prize}
                                        onChange={(e) =>
                                            setSelectedTournament({
                                                ...selectedTournament,
                                                prize: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    rows="3"
                                    value={selectedTournament.description}
                                    onChange={(e) =>
                                        setSelectedTournament({
                                            ...selectedTournament,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="submit-btn">
                                    <FontAwesomeIcon icon={faSave} /> Save
                                    Changes
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowEditTournament(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showKickUser && selectedUser && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowKickUser(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>
                                <FontAwesomeIcon icon={faBan} /> Kick User
                            </h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowKickUser(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>
                                Are you sure you want to kick{" "}
                                <strong>{selectedUser.username}</strong>?
                            </p>
                            <p>This will:</p>
                            <ul>
                                <li>Remove them from all tournaments</li>
                                <li>Ban their account</li>
                                <li>
                                    Prevent them from joining future tournaments
                                </li>
                            </ul>
                        </div>
                        <div className="modal-buttons">
                            <button
                                className="submit-btn danger"
                                onClick={handleKickUser}
                            >
                                <FontAwesomeIcon icon={faBan} /> Confirm Kick
                            </button>
                            <button
                                className="cancel-btn"
                                onClick={() => setShowKickUser(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showBoostRank && selectedUser && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowBoostRank(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>
                                <FontAwesomeIcon icon={faLevelUpAlt} /> Boost
                                Rank
                            </h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowBoostRank(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>
                                Boost <strong>{selectedUser.username}</strong>{" "}
                                rank?
                            </p>
                            <p>This will add:</p>
                            <ul>
                                <li>+10 Wins</li>
                                <li>+10 Total Matches</li>
                                <li>Improved Win Rate</li>
                            </ul>
                        </div>
                        <div className="modal-buttons">
                            <button
                                className="submit-btn"
                                onClick={handleBoostRank}
                            >
                                <FontAwesomeIcon icon={faRocket} /> Boost Rank
                            </button>
                            <button
                                className="cancel-btn"
                                onClick={() => setShowBoostRank(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showUpdateStats && selectedUser && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowUpdateStats(false)}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h2>
                                <FontAwesomeIcon icon={faChartLine} /> Update
                                Stats
                            </h2>
                            <button
                                className="close-btn"
                                onClick={() => setShowUpdateStats(false)}
                            >
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateUserStats();
                            }}
                        >
                            <div className="form-group">
                                <label>Wins</label>
                                <input
                                    type="number"
                                    value={userStatsUpdate.wins}
                                    onChange={(e) =>
                                        setUserStatsUpdate({
                                            ...userStatsUpdate,
                                            wins: parseInt(e.target.value),
                                        })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label>Losses</label>
                                <input
                                    type="number"
                                    value={userStatsUpdate.losses}
                                    onChange={(e) =>
                                        setUserStatsUpdate({
                                            ...userStatsUpdate,
                                            losses: parseInt(e.target.value),
                                        })
                                    }
                                />
                            </div>
                            <div className="modal-buttons">
                                <button type="submit" className="submit-btn">
                                    <FontAwesomeIcon icon={faSave} /> Update
                                    Stats
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowUpdateStats(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;
