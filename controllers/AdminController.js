const AdminUser = require('../models/AdminUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const addAdminUser = async (req, res) => {
    const { username, email, password, phoneNumber, address, permissions } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    const adminUser = new AdminUser({
        username,
        email,
        password,
        phoneNumber,
        address,
        permissions
    });

    try {
        const newUser = await adminUser.save();
        res.status(201).json({
            message: 'Admin user created successfully',
            data: newUser
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginAdminUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await AdminUser.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Invalid email or password, User not found' });
        }   
        if (!user.isActive) {
            return res.status(400).json({ message: 'User is inactive' });
        }
        if (user.isDeleted) {
            return res.status(400).json({ message: 'User is deleted' });
        }
        const isValidPassword = await user.matchPassword(password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = generateToken(user._id);

        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user.id,
                username: user.username,
                email: user.email,
                permissions: user.permissions,
                token
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAdminUser = async (req, res) => {
    const { id } = req.params;
    const { username, password, address, permissions, isDeleted, isActive } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const user = await AdminUser.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Admin user not found' });
        }

        if (username) user.username = username;
        if (password) user.password = password;
        if (address) user.address = address;
        if (permissions) user.permissions = permissions;
        if (isDeleted !== undefined) user.isDeleted = isDeleted;
        if (isActive !== undefined) user.isActive = isActive;

        const updatedUser = await user.save();
        res.status(200).json({
            message: 'Admin user updated successfully',
            user: {
                _id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                permissions: updatedUser.permissions
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAdminUsers = async (req, res) => {
    try {
        const users = await AdminUser.find({ isDeleted: false });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserById = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const user = await AdminUser.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addAdminUser, updateAdminUser, loginAdminUser, getAdminUsers, getUserById };
