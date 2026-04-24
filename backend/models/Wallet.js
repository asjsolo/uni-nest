import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["Added Funds", "Payment"],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const walletSchema = new mongoose.Schema(
    {
        userKey: {
            type: String,
            default: "student-demo-user",
            unique: true,
        },
        balance: {
            type: Number,
            default: 0,
        },
        transactions: [walletTransactionSchema],
    },
    { timestamps: true }
);

const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;