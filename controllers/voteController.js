import db from '../config/database.js';

export const voteToCampaign = async(req,res)=>{
    try{
        const user_id = req.user.id;
        const {campaign_id,vote_type} = req.body;


        //if user already reacted
        const[exist] = await db.execute(
            "SELECT * FROM votes WHERE user_id=? AND campaign_id=?",[user_id,campaign_id]
        );

        if (exist.length > 0){
            await db.execute(
                "UPDATE votes SET reaction=? WHERE user_id=? AND campaign_id=?",[vote_type,user_id,campaign_id]
            );
            return res.json({message:"Reaction Updated"});
        }

        //if not exist insert new reactions
        await db.execute(
            "INSERT INTO votes (user_id,campaign_id,reaction) VALUES (?,?,?,?)",[user_id,campaign_id,vote_type]
        );

        res.json({message:"vote added"});

    }
    catch (error){
        res.status(500).json({error:error.message});
    }
};

export const countVotes = async (req,res)=>{
    try{
        const {campaign_id} = req.params;

        const [vote] = await db.execute(
            `SELECT SUM(CASE WHEN vote='upvote' THEN 1 ELSE 0 END) AS upvotes,
            SUM(CASE WHEN reaction='downvote' THEN 1 ELSE 0 END) AS downvotes 
            FROM votes
            WHERE campaign_id = ?`,[campaign_id]);

        res.json(vote[0]);
    }
    catch (error) {
        res.status(500).json({error:error.message});
    }
};