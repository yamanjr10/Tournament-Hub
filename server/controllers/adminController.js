const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTournaments = await Tournament.countDocuments();
    const totalMatches = await Match.countDocuments();
    const completedTournaments = await Tournament.countDocuments({ status: 'completed' });
    const ongoingTournaments = await Tournament.countDocuments({ status: 'ongoing' });
    
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentTournaments = await Tournament.find()
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const topPlayers = await User.find()
      .sort({ wins: -1 })
      .limit(10)
      .select('username wins losses totalMatches');
    
    res.json({
      stats: {
        totalUsers,
        totalTournaments,
        totalMatches,
        completedTournaments,
        ongoingTournaments
      },
      recentUsers,
      recentTournaments,
      topPlayers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    await Match.deleteMany({ tournamentId: tournament._id });
    await tournament.deleteOne();
    
    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, deleteTournament, getAllUsers, updateUserRole };