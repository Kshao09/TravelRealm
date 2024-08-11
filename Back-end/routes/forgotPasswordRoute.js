import { v4 as uuid } from 'uuid';
import { getDbConnection } from '../db.js';
import { sendEmail } from '../util/sendEmail.js';

export const forgotPasswordRoute = {
    path: '/api/forgot-password/:email',
    method: "PUT",
    handler: async (req, res) => {
        const { email } = req.params;

        const db = getDbConnection("react-auth-db");
        const passwordResetCode = uuid();

        const result = await db.collection("users").updateOne({ email }, { $set: { passwordResetCode } });

        console.log(result);

        if (result.modifiedCount > 0) {
            try {
                await sendEmail({
                    to: email,
                    from: "Kshao001@fiu.edu",
                    subject: "Password Reset",
                    text: `To reset your password, click this link: 
                    http://localhost:3000/reset-password/${passwordResetCode}`,
                });
            } catch (error) {
                console.error('Failed to send email:', error);
                res.status(500).json({ message: 'Failed to send password reset email.' });
            }
        } else {
            res.status(404).json({ message: 'User not found.' });
        }

        res.sendStatus(200);
    }
}