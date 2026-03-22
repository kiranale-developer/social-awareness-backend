import express from "express";
const router = express.Router();

import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

import { approveCampaign, deleteCampaign } from "../controllers/campaignController.js";


router.put("/approve/:id", protect, isAdmin, approveCampaign);
router.delete("/campaign/:id", protect, isAdmin, deleteCampaign);

export default router;