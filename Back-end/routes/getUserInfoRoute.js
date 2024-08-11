import dotenv from 'dotenv';
dotenv.config();
import { getDbConnection } from "../db.js";
import jwt from 'jsonwebtoken';
import pkg from 'mongodb';
const { ObjectId } = pkg;

export const getUserInfoRoute = {
    path: '/api/users/:userId',
    method: "GET",
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
                return res.status(403).json({ message: "Not allowed to view this user's info" });
            }

            const db = getDbConnection("react-auth-db");

            const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const { passwordHash, ...userInfo } = user;
            res.status(200).json(userInfo);
        });
    },
};