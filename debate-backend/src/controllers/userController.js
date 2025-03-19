const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');





exports.registerUser = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            userType,
        } = req.body;
        const name = `${firstName} ${lastName}`
        console.log("🚀 ~ exports.registerUser= ~ userType:", userType)
        console.log("🚀 ~ exports.registerUser= ~ password:", password)
        console.log("🚀 ~ exports.registerUser= ~ email:", email)
        console.log("🚀 ~ exports.registerUser= ~ name:", name)

        const existingUser = 
        await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.',
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                userType,
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, userType: newUser.userType },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );


        return res.status(201).json({
            success: true,
            data: {
                ...userWithoutPassword,
                token,
            },
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, userType: user.userType },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        const { password: _, ...userWithoutPassword } = user;

        return res.status(200).json({
            success: true,
            data: {
                ...userWithoutPassword,
                token,

            },
        });
    } catch (error) {
        console.log("🚀 ~ exports.loginUser= ~ error:", error)
        return res.status(500).json({ success: false, message: error.message });
    }
};
