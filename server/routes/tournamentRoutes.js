const express = require('express');
const {
  getTournaments,
  getTournamentById,
  createTournament,
  joinTournament,
  updateTournament
} = require('../controllers/tournamentController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getTournaments);
router.get('/:id', getTournamentById);
router.post('/create', protect, admin, createTournament);
router.post('/join/:id', protect, joinTournament);
router.put('/:id', protect, admin, updateTournament);

module.exports = router;