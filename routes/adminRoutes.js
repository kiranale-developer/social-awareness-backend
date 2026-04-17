import express from 'express';
const router = express.Router();

import { protect } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

import {
  adminApproveCampaign,
  getAllCampaigns,
  adminUpdateCampaign,
  adminDeleteCampaign,
  getAllSupports,
  getAllInquiries,
  getCampaignInquiries,
  getCampaignSupports,
  getAdminDashboard,
  getAllUsers,
} from '../controllers/adminController.js';

router.get('/users', protect, isAdmin, getAllUsers);
router.get('/campaigns', protect, isAdmin, getAllCampaigns);
router.get('/dashboard', protect, isAdmin, getAdminDashboard);
router.patch('/campaigns/approve/:id', protect, isAdmin, adminApproveCampaign);
router.delete('/campaigns/:id', protect, isAdmin, adminDeleteCampaign);
router.put('/campaigns/:id', protect, isAdmin, adminUpdateCampaign);
router.get('/campaigns/supports', protect, isAdmin, getAllSupports);
router.get('/campaigns/inquiries', protect, isAdmin, getAllInquiries);
router.get('/campaigns/:id/inquiries', protect, isAdmin, getCampaignInquiries);
router.get('/campaigns/:id/supports', protect, isAdmin, getCampaignSupports);

export default router;
