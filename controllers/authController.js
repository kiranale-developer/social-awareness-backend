import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import pool from '../config/database.js';
import validatePassword from '../utils/passwordVAlidator.js';
import validateEmail from '../utils/emailValidator.js';

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
const ACCESS_TOKEN_SECRET =
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

const getCookieValue = (cookieHeader, key) => {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';');
  for (const item of cookies) {
    const [cookieKey, ...rest] = item.trim().split('=');
    if (cookieKey === key) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
};

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

//Register User
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All Fields are Required' });
    }

    //check email validation
    if (!validateEmail(email)) {
      return res.status(400).json({ message: 'Please Enter Valid Email' });
    }

    //check password validation
    if (!validatePassword(password)) {
      return res
        .status(400)
        .json({
          message:
            'Password  must be at least 8 characters long and should contain at least a uppercase, a lowercase and a specail character',
        });
    }

    //check is user already exist
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: ' User is already exists' });
    }
    //password hash for strong password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    //insert into table
    await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?,?,?)',
      [name, email, hashedPassword],
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

//LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [check] = await pool.query('SELECT * FROM users WHERE email = ?', [
      email,
    ]);

    if (check.length === 0) {
      return res.status(400).json({ message: 'Invalid Credentails' });
    }

    const user = check[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentails' });
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, refreshCookieOptions);

    res.json({
      message: 'Login Successful',
      token: accessToken,
      accessToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'SErver Error' });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = getCookieValue(req.headers.cookie, 'refreshToken');

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const newAccessToken = generateAccessToken(decoded);

    return res.status(200).json({
      message: 'Access token refreshed',
      token: newAccessToken,
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Invalid or expired refresh token' });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};
