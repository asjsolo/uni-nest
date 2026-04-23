import Item from '../models/Item.js';
import Inquiry from '../models/Inquiry.js';
import Rental from '../models/Rental.js';
import mongoose from 'mongoose';

// ==============================
// Items
// ==============================
export const getItems = async (req, res) => {
    try {
        const { search, category, isEmergency } = req.query;

        // Use isAvailable field from MongoDB items2
        let query = { isAvailable: true };

        if (category && category !== "All") {
            query.category = category;
        }

        if (isEmergency === 'true') {
            query.isEmergency = true;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const items = await Item.find(query);
        console.log(`[GET /items] Query: ${JSON.stringify(query)}, Found: ${items.length} items`);
        res.status(200).json(items);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getItemById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Item ID' });
        }

        const item = await Item.findById(id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// Inquiries
// ==============================
export const createInquiry = async (req, res) => {
    try {
        const { itemId, message } = req.body;

        if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'Valid Item ID is required' });
        }

        if (!message || message.trim().length < 5) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const inquiry = await Inquiry.create({
            item: itemId,
            message: message.trim()
        });

        res.status(201).json(inquiry);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find()
            .populate('item', 'title category image');

        res.status(200).json(inquiries);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==============================
// Rentals
// ==============================
export const createRental = async (req, res) => {
    try {
        const { itemId, startDate, endDate, paymentType, notes } = req.body;

        if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'Valid Item ID required' });
        }

        const item = await Item.findById(itemId);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (!item.isAvailable) {
            return res.status(400).json({ message: 'Item not available' });
        }

        const rental = await Rental.create({
            item: itemId,
            buyer: new mongoose.Types.ObjectId(),
            lender: item.lender || new mongoose.Types.ObjectId("000000000000000000000000"), // Fallback for manual items2 data
            dates: {
                startDate,
                endDate
            },
            paymentStatus: {
                depositPaid: paymentType === "Deposit",
                fullAmountPaid: paymentType === "Full"
            },
            rentalStatus: paymentType === "Full" ? "Active" : "Pending",
            notes: notes || ""
        });

        // Mark unavailable if full payment
        if (paymentType === "Full") {
            item.isAvailable = false;
            await item.save();
        }

        res.status(201).json(rental);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRentals = async (req, res) => {
    try {
        const rentals = await Rental.find()
            .populate('item', 'title pricePerDay image');

        const transformedRentals = rentals.map(r => {
            const doc = r.toObject();
            if (doc.item) {
                const msPerDay = 1000 * 60 * 60 * 24;
                const start = new Date(doc.dates.startDate);
                const end = new Date(doc.dates.endDate);
                const days = Math.ceil((end - start) / msPerDay) || 1;
                
                const totalAmount = days * (doc.item.pricePerDay || 0);
                let paidAmount = 0;
                let payType = "Deposit"; 

                if (doc.paymentStatus?.fullAmountPaid) {
                    payType = "Full";
                    paidAmount = totalAmount;
                } else if (doc.paymentStatus?.depositPaid) {
                    payType = "Deposit";
                    paidAmount = totalAmount * 0.5;
                }

                return {
                    ...doc,
                    totalAmount,
                    paidAmount,
                    remainingAmount: totalAmount - paidAmount,
                    paymentType: payType
                };
            }
            return doc;
        });

        res.status(200).json(transformedRentals);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const payRental = async (req, res) => {
    try {
        res.status(200).json({ message: 'Payment successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const returnRental = async (req, res) => {
    try {
        const { id } = req.params;

        const rental = await Rental.findById(id);

        if (!rental) {
            return res.status(404).json({ message: 'Rental not found' });
        }

        rental.rentalStatus = "Returned";
        rental.dates.returnDate = new Date();
        await rental.save();

        const item = await Item.findById(rental.item);

        if (item) {
            item.isAvailable = true;
            await item.save();
        }

        res.status(200).json({
            message: 'Returned successfully',
            rental
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};