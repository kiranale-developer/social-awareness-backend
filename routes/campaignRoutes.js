import express from 'express';
import { createCampaign, getCampaigns, getAllCampaigns, approveCampaign, updateCampaign, deleteCampaign,} from '../controllers/campaignController.js';
import { voteToCampaign, getCampaignVotes } from '../controllers/voteController.js';
import { supportCampaign, getTotalSupportAmount} from '../controllers/supportController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();


//PUBLIC ROUTES
router.get('/', getAllCampaigns);
router.get('/:campaign_id/votes', getCampaignVotes);
router.get('/:campaign_id/supports', getTotalSupportAmount);

//PROTECTED ROUTES
router.post('/create', protect, upload.single('image'), createCampaign);
router.get('/my-campaigns', protect, getCampaigns);
//vote campaign from user
router.post('/:campaign_id/vote', protect, voteToCampaign);
//support to the campaign from user
router.post('/:campaign_id/support', protect, supportCampaign);


//Routes With IDs
router.put('/:campaign_id', protect, upload.single('image'), updateCampaign);
router.delete('/:campaign_id', protect, deleteCampaign);


//Admin/status Update
router.patch('/approve/:id', protect, approveCampaign);

export default router;
