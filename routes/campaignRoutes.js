import express from 'express';
import { createCampaign, getCampaigns, approveCampaign } from '../controllers/campaignController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createCampaign);
router.get('/', getCampaigns);
router.put('/approve/:id', protect, approveCampaign);

export default router;