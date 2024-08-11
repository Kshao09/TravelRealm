import dotenv from 'dotenv';
dotenv.config();
import { getDbConnection } from '../db.js';
import jwt from 'jsonwebtoken';

export const logoutRoute = {
    path: "/api/logout",
    method: "POST",
    handler: async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: "No refresh token provided" });
        }

        const db = getDbConnection("react-auth-db");
        const updateResult = await db.collection('users').updateOne(
            { refreshToken },
            { $unset: { refreshToken: "" } }
        );

        if (updateResult.modifiedCount === 1) {
            res.status(200).json({ message: "Logout successful" });
        } else {
            res.status(500).json({ message: "Logout failed" });
        }
    },
};