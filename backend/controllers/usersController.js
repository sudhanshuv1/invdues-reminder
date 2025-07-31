const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const MailConfig = require('../models/MailConfig');
const Subscription = require('../models/Subscription');

// @desc Check for existing email
// @route POST /user/email
// @access Public
const matchEmail = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const foundUser = await User.findOne({ email });

    if (foundUser) {
        return res.status(400).json({ message: 'A user with this email already exists!' });
    } else {
        return res.status(200).json({ message: 'Email is available!' });
    }
};

// @desc Create new user (email/password registration)
// @route POST /user
// @access Public
const signUp = async (req, res) => {
    const { displayName, email, password } = req.body;

    if (!displayName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const foundUser = await User.findOne({ email });

    if (foundUser) {
        return res.status(401).json({ message: `A user with the email ${email} already exists!` });
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    const user = new User({
        displayName,
        email,
        password: hashedPwd,
    });

    try {
        const savedUser = await user.save();
        res.status(201).json({ message: `User with email ${email} has been created!`, user: savedUser });
    } catch (error) {
        res.status(400).json({ message: 'User could not be created.', error });
    }
};

// @desc Get a user by ID
// @route GET /user
// @access Private
const getUser = async (req, res) => {
    const id = req.user.id;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error in getUser:', error);
        res.status(500).json({ message: 'Error retrieving user', error: error.message });
    }
};

// @desc Update a user
// @route PATCH /user
// @access Private
const updateUser = async (req, res) => {
    const id = req.user.id;
    const { displayName, profilePhoto } = req.body;

    if (!displayName) {
        return res.status(400).json({ message: 'Display name is required!' });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { displayName, profilePhoto },
            { new: true }
        );

        if (updatedUser) {
            res.status(200).json({ message: 'User updated!', user: updatedUser });
        } else {
            res.status(400).json({ message: 'User could not be updated!' });
        }
    } catch (error) {
        console.error('Error in updateUser:', error);
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

// @desc Delete a user
// @route DELETE /user
// @access Private
const deleteUser = async (req, res) => {
    const id = req.user.id;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (deletedUser) {
            res.status(200).json({ message: 'User deleted!' });
        } else {
            res.status(400).json({ message: 'User could not be deleted!' });
        }
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// @desc Get user profile
// @route GET /user/profile
// @access Private
const getUserProfile = async (req, res) => {
    const id = req.user.id;

    try {
        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
    }
};

// @desc Update user profile
// @route PATCH /user/profile
// @access Private
const updateUserProfile = async (req, res) => {
    const id = req.user.id;
    const { displayName, email } = req.body;

    if (!displayName || !email) {
        return res.status(400).json({ message: 'Display name and email are required!' });
    }

    try {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already taken by another user!' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { displayName, email },
            { new: true }
        ).select('-password');

        if (updatedUser) {
            res.status(200).json({ message: 'Profile updated successfully!', user: updatedUser });
        } else {
            res.status(400).json({ message: 'Profile could not be updated!' });
        }
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

// @desc Change user password
// @route PATCH /user/change-password
// @access Private
const changePassword = async (req, res) => {
    const id = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required!' });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if user has a password (Google users don't)
        if (!user.password) {
            return res.status(400).json({ message: 'Cannot change password for Google authenticated users!' });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect!' });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await User.findByIdAndUpdate(id, { password: hashedNewPassword });

        res.status(200).json({ message: 'Password changed successfully!' });
    } catch (error) {
        console.error('Error in changePassword:', error);
        res.status(500).json({ message: 'Error changing password', error: error.message });
    }
};

// @desc Delete user account and all associated data
// @route DELETE /user/account
// @access Private
const deleteUserAccount = async (req, res) => {
    const id = req.user.id;

    try {
        // Start a transaction to ensure all deletions happen together
        const session = await User.startSession();
        session.startTransaction();

        try {
            // Delete all user's invoices
            await Invoice.deleteMany({ userId: id }, { session });

            // Delete user's mail configuration
            await MailConfig.deleteMany({ userId: id }, { session });

            // Delete the user
            const deletedUser = await User.findByIdAndDelete(id, { session });

            if (!deletedUser) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'User not found' });
            }

            // Commit the transaction
            await session.commitTransaction();
            res.status(200).json({ message: 'Account and all associated data deleted successfully!' });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Error in deleteUserAccount:', error);
        res.status(500).json({ message: 'Error deleting account', error: error.message });
    }
};

// @desc Get user statistics
// @route GET /user/stats
// @access Private
const getUserStats = async (req, res) => {
    const id = req.user.id;

    try {
        // Get total invoice count
        const totalInvoices = await Invoice.countDocuments({ userId: new mongoose.Types.ObjectId(id) });

        // Debug: Let's see all invoices for this user
        const allInvoices = await Invoice.find({ userId: new mongoose.Types.ObjectId(id) });
        console.log('All invoices for user:', allInvoices.map(inv => ({ amount: inv.amount, status: inv.status })));

        // Get paid invoices and calculate total revenue
        const paidInvoices = await Invoice.find({ 
            userId: id,
            status: 'paid'
        });

        console.log('Paid invoices:', paidInvoices.map(inv => ({ amount: inv.amount, status: inv.status })));

        // Calculate total revenue manually to ensure accuracy
        const totalRevenue = paidInvoices.reduce((sum, invoice) => {
            const amount = parseFloat(invoice.amount) || 0;
            return sum + amount;
        }, 0);

        console.log('Calculated total revenue:', totalRevenue);

        // Check if user has mail configuration
        const mailConfig = await MailConfig.findOne({ userId: id });

        // Get subscription information
        let subscription = await Subscription.findOne({ userId: id });
        if (!subscription) {
          // Create free trial subscription if none exists
          subscription = new Subscription({
            userId: id,
            plan: 'free',
            status: 'trial'
          });
          await subscription.save();
        }

        // Check if trial has expired
        if (subscription.status === 'trial' && new Date() > subscription.trialEnd) {
          subscription.status = 'expired';
          subscription.plan = 'free';
          await subscription.save();
        }

        const stats = {
            totalInvoices: totalInvoices,
            totalRevenue: totalRevenue,
            hasMailConfig: !!mailConfig,
            currentPlan: subscription.plan,
            subscriptionStatus: subscription.status,
            trialEndsAt: subscription.trialEnd,
            subscriptionEndsAt: subscription.currentPeriodEnd
        };

        console.log('Final stats being sent:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Error in getUserStats:', error);
        res.status(500).json({ message: 'Error retrieving user statistics', error: error.message });
    }
};

module.exports = {
    matchEmail,
    signUp,
    getUser,
    updateUser,
    deleteUser,
    getUserProfile,
    updateUserProfile,
    changePassword,
    deleteUserAccount,
    getUserStats,
};