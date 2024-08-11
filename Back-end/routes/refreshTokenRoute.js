import dotenv from 'dotenv';
dotenv.config();
import { getDbConnection } from "../db.js";
import jwt from 'jsonwebtoken';

export const refreshTokenRoute = {
    path: "/api/refresh-token",
    method: "POST",
    handler: async (req, res) => {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        const db = getDbConnection("react-auth-db");
        let user;

        try {
            user = await db.collection('users').findOne({ refreshToken });
            if (!user) {
                return res.status(403).json({ message: "Refresh token not found in database" });
            }
        } catch (dbError) {
            console.error('Database error:', dbError);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        try {
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);

            const { id } = decoded;

            if (id !== user._id.toString()) {
                return res.status(403).json({ message: "Invalid refresh token" });
            }

            const newAccessToken = jwt.sign(
                { id, email: user.email, info: user.info, isVerified: user.isVerified },
                process.env.JWT_SECRET,
                { expiresIn: "15m" }
            );

            const newRefreshToken = jwt.sign(
                { id },
                process.env.JWT_REFRESH_TOKEN_SECRET,
                { expiresIn: "7d" }
            );

            await db.collection('users').updateOne(
                { _id: user._id },
                { $set: { refreshToken: newRefreshToken } }
            );

            res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
        } catch (jwtError) {
            console.error('JWT error:', jwtError);
            res.status(403).json({ message: "Invalid refresh token" });
        }
    }
};
