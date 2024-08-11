import pkg from 'mongodb';
const { ObjectId } = pkg;
import { getDbConnection } from '../db.js';

export const signUpDateRoute = {
    path: "/api/sign-up-date/:userId",
    method: "GET",
    handler: async (req, res) => {
        const { userId } = req.params;

        const db = getDbConnection("react-auth-db");

        try {
            const user = await db.collection('users').findOne({ _id: ObjectId(userId) });

            if (user) {
                res.status(200).json({ signupDate: user.signupDate });
            } else {
                res.status(404).json({ message: "User not found" });
            }
        } catch (error) {
            res.status(500).json({ message: "Error fetching sign-up date", error });
        }
    }
};