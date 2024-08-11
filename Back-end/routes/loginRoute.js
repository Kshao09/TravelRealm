import dotenv from 'dotenv';
dotenv.config();
import { getDbConnection } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const loginRoute = {
    path: "/api/login",
    method: "POST",
    handler: async (req, res) => {
        const { email, password } = req.body;

        const db = getDbConnection("react-auth-db");
        const user = await db.collection('users').findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        const { _id: id, isVerified, passwordHash, salt, info } = user;
        const pepper = process.env.PEPPER_STRING;

        const isCorrect = await bcrypt.compare(password, passwordHash);

        if (!isCorrect) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        if (!isVerified) {
            return res.status(403).json({ message: "Please verify your email before logging in." });
        }

        const accessToken = jwt.sign({ id, isVerified, email, info },
            process.env.JWT_SECRET,
            { expiresIn: "15m" });

        const refreshToken = jwt.sign({ id, isVerified, email, info },
            process.env.JWT_REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" });
        await db.collection('users').updateOne({ _id: id }, { $set: { refreshToken } });

        res.status(200).json({ accessToken, refreshToken, info });
    }
}
