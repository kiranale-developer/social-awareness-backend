import db from '../config/database.js';

import validateDates from '../utils/validateDates.js';
import validateImage from '../utils/validateImage.js';

export const createCampaign = async (req, res) => {
    try {

        const { title, description, location, image_url, start_date, end_date } = req.body;
        const user_id = req.user.id;

        if (!title || !description || !location || !start_date || !end_date || !image_url) {
            return res.status(400).json({
                message:"All fields are required"
            });

        }

        if (!validateImage(image_url)) {
            return res.status(400).json({
                message: "Only JPG, JPEG, PNG images are allowed"
        });
        }


        const dateCheck = validateDates(start_date, end_date);

        if (!dateCheck.valid) {
            return res.status(400).json({
            message: dateCheck.message
        });
        }

        const [result] = await db.execute(
            `INSERT INTO campaigns (user_id, title, description, location, image_url, start_date, end_date)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [user_id, title, description, location, image_url, start_date, end_date]
        );

        res.status(201).json({
            message: "Campaign created",
            campaignId: result.insertId
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getCampaigns = async (req, res) => {
    try {

        const [rows] = await db.execute("SELECT * FROM campaigns");

        res.json(rows);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const approveCampaign = async (req, res) => {
    try {

        const { id } = req.params;

        await db.execute(
            "UPDATE campaigns SET status='active' WHERE id=?",
            [id]
        );

        res.json({ message: "Campaign approved" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};