import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import pkg from 'mongodb';
const { ObjectId } = pkg;
import { getDbConnection } from '../db.js';

export const updateUserInfoRoute = {
    path: '/api/users/:userId',
    method: 'PUT',
    handler: async (req, res) => {
        const { authorization } = req.headers;
        const { userId } = req.params;

        const updates = req.body;

        if (!authorization) {
            return res.status(401).json({ message: "No authorization header sent" });
        }

        const token = authorization.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
            if (error) {
                return res.status(401).json({ message: "Unable to verify token" });
            }

            const { id, isVerified } = decoded;

            if (id !== userId) {
                return res.status(403).json({ message: "Not allowed to update this user's info" });
            }

            if (!isVerified) {
                return res.status(403).json({ message: "Need to verify email before updating info" });
            }

            const db = getDbConnection('react-auth-db');

            const result = await db.collection('users').updateOne(
                { _id: new ObjectId(userId) },
                { $set: updates },
            );

            if (!result.matchedCount) {
                return res.status(404).json({ message: "User not found" });
            }

            if (!result.modifiedCount) {
                return res.status(200).json({ message: "No changes made to the user info" });
            }

            const updatedUser = await db.collection('users').findOne({ _id: new ObjectId(userId) });

            if (!updatedUser) {
                return res.status(500).json({ message: "Failed to fetch updated user data" });
            }

            const { email, info } = updatedUser;

            const newAccessToken = jwt.sign({ id, email, isVerified, info },
                process.env.JWT_SECRET,
                { expiresIn: "15m" });

            res.status(200).json({
                newAccessToken,
                message: result.modifiedCount ? "User info updated" : "No changes made to the user info"
            });
        });
    },
};