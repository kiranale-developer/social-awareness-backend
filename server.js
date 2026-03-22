import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import voteRoutes from './routes/voteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

import { protect } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.use('/api/protected', protect, (req, res) => {
  res.json({
    message: 'Protected data accessed',
    user: req.user,
  });
});

app.use('/api/campaigns', campaignRoutes);
app.use('/api/votes', voteRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('API is Working');
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
