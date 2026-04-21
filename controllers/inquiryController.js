import pool from '../config/database.js';
import validateEmail from '../utils/emailValidator.js';

// GET INQUIRIES FOR A CAMPAIGN OWNED BY THE LOGGED-IN USER
export const getCampaignInquiriesForOwner = async (req, res) => {
  try {
    const userId = req.user.id;
    const { campaign_id } = req.params;

    // Verify the campaign exists and belongs to this user
    const [campaigns] = await pool.execute(
      'SELECT id FROM campaigns WHERE id = ? AND user_id = ?',
      [campaign_id, userId],
    );

    if (campaigns.length === 0) {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden: not your campaign.' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM campaign_inquiries
       WHERE campaign_id = ?
       ORDER BY created_at DESC`,
      [campaign_id],
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching campaign inquiries:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Server error fetching inquiries.' });
  }
};

// RECORD INQUIRY FOR A CAMPAIGN
export const inquiryCampaign = async (req, res) => {
  try {
    const { campaign_id } = req.params;
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        message: 'Name, email, phone and message are required',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        message: 'Please Enter Valid Email',
      });
    }

    await pool.execute(
      `INSERT INTO campaign_inquiries (campaign_id, name, email, phone, message)
       VALUES (?, ?, ?, ?, ?)`,
      [
        campaign_id,
        String(name).trim(),
        String(email).trim(),
        String(phone).trim(),
        String(message).trim(),
      ],
    );

    return res.status(201).json({
      message: 'Inquiry submitted successfully',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
