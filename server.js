import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { protect } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
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

// Test route
app.get('/', (req, res) => {
  res.send('API is Working');
});

//global error handler
app.use((err, req, res, next) => {
  if (err instanceof Error) {
    return res.status(400).json({
      error: err.message,
    });
  }

  next();
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
