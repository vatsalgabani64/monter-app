// VATSAL GABANI [gabanivatsal17@gmail.com]

// Import dependencies
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { database, jwtSecret, email: emailConfig } = require('../config/config');
const User = require('../models/User');

// Set up nodemailer for mailing coonfigerations
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
    }
});

// User registration API endpoint
router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create a new user
    const newUser = new User({
        email,
        password: hashedPassword,
        otp,
        otpExpires: Date.now() + 600000 // OTP expires in 10 minutes
    });

    // Save the user
    await newUser.save();

    // Send OTP email
    const mailOptions = {
        from: emailConfig.user,
        to: email,
        subject: 'OTP for Account Verification',
        text: `OTP: ${otp}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to send OTP email' });
        }
        res.json({ message: 'User registered successfully. Check your email for the OTP.' });
    });
});

// Validate OTP and update profile API endpoint
router.post('/validate-otp', async (req, res) => {
    const { email, otp, location, age, workDetails } = req.body;

    // Find the user with the given email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Check if OTP is correct and not expired
    if (user.otp === otp && user.otpExpires > Date.now()) {
        // Update the user
        user.verified = true;
        user.location = location;
        user.age = age;
        user.workDetails = workDetails;
        await user.save();

        res.json({ message: 'OTP validated and profile updated successfully' });
    } else {
        res.status(400).json({ error: 'Invalid or expired OTP' });
    }
});

// User login API endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Find the user with the given email
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (!user.verified) {
        return res.status(401).json({ error: 'Account not verified' });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return res.status(401).json({ error: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '10m' });

    res.json({ message: 'Login successful', token });
});

// Get user profile API endpoint
router.get('/profile', async (req, res) => {
    // Get the 'Authorization' header value
    const authorizationHeader = req.header('Authorization');

    if (authorizationHeader) {
        const token = authorizationHeader.replace('Bearer ', '');

        try {
            // Verify JWT token
            const decoded = jwt.verify(token, jwtSecret);

            // Find the user by ID
            const user = await User.findById(decoded.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Send user information
            res.json({
                email: user.email,
                location: user.location,
                age: user.age,
                workDetails: user.workDetails
            });
        } catch (err) {
            res.status(401).json({ error: 'Invalid token' });
        }
    } else {
        res.status(401).json({ error: 'Authorization header missing' });
    }
});


module.exports = router;
