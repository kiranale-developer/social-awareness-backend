import express from 'express';
import { createCampaign, getCampaigns, approveCampaign, updateCampaign , deleteCampaign } from '../controllers/campaignController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createCampaign);
router.put("/:id",protect, updateCampaign);
router.delete("/:id",protect, deleteCampaign);

router.get('/',protect, getCampaigns);
router.put('/approve/:id', protect, approveCampaign);


export default router;