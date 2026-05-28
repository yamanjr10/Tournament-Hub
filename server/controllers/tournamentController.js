const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const User = require('../models/User');

const getTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate('players', 'username')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTournamentById = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('players', 'username email wins losses')
      .populate('createdBy', 'username');
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const matches = await Match.find({ tournamentId: tournament._id })
      .populate('player1', 'username')
      .populate('player2', 'username')
      .populate('winner', 'username');
    
    res.json({ tournament, matches });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createTournament = async (req, res) => {
  try {
    const { title, game, description, prize, maxPlayers, startDate, imageUrl } = req.body;
    
    const tournament = await Tournament.create({
      title,
      game,
      description,
      prize,
      maxPlayers,
      startDate,
      imageUrl,
      createdBy: req.user._id
    });
    
    res.status(201).json(tournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const joinTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ message: 'Tournament is not open for registration' });
    }
    
    if (tournament.players.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already joined this tournament' });
    }
    
    if (tournament.players.length >= tournament.maxPlayers) {
      return res.status(400).json({ message: 'Tournament is full' });
    }
    
    tournament.players.push(req.user._id);
    await tournament.save();
    
    await User.findByIdAndUpdate(req.user._id, {
      $push: { tournamentsJoined: tournament._id }
    });
    
    res.json({ message: 'Successfully joined tournament', tournament });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const updatedTournament = await Tournament.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedTournament);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTournaments,
  getTournamentById,
  createTournament,
  joinTournament,
  updateTournament
};