import pool from "../config/database.js";
import validateEmail from "../utils/emailValidator.js";

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

