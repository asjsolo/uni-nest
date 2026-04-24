import express from "express";
import {
  getWallet,
  addFunds,
  getTransactions,
} from "../controllers/walletController.js";

const router = express.Router();

router.get("/", getWallet);
router.post("/add-funds", addFunds);
router.get("/transactions", getTransactions);

export default router;