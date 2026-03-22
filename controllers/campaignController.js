import db from '../config/database.js';

import validateDates from '../utils/validateDates.js';
import validateImage from '../utils/validateImage.js';
import validateEmail from '../utils/emailValidator.js';

export const createCampaign = async (req, res) => {
  try {
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
    const user_id = req.user.id;

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

    const [result] = await db.execute(
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

export const updateCampaign = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;
    const user_role = req.user.role;

    const {
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
    } = req.body;

    //check campaign in database
    const [exist] = await db.execute(`SELECT * FROM campaigns WHERE id = ?`, [
      id,
    ]);

    if (exist.length === 0) {
      return res.status(404).json({ message: 'Campaign NOt Found' });
    }

    const campaign = exist[0];
    //Authorization Check
    if (user_role !== 'admin' && campaign.user_id !== user_id) {
      return res.status(403).json({
        message: 'Not authorized to update this camapaign',
      });
    }

    // if (status && status !== campaign.status) {
    //     if (req.user.role === "admin") {
    //         updatedStatus = status;
    //     } else {
    //  // not admin
    //         return res.status(403).json({ message: "Only admin can change campaign status" });
    //     }
    // }

    //image validation
    if (image_url && !validateImage(image_url)) {
      return res
        .status(400)
        .json({ message: 'Only JPG, JPEG, PNG images are allowed' });
    }
    if (start_date && end_date) {
      const dateCheck = validateDates(start_date, end_date);
      if (!dateCheck.valid) {
        return res.status(400).json({ message: dateCheck.message });
      }
    }

    // if everything oK

    await db.execute(
      `UPDATE campaigns 
             SET title=?, description=?, contact_email=?, location=?, category=?, campaign_type=?, goals=?, image_url=?, start_date=?, end_date=?
             WHERE id=?`,
      [
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
        id,
      ],
    );
    res.json({ message: 'Campaign Updated Successfully' });
  } catch (error) {
    res.status(500).json({ mesasge: 'Server Error' });
  }
};

export const getCampaigns = async (req, res) => {
  try {
    //take user id form token
    const user_id = req.user.id;
    const user_role = req.user.role;

    let get_query = 'SELECT * FROM campaigns';
    const params = [];

    //check the user whether admin or not
    //if not admin only show their campaigns
    if (user_role != 'admin') {
      get_query += ' WHERE user_id = ?';
      params.push(user_id);
    }

    const [campaigns] = await db.execute(get_query, params);

    res.json({
      total: campaigns.length,
      campaigns,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllCampaigns = async (req, res) => {
  try {
    const [campaigns] = await db.execute('SELECT * FROM campaigns');

    res.json({
      total: campaigns.length,
      campaigns,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const approveCampaign = async (req, res) => {
  try {
    const { id } = req.params;

    const [exist] = await db.execute('SELECT * FROM campaigns WHERE id = ?', [
      id,
    ]);

    if (exist.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    await db.execute("UPDATE campaigns SET status = 'approved' WHERE id = ?", [
      id,
    ]);

    res.json({ message: 'Campaign approved successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteCampaign = async (req, res) => {
  try {
    const { id } = req.params; // campaign id from URL
    const user_id = req.user.id;
    const user_role = req.user.role;

    // 1. Check if campaign exists
    const [rows] = await db.execute('SELECT * FROM campaigns WHERE id = ?', [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    const campaign = rows[0];

    // 2. Authorization check
    if (user_role !== 'admin' && campaign.user_id !== user_id) {
      return res
        .status(403)
        .json({ message: 'Unauthorized  to delete this campaign' });
    }

    // 3. Delete campaign
    await db.execute('DELETE FROM campaigns WHERE id = ?', [id]);

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
