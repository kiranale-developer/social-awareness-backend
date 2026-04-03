import db from '../config/database.js';

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



    await db.execute(
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

