import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import pkg from 'mongodb';
const { ObjectId } = pkg;
import { getDbConnection } from '../db.js';

export const verifyEmailRoute = {
    path: '/api/verify-email',
    method: "PUT",
    handler: async (req, res) => {
        const { verificationString } = req.body;

        const db = getDbConnection("react-auth-db");
        const result = await db.collection('users').findOne({
            verificationString,
        });

        if (!result) {
            return res.status(401).json({ message: "Email verification code is incorrect" });
        }

        const { _id: id, email, info } = result;

        await db.collection('users').updateOne({ _id: new ObjectId(id) }, {
            $set: { isVerified: true }
        });

        jwt.sign({ id, email, isVerified: true, info }, process.env.JWT_SECRET, { expiresIn: "15min" }, (err, token) => {
            if (err) {
                return res.status(500).json(err);
            }
            return res.status(200).json({ token });
        });
    },
};