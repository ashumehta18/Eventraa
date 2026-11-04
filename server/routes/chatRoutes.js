const express = require('express');
const router = express.Router();
const { chat, health } = require('../controllers/chatController');

// Chat endpoint
router.post('/message', chat);

// Health check
router.get('/health', health);

module.exports = router;
