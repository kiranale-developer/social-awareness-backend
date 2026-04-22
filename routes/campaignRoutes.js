import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
  getPublicCampaigns,
  createCampaign,
} from '../controllers/campaignController.js';

import {
  voteToCampaign,
  getCampaignVotes,
} from '../controllers/voteController.js';

import {
  supportCampaign,
  getCampaignSupportsForOwner,
} from '../controllers/supportController.js';

import {
  inquiryCampaign,
  getCampaignInquiriesForOwner,
} from '../controllers/inquiryController.js';

const router = express.Router();

//PUBLIC ROUTES
router.get('/', getPublicCampaigns);
// CREATE CAMPAIGN BY USER
router.post('/create', protect, upload.single('image'), createCampaign);
// PUBLIC OR USER
router.get('/:campaign_id/votes', getCampaignVotes);

// USER ACTIONS
router.post('/:campaign_id/vote', protect, voteToCampaign);
router.post('/:campaign_id/support', protect, supportCampaign);
router.post('/:campaign_id/inquiry', protect, inquiryCampaign);

// OWNER-ONLY: view supports and inquiries for own campaign
router.get('/:campaign_id/my-supports', protect, getCampaignSupportsForOwner);
router.get('/:campaign_id/my-inquiries', protect, getCampaignInquiriesForOwner);

export default router;
