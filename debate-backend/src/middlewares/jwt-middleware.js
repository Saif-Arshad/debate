const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


const verifyUserToken = async (req, res, next) => {
    try {
        let token = req.header("Authorization");
        console.log("🚀 ~ verifyUserToken ~ token:", token)
        if (!token) {
            return res.status(403).json({ error: "Access Denied. No token provided." });
        }

        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("🚀 ~ verifyUserToken ~ decoded:", decoded)
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({ error: "Token has expired." });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid or expired session." });
        }

        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        console.log(error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token." });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token has expired." });
        }
        return res.status(500).json({ error: error.message });
    }
};


const verifyTeacherToken = async (req, res, next) => {
    try {
        let token = req.header("Authorization");
        if (!token) {
            return res.status(403).json({ error: "Access Denied. No token provided." });
        }

        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({ error: "Token has expired." });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            return res.status(401).json({ error: "Invalid or expired session." });
        }

        if (user.userType !== "TEACHER") {
            return res.status(403).json({ error: "Access Denied. Teacher only route." });
        }

        req.user = user;
        req.token = token;

        next();
    } catch (error) {
        console.log(error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token." });
        }
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token has expired." });
        }
        return res.status(500).json({ error: error.message });
    }
};



module.exports = {
    verifyUserToken,
    verifyTeacherToken,
};
