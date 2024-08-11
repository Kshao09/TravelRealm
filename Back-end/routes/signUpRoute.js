import dotenv from 'dotenv';
dotenv.config();
import { getDbConnection } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { sendEmail } from '../util/sendEmail.js';

export const signUpRoute = {
    path: "/api/signup",
    method: "POST",
    handler: async (req, res) => {
        const { name, email, password, birthday, ethnicity } = req.body;

        const db = getDbConnection("react-auth-db");
        const user = await db.collection('users').findOne({ email });

        if (user) {
            return res.status(409).json({ message: "Email already in use" });
        }

        const salt = uuid();
        const pepper = process.env.PEPPER_STRING;
        const passwordHash = await bcrypt.hash(salt + password + pepper, 10);
        const verificationString = uuid();

        const startingInfo = { name, birthday, ethnicity };

        const result = await db.collection('users').insertOne({
            email,
            passwordHash,
            salt,
            info: startingInfo,
            isVerified: false,
            verificationString,
        });

        const { insertedId } = result;

        try {
            await sendEmail({
                to: email,
                from: 'Kshao001@fiu.edu',
                subject: "Please verify your email",
                text: `Thanks for signing up! To verify, please click here: 
                    http://localhost:3000/verify-email/${verificationString}
                `,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: "Server error" });
        }

        const accessToken = jwt.sign({ id: insertedId, email, info: startingInfo, isVerified: false },
            process.env.JWT_SECRET,
            { expiresIn: "15m" });
        const refreshToken = jwt.sign({ id: insertedId },
            process.env.JWT_REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" });

        await db.collection("users").updateOne({ _id: insertedId }, { $set: { refreshToken } });

        res.status(200).json({ accessToken, refreshToken, message: "Registration successful" });
    }
}
