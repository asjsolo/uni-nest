import Item from '../models/Item.js';
import Inquiry from '../models/Inquiry.js';
import Rental from '../models/Rental.js';
import mongoose from 'mongoose';

// Items
export const getItems = async (req, res) => {
    try {
        const { search, category, isEmergency } = req.query;
        let query = { status: 'Available' };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) query.category = category;
        if (isEmergency === 'true') query.isEmergency = true;

        const items = await Item.find(query);
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
        if (!item) return res.status(404).json({ message: 'Item not found' });
        
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Inquiries
export const createInquiry = async (req, res) => {
    try {
        const { itemId, message } = req.body;
        
        if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'Valid Item ID is required' });
        }
        if (!message || message.trim().length < 10) {
            return res.status(400).json({ message: 'Message is required and must be at least 10 characters long' });
        }

        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        const inquiry = await Inquiry.create({
            item: itemId,
            message: message.trim(),
        });

        res.status(201).json(inquiry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInquiries = async (req, res) => {
    try {
        const inquiries = await Inquiry.find().populate('item', 'title category image');
        res.status(200).json(inquiries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Rentals
export const createRental = async (req, res) => {
    try {
        const { itemId, startDate, endDate, paymentType, notes } = req.body;

        if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ message: 'Valid Item ID is required' });
        }
        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'Start and end dates are required' });
        }
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end <= start) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }
        if (!['Deposit', 'Full'].includes(paymentType)) {
            return res.status(400).json({ message: 'Payment type must be Deposit or Full' });
        }

        const item = await Item.findById(itemId);
        if (!item) return res.status(404).json({ message: 'Item not found' });
        if (item.status !== 'Available') {
            return res.status(400).json({ message: 'Item is not available for rent' });
        }

        // Dummy IDs for now as Auth is not strictly active in Buyer flow UI
        const dummyBuyerId = new mongoose.Types.ObjectId(); 

        const rental = await Rental.create({
            item: itemId,
            buyer: dummyBuyerId,
            lender: item.lender, // existing lender
            dates: {
                startDate: start,
                endDate: end
            },
            paymentStatus: {
                depositPaid: paymentType === 'Deposit',
                fullAmountPaid: paymentType === 'Full'
            },
            rentalStatus: paymentType === 'Full' ? 'Active' : 'Pending',
            notes: notes ? notes.trim() : "",
        });

        // Mark item as rented if everything paid upfront
        if (paymentType === 'Full') {
            item.status = 'Rented';
            await item.save();
        }

        res.status(201).json(rental);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getRentals = async (req, res) => {
    try {
        const rentals = await Rental.find().populate('item', 'title pricePerDay image');
        // Transform the payload to include custom frontend props
        const transformedRentals = rentals.map(r => {
            const doc = r.toObject();
            if (doc.item) {
                const msPerDay = 1000 * 60 * 60 * 24;
                const days = Math.ceil((new Date(doc.dates.endDate) - new Date(doc.dates.startDate)) / msPerDay);
                const totalAmount = days * (doc.item.pricePerDay || 0);
                let paidAmount = 0;
                
                let payType = 'Deposit'; // Assuming default or calculate
                if (doc.paymentStatus && doc.paymentStatus.fullAmountPaid) {
                    payType = 'Full';
                    paidAmount = totalAmount;
                } else if (doc.paymentStatus && doc.paymentStatus.depositPaid) {
                    payType = 'Deposit';
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
    // Left as PATCH placeholder or implementation if requested
    res.status(200).json({ message: 'Payment successful' });
};

export const returnRental = async (req, res) => {
    try {
        const { id } = req.params;
        const rental = await Rental.findById(id);
        if (!rental) return res.status(404).json({ message: 'Rental not found' });
        
        rental.rentalStatus = 'Returned';
        rental.dates.returnDate = new Date();
        await rental.save();

        const item = await Item.findById(rental.item);
        if (item) {
            item.status = 'Available';
            await item.save();
        }

        res.status(200).json({ message: 'Returned successfully', rental });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
