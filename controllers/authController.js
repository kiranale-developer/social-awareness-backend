import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import pool from '../config/database.js';
import validatePassword from '../utils/passwordVAlidator.js';
import validateEmail from '../utils/emailValidator.js';


//Register User
export const register = async (req,res) => {

    try{
        const {name, email, password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({message:"All Fields are Required"});
        }

        //check email validation
        if(!validateEmail(email)){
            return res.status(400).json({message:"Please Enter Valid Email"});
            
        }

        //check password validation
        if(!validatePassword(password)){
           return res.status(400).json({message:"Password  must be at least 8 characters long and should contain at least a uppercase, a lowercase and a specail character"});
        }

        //check is user already exist
        const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?",[email]);

        if(existingUser.length > 0){
            return res.status(400).json({message:" User is already exists"});
    
        }
        //password hash for strong password using bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);

        //insert into table
        await pool.query("INSERT INTO users (name, email, password) VALUES (?,?,?)",[name,email,hashedPassword]);


        res.status(201).json({message: "User registered successfully"});
        
    } catch(error){
        console.error(error);
        res.status(500).json({message: "Server Error"});
    } 
    
};

//LOGIN
export const login = async (req, res) => {
    try{
        const {email,password}  = req.body;

        const [check] = await pool.query("SELECT * FROM users WHERE email = ?",[email]);

        if(check.length === 0){
            return res.status(400).json({message:"Invalid Credentails"});
        }

        const user = check[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({message: "Invalid Credentails"});
        }
        const token = jwt.sign(
            {id:user.id, role:user.role},
            process.env.JWT_SECRET,
            {expiresIn:"1h"}
        );

        res.json({
            message: "Login Successful",
            token
        });
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "SErver Error"});
    }

};