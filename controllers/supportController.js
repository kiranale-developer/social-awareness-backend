import pool from '../config/database.js';

// GET SUPPORTS FOR A CAMPAIGN OWNED BY THE LOGGED-IN USER
export const getCampaignSupportsForOwner = async (req, res) => {
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
      `SELECT s.*, u.name AS user_name, u.email AS user_email
       FROM supports s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.campaign_id = ?
       ORDER BY s.created_at DESC`,
      [campaign_id],
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching campaign supports:', error.message);
    return res
      .status(500)
      .json({ success: false, message: 'Server error fetching supports.' });
  }
};

// RECORD SUPPORT AMOUNT FORM USER TO THE CAMPAIGN
export const supportCampaign = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { campaign_id } = req.params;
    const { amount } = req.body;

    if (!user_id) {
      return res.status(401).json({
        message: 'Unauthorized User',
      });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        message: 'Valid support amount is required',
      });
    }

    await pool.execute(
      `INSERT INTO supports (user_id, campaign_id, amount)
            VALUES (?, ?, ?)`,
      [user_id, campaign_id, amount],
    );

    return res.status(200).json({
      message: 'Support Recorded Successfully',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
