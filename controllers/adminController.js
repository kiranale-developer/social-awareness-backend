import db from "../config/database.js";



//GET ALL CAMPAIGNS AND SELECT FILTER
export const getAllCampaigns = async (req, res) => {
  try {
    const { location = '', status, page = 1, limit = 10 } = req.query;

    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offsetNum = Math.max(0, (parseInt(page, 10) - 1) * limitNum);

    let sql = `SELECT * FROM campaigns WHERE 1=1`;
    const values = [];

    //filter camapigns by status
    if (status && status.trim() !== '') {
      sql += ` AND status = ?`;
      values.push(status.trim());
    }

    //filter cammapign by location
    if (location && location.trim() !== '') {
      sql += ` AND location LIKE ?`;
      values.push(`%${location.trim()}%`);
    }

    //pagination
    sql += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    values.push(limitNum, offsetNum);

    const [rows] = await db.query(sql, values);

    res.status(200).json({
      success: true,
      count: rows.length,
      page: parseInt(page),
      limit: limitNum,
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


// APPROVE CAMPAIGN BY ADMIN
export const adminApproveCampaign = async (req, res) => {
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

export const adminUpdateCampaign = async (req, res) => {
  try {
    
    const { campaign_id } = req.params;
   
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
       SET title=?, description=?, contact_email=?, location=?, category=?, campaign_type=?, goals=?, image_url=?, status, start_date=?, end_date=?
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
        status ?? campaign.status,
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




// DELETE ANY CAMPAIGN BY ADMIN
export const adminDeleteCampaign = async (req, res) => {
  try {
    const { id } = req.params; // campaign id from URL

    // 1. Check if campaign exists
    const [rows] = await db.execute('SELECT * FROM campaigns WHERE id = ?', [
      id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // 3. Delete campaign
    await db.execute('DELETE FROM campaigns WHERE id = ?', [id]);

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getAllInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const limitNum = parseInt(limit) || 10;
    const offset = (page - 1) * limitNum;

    const [rows] = await db.query(
      `SELECT ci.*, c.title AS campaign_title
       FROM campaign_inquiries ci
       JOIN campaigns c ON ci.campaign_id = c.id
       ORDER BY ci.created_at DESC
       LIMIT ? OFFSET ?`,
      [limitNum, offset]
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

export const getAllSupports = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const limitNum = parseInt(limit) || 10;
    const offset = (page - 1) * limitNum;

    const [rows] = await db.query(
      `SELECT s.*, c.title AS campaign_title
       FROM supports s
       JOIN campaigns c ON s.campaign_id = c.id
       ORDER BY s.created_at DESC
       LIMIT ? OFFSET ?`,
      [limitNum, offset]
    );

    res.status(200).json({
      success: true,
      data: rows,
    });

  } catch (error) {
    res.status(500).json({
      message: "Error fetching supports",
    });
  }
};

export const getAdminDashboard = async (req, res) => {
  try {
    const [[campaigns]] = await db.query(
      `SELECT COUNT(*) AS total FROM campaigns`
    );

    const [[inquiries]] = await db.query(
      `SELECT COUNT(*) AS total FROM campaign_inquiries`
    );

    const [[supports]] = await db.query(
      `SELECT COUNT(*) AS total FROM supports`
    );

    const [[totalAmount]] = await db.query(
      `SELECT SUM(amount) AS total FROM supports`
    );

    res.status(200).json({
      totalCampaigns: campaigns.total,
      totalInquiries: inquiries.total,
      totalSupports: supports.total,
      totalFunding: totalAmount.total || 0,
    });

  } catch (error) {
    res.status(500).json({
      message: "Dashboard error",
    });
  }
};