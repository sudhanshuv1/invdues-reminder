const bcrypt = require('bcrypt');
const User = require('../models/User');

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
    const id = req.id;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user', error });
    }
};

// @desc Update a user
// @route PATCH /user
// @access Private
const updateUser = async (req, res) => {
    const id = req.id;
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
        res.status(500).json({ message: 'Error updating user', error });
    }
};

// @desc Delete a user
// @route DELETE /user
// @access Private
const deleteUser = async (req, res) => {
    const id = req.id;

    try {
        const deletedUser = await User.findByIdAndDelete(id);

        if (deletedUser) {
            res.status(200).json({ message: 'User deleted!' });
        } else {
            res.status(400).json({ message: 'User could not be deleted!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error });
    }
};

module.exports = {
    matchEmail,
    signUp,
    getUser,
    updateUser,
    deleteUser,
};