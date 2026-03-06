require("dotenv").config();
const express = require ("express");
//for frontend
const cors = require("cors");


const app = express();

const { protect } = require("./middleware/authMiddleware");

const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");


//Middleware
app.use(cors());
app.use(express.json());


//use routes
app.use("/api",testRoutes);

app.use("/api/auth",authRoutes);

//check protedted api
app.use("/api/protected",protect,(req,res)=>{
    res.json({
        message: " Protected data accessed",
        user : req.user
    });
});


app.get("/",(req,res)=>{
    res.send("API is Working");
});

app.listen(process.env.PORT,()=>{
    console.log("Server running");
});

