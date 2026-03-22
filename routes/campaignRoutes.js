import express from 'express';
import { createCampaign, getCampaigns,getAllCampaigns, approveCampaign, updateCampaign , deleteCampaign } from '../controllers/campaignController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create', protect, createCampaign);
router.put("/:id",protect, updateCampaign);
router.delete("/:id",protect, deleteCampaign);

router.get('/my-campaigns',protect, getCampaigns);
router.get('/camapigns',getAllCampaigns);
router.put('/approve/:id', protect, approveCampaign);


export default router;