const jwt = require("jsonwebtoken");


//protected routes
exports.protect = (req, res, next) => {
    const token = req.headers.authorization;

    if(!token) {
        return res.status(401).json({message:"Not Authorized"});
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], "secretkey");
        req.user = decoded;
        next();
    }catch(error) {
        return res.status(401).json({message: "Token invalid"});
    }
};

