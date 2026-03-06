const testPost = (req, res) => {
    res.json({
        message:"Data Received successfully",
        data:req.body
    });
};

module.exports = {
    testPost
};