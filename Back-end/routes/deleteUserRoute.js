import dotenv from 'dotenv';
dotenv.config();
import { getDbConnection } from '../db.js';
import jwt from 'jsonwebtoken';
import pkg from 'mongodb';
const { ObjectId } = pkg;

export const deleteUserRoute = {
    path: '/api/users/:userId',
    method: 'DELETE',
    handler: async (req, res) => {
        const { userId } = req.params;
        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).json({ message: "No authorization header sent" });
        }

        const token = authorization.split(" ")[1];

        jwt.verify(token, process.env.JWT_SECRET, async (error, decoded) => {
            if (error) {
                return res.status(401).json({ message: "Unable to verify token" });
            }

            const { id } = decoded;

            if (id !== userId) {
                return res.status(403).json({ message: "Not allowed to delete this user's account" });
            }

            const db = getDbConnection('react-auth-db');
            const result = await db.collection('users').deleteOne({ _id: new ObjectId(userId) });

            if (result.deletedCount === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            res.status(200).json({ message: "Account deleted successfully" });
        });
    },
};