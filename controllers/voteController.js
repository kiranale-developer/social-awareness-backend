import db from '../config/database.js';


// VOTE TO A CAMPAIGN AS A USER AND SHOWING THE TOTAL NUMBERS OF UPVOTES AND DOWNVOTES
export const voteToCampaign = async(req,res)=>{
    try{
        const user_id = req.user.id;
        const { campaign_id } = req.params;

        const { vote_type } = req.body;

        if (!user_id){
            return res.status(401).json({
                message: "Unauthorized User"
            });
        }

        await db.execute(
            `INSERT INTO votes (user_id, campaign_id, vote_type) VALUES (?,?,?) ON DUPLICATE KEY UPDATE
            vote_type = VALUES(vote_type)`,
            [user_id, campaign_id, vote_type]
        );

        const [countRows] = await db.execute(
            `SELECT
                COALESCE(SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END), 0) AS upvotes,
                COALESCE(SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END), 0) AS downvotes
             FROM votes
             WHERE campaign_id = ?`,
            [campaign_id]
        );

        res.status(200).json({
            message: "Vote Processed",
            upvotes: countRows[0].upvotes,
            downvotes: countRows[0].downvotes,
            userVote: vote_type
        });

    }
    catch (error){
        res.status(500).json({error:error.message});
    }
};


// user is not logged in but we can get the counts of votes for the each campaign
export const getCampaignVotes = async (req, res) => {
    try {
        const { campaign_id } = req.params;
        const user_id = req.user?.id || null;

        const [countRows] = await db.execute(
            `SELECT
                COALESCE(SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END), 0) AS upvotes,
                COALESCE(SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END), 0) AS downvotes
             FROM votes
             WHERE campaign_id = ?`,
            [campaign_id]
        );

        let userVote = null;
        if (user_id) {
            const [userRows] = await db.execute(
                `SELECT vote_type
                 FROM votes
                 WHERE user_id = ? AND campaign_id = ?`,
                [user_id, campaign_id]
            );

            if (userRows.length > 0) {
                userVote = userRows[0].vote_type;
            }
        }

        return res.status(200).json({
            upvotes: countRows[0].upvotes,
            downvotes: countRows[0].downvotes,
            userVote
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
