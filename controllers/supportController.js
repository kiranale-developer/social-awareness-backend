import db from '../config/database.js';
import validateEmail from '../utils/emailValidator.js';

// RECORD SUPPORT AMOUNT FORM USER TO THE CAMPAIGN
export const supportCampaign = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { campaign_id } = req.params;
    const { amount, message } = req.body;

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

    const supportMessage = typeof message === 'string' ? message.trim() : null;

    await db.execute(
      `INSERT INTO supports (user_id, campaign_id, amount, message)
            VALUES (?, ?, ?, ?)`,
      [user_id, campaign_id, amount, supportMessage],
    );

    return res.status(200).json({
      message: 'Support Recorded Successfully',
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// GET TOTAL SUPPORT AMOUNT FOR THE SELECTED CAMPAIGN
export const getTotalSupportAmount = async (req, res) => {
  try {
    const { campaign_id } = req.params;

    const [rows] = await db.execute(
      `SELECT COALESCE(SUM(amount), 0) AS totalSupportAmount
            FROM supports
            WHERE campaign_id = ?`,
      [campaign_id],
    );
    return res.status(200).json(rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
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

    await db.execute(
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
