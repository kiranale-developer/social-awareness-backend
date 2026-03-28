import db from "../config/database.js";


// RECORD SUPPORT AMOUNT FORM USER TO THE CAMPAIGN
export const supportCampaign = async (req,res) => {

    try{
        const user_id = req.user.id;
        const { campaign_id } = req.params;
        const { amount } = req.body;

        if(!user_id){
            res.status(401).json({
                message: "Unauthorized User"
            });
        }
        await db.execute(
            `INSERT INTO supports (user_id, campaign_id, amount)
            VALUES (?, ?, ?)`,
            [user_id, campaign_id, amount]
        );

        return res.status(200).json({
            message: "Support Recorded Successfully"
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message});
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
            [campaign_id]
        );
        return res.status(200).json(rows[0]);
    }
    catch(error){
        return res.status(500).json({error:error.message});
    }
}

