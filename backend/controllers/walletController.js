import Wallet from "../models/Wallet.js";

const DEMO_USER = "student-demo-user";

export const getWallet = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ userKey: DEMO_USER });

        if (!wallet) {
            wallet = await Wallet.create({
                userKey: DEMO_USER,
                balance: 0,
                transactions: [],
            });
        }

        res.status(200).json(wallet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const addFunds = async (req, res) => {
    try {
        const { amount } = req.body;
        const numericAmount = Number(amount);

        if (!numericAmount || numericAmount <= 0) {
            return res.status(400).json({ message: "Amount must be greater than 0" });
        }

        let wallet = await Wallet.findOne({ userKey: DEMO_USER });

        if (!wallet) {
            wallet = await Wallet.create({
                userKey: DEMO_USER,
                balance: 0,
                transactions: [],
            });
        }

        wallet.balance += numericAmount;

        wallet.transactions.unshift({
            type: "Added Funds",
            amount: numericAmount,
        });

        await wallet.save();

        res.status(200).json(wallet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getTransactions = async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ userKey: DEMO_USER });

        res.status(200).json(wallet ? wallet.transactions : []);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};