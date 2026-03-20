import express from 'express';
import { voteToCampaign, countVotes } from '../controllers/voteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// upvotes or downvotes to the campaign
router.post('/', protect, voteToCampaign);

// get counts of vote
router.get('/:campaign_id', countVotes);

export default router;