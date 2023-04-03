import express from "express";
import { registerUser, getRefer, callback } from "../controllers/auth.js";

const router = express.Router();
router.post("/register", registerUser);
router.post("/refer", getRefer);
router.post("/callback/:id", callback);
export default router;
