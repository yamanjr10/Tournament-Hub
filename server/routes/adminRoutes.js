const express = require('express');
const { getStats, deleteTournament, getAllUsers, updateUserRole } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/stats', protect, admin, getStats);
router.delete('/tournament/:id', protect, admin, deleteTournament);
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;