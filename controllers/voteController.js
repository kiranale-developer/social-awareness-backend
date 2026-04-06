import pool from '../config/database.js';

let voteColumnCache = null;

const getVoteColumn = async () => {
  if (voteColumnCache) {
    return voteColumnCache;
  }

  const [rows] = await pool.execute(
    `SELECT COLUMN_NAME
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'votes'
            AND COLUMN_NAME IN ('vote_type', 'vote', 'reaction')`,
  );

  const availableColumns = rows.map((row) => row.COLUMN_NAME);

  if (availableColumns.includes('vote_type')) {
    voteColumnCache = 'vote_type';
    return voteColumnCache;
  }

  if (availableColumns.includes('vote')) {
    voteColumnCache = 'vote';
    return voteColumnCache;
  }

  if (availableColumns.includes('reaction')) {
    voteColumnCache = 'reaction';
    return voteColumnCache;
  }

  throw new Error(
    "Votes table is missing expected vote column ('vote_type', 'vote', or 'reaction').",
  );
};

const normalizeIncomingVote = (vote) => {
  if (!vote) {
    return null;
  }

  const normalized = String(vote).toLowerCase();
  if (normalized === 'upvote' || normalized === 'like') {
    return 'upvote';
  }
  if (normalized === 'downvote' || normalized === 'dislike') {
    return 'downvote';
  }

  return null;
};

const toDbVote = (normalizedVote, voteColumn) => {
  if (voteColumn === 'reaction') {
    return normalizedVote === 'upvote' ? 'like' : 'dislike';
  }

  return normalizedVote;
};

const fromDbVote = (dbVote, voteColumn) => {
  if (voteColumn === 'reaction') {
    return dbVote === 'like' ? 'upvote' : 'downvote';
  }

  return dbVote;
};

// VOTE TO A CAMPAIGN AS A USER AND SHOWING THE TOTAL NUMBERS OF UPVOTES AND DOWNVOTES
export const voteToCampaign = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { campaign_id } = req.params;
    const requestedVote =
      req.body.vote_type || req.body.voteType || req.body.reaction;
    const vote_type = normalizeIncomingVote(requestedVote);
    const voteColumn = await getVoteColumn();

    if (!vote_type) {
      return res.status(400).json({
        message: "Invalid vote type. Use 'upvote' or 'downvote'.",
      });
    }

    const dbVote = toDbVote(vote_type, voteColumn);

    if (!user_id) {
      return res.status(401).json({
        message: 'Unauthorized User',
      });
    }

    await pool.execute(
      `INSERT INTO votes (user_id, campaign_id, ${voteColumn}) VALUES (?,?,?) ON DUPLICATE KEY UPDATE
            ${voteColumn} = VALUES(${voteColumn})`,
      [user_id, campaign_id, dbVote],
    );

    const upvoteValue = voteColumn === 'reaction' ? 'like' : 'upvote';
    const downvoteValue = voteColumn === 'reaction' ? 'dislike' : 'downvote';

    const [countRows] = await pool.execute(
      `SELECT
                COALESCE(SUM(CASE WHEN ${voteColumn} = ? THEN 1 ELSE 0 END), 0) AS upvotes,
                COALESCE(SUM(CASE WHEN ${voteColumn} = ? THEN 1 ELSE 0 END), 0) AS downvotes
             FROM votes
             WHERE campaign_id = ?`,
      [upvoteValue, downvoteValue, campaign_id],
    );

    res.status(200).json({
      message: 'Vote Processed',
      upvotes: countRows[0].upvotes,
      downvotes: countRows[0].downvotes,
      userVote: vote_type,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// user is not logged in but we can get the counts of votes for the each campaign
export const getCampaignVotes = async (req, res) => {
  try {
    const { campaign_id } = req.params;
    const user_id = req.user?.id || null;
    const voteColumn = await getVoteColumn();
    const upvoteValue = voteColumn === 'reaction' ? 'like' : 'upvote';
    const downvoteValue = voteColumn === 'reaction' ? 'dislike' : 'downvote';

    const [countRows] = await pool.execute(
      `SELECT
                COALESCE(SUM(CASE WHEN ${voteColumn} = ? THEN 1 ELSE 0 END), 0) AS upvotes,
                COALESCE(SUM(CASE WHEN ${voteColumn} = ? THEN 1 ELSE 0 END), 0) AS downvotes
             FROM votes
             WHERE campaign_id = ?`,
      [upvoteValue, downvoteValue, campaign_id],
    );

    let userVote = null;
    if (user_id) {
      const [userRows] = await pool.execute(
        `SELECT ${voteColumn} AS user_vote
                 FROM votes
                 WHERE user_id = ? AND campaign_id = ?`,
        [user_id, campaign_id],
      );

      if (userRows.length > 0) {
        userVote = fromDbVote(userRows[0].user_vote, voteColumn);
      }
    }

    return res.status(200).json({
      upvotes: countRows[0].upvotes,
      downvotes: countRows[0].downvotes,
      userVote,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
