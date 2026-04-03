import db from '../config/database.js';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import validateDates from '../utils/validateDates.js';
import validateEmail from '../utils/emailValidator.js';




// UPDATE CAMPAIGN
export const updateMyCampaign = async (req, res) => {
  try {
    
    const { campaign_id } = req.params;
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
      status,
      start_date,
      end_date,
    } = req.body;

    //check campaign in database
    const [exist] = await db.execute(`SELECT * FROM campaigns WHERE id = ?`, [
      campaign_id]);
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

  
    let image_url;
    //check image upload and replace old one by deleting it
    //normal IF-ELSE case
    if (req.file){
      image_url = `/uploads/${req.file.filename}`;
    }
    else {
      image_url = campaign.image_url;
    }
  

    if (req.file && campaign.image_url) {
      //get the file path for old file
      const oldPath = path.join("uploads", path.basename(campaign.image_url));
      // }  delete the old file 
     if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

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
        title ?? campaign.title,
        description ?? campaign.description,
        contact_email ?? campaign.contact_email,
        location ?? campaign.location,
        category ?? campaign.category,
        campaign_type ?? campaign.campaign_type,
        goals ?? campaign.goals,
        image_url,
        start_date ?? campaign.start_date,
        end_date ?? campaign.end_date,
        campaign_id,
      ]
    );
    
    res.json({ message: 'Campaign Updated Successfully', image_url});
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// GET MY CAMPAIGNS
export const getMyCampaigns = async (req, res) => {
  try {
    //take user id form token
    const user_id = req.user.id;
    const user_role = req.user.role;

    let get_query = 'SELECT * FROM campaigns ';
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




// DELETE CAMPAIGN
export const deleteMyCampaign = async (req, res) => {
  try {
    const { campaign_id } = req.params; // campaign id from URL
    const user_id = req.user.id;


    const [rows] = await db.execute('SELECT * FROM campaigns WHERE id = ? AND user_id = ?', [
      campaign_id, user_id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }


    await db.execute('DELETE FROM campaigns WHERE id = ? AND user_id = ?', [campaign_id,user_id]);

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getMyCampaignInquiries = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const limitNum = parseInt(limit) || 10;
    const offset = (page - 1) * limitNum;

    const [rows] = await db.query(
      `SELECT ci.*, c.title AS campaign_title
       FROM campaign_inquiries ci
       JOIN campaigns c ON ci.campaign_id = c.id
       WHERE c.user_id = ?
       ORDER BY ci.created_at DESC
       LIMIT ? OFFSET ?`,
      [user_id, limitNum, offset]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching inquiries",
    });
  }
};


export const getMyCampaignSupports = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [rows] = await db.query(
      `SELECT 
          c.id AS campaign_id,
          c.title AS campaign_title,
          COUNT(s.id) AS total_supports,
          COALESCE(SUM(s.amount), 0) AS total_amount
       FROM campaigns c
       LEFT JOIN supports s ON s.campaign_id = c.id
       WHERE c.user_id = ?
       GROUP BY c.id, c.title
       ORDER BY c.created_at DESC`,
      [user_id]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error fetching support summary",
    });
  }
};
