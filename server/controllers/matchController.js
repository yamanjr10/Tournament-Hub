const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const User = require('../models/User');

const getMatches = async (req, res) => {
  try {
    const matches = await Match.find()
      .populate('player1', 'username')
      .populate('player2', 'username')
      .populate('winner', 'username')
      .populate('tournamentId', 'title')
      .sort({ createdAt: -1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createMatches = async (req, res) => {
  try {
    const { tournamentId, players } = req.body;
    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }
    
    const matches = [];
    for (let i = 0; i < players.length; i += 2) {
      if (i + 1 < players.length) {
        const match = await Match.create({
          tournamentId,
          player1: players[i],
          player2: players[i + 1],
          round: 1,
          status: 'pending'
        });
        matches.push(match);
      }
    }
    
    tournament.status = 'ongoing';
    await tournament.save();
    
    res.status(201).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMatchResult = async (req, res) => {
  try {
    const { winnerId, score1, score2 } = req.body;
    const match = await Match.findById(req.params.id);
    
    if (!match) {
      return res.status(404).json({ message: 'Match not found' });
    }
    
    match.winner = winnerId;
    match.status = 'completed';
    match.score = { player1Score: score1, player2Score: score2 };
    await match.save();
    
    // Update user stats
    const winner = await User.findById(winnerId);
    winner.wins += 1;
    winner.totalMatches += 1;
    await winner.save();
    
    const loser = await User.findById(
      match.player1.toString() === winnerId ? match.player2 : match.player1
    );
    if (loser) {
      loser.losses += 1;
      loser.totalMatches += 1;
      await loser.save();
    }
    
    // Check if tournament is completed
    const tournament = await Tournament.findById(match.tournamentId);
    const allMatches = await Match.find({ tournamentId: tournament._id });
    const allCompleted = allMatches.every(m => m.status === 'completed');
    
    if (allCompleted) {
      tournament.status = 'completed';
      tournament.endDate = new Date();
      await tournament.save();
    }
    
    res.json(match);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMatches, createMatches, updateMatchResult };