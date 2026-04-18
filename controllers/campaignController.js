import pool from '../config/database.js';
import validateEmail from '../utils/emailValidator.js';
import validateDates from '../utils/validateDates.js';

// GET ONLY ACTIVE CAMPAIGNS WITH SEARCH AND FILTER
export const getPublicCampaigns = async (req, res) => {
  try {
    const { location = '', page = 1, limit = 10 } = req.query;

    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offsetNum = Math.max(0, (parseInt(page, 10) - 1) * limitNum);

    let sql = `SELECT * FROM campaigns WHERE status = 'active'`;
    const values = [];

    if (location && location.trim() !== '') {
      sql += ` AND location LIKE ?`;
      values.push(`%${location.trim()}%`);
    }

    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    values.push(limitNum, offsetNum);

    const [rows] = await pool.query(sql, values);

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching campaigns',
    });
  }
};

// CREATE CAMPAIGN
export const createCampaign = async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
      title,
      description,
      contact_email,
      location,
      category,
      campaign_type,
      goals,
      start_date,
      end_date,
    } = req.body;

    if (
      !title ||
      !description ||
      !contact_email ||
      !location ||
      !category ||
      !campaign_type ||
      !goals ||
      !start_date ||
      !end_date
    ) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    // Handle image upload or use provided image_url
    let image_url;
    if (req.file) {
      // File was uploaded, use the file path
      image_url = `/uploads/${req.file.filename}`;
    } else {
      // No file uploaded, return error (file is required now)
      return res.status(400).json({
        message: 'Image file is required',
      });
    }

    //check email validation
    if (!validateEmail(contact_email)) {
      return res.status(400).json({ message: 'Please Enter Valid Email' });
    }

    const dateCheck = validateDates(start_date, end_date);

    if (!dateCheck.valid) {
      return res.status(400).json({
        message: dateCheck.message,
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO campaigns (user_id, title, description, contact_email, location, category, campaign_type, goals, image_url, start_date, end_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        title,
        description,
        contact_email,
        location,
        category,
        campaign_type,
        goals,
        image_url,
        start_date,
        end_date,
      ],
    );

    res.status(201).json({
      message: 'Campaign created',
      campaignId: result.insertId,
      image_url: image_url,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
