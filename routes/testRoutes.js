import pool from "../config/database.js"
import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS test");
    res.json({ message: "DB connected ✅", rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;