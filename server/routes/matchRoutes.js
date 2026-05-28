const express = require('express');
const { getMatches, createMatches, updateMatchResult } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/', getMatches);
router.post('/create', protect, admin, createMatches);
router.put('/result/:id', protect, admin, updateMatchResult);

module.exports = router;