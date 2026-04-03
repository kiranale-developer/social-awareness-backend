import express from 'express';
import {
  getMyCampaigns,
  updateMyCampaign,
  deleteMyCampaign,
  getMyCampaignInquiries,
  getMyCampaignSupports,
} from '../controllers/userController.js';


import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

//STATIC ROUTES
router.get("/my-campaigns", protect, getMyCampaigns);
router.get("/my-inquiries", protect, getMyCampaignInquiries);
router.get("/my-supports", protect, getMyCampaignSupports);



// UPDATE & DELETE BY USER
router.put('/my-campaigns/:campaign_id', protect, upload.single('image'), updateMyCampaign);
router.delete('/my-campaigns/:campaign_id', protect, deleteMyCampaign);


export default router;
