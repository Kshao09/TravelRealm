import bcrypt from 'bcryptjs';
import { getDbConnection } from '../db.js';

export const resetPasswordRoute = {
    path: '/api/users/:passwordResetCode/reset-password',
    method: "PUT",
    handler: async (req, res) => {
        const passwordResetCode = req.params;
        const newPassword = req.body;

        const db = getDbConnection("react-auth-db");

        const newSalt = uuid();
        const pepper = process.env.PEPPER_STRING;

        const newPasswordHash = await bcrypt.hash(newPassword, 10);

        const result = await db.collection('users').findOneAndUpdate({ passwordResetCode }, {
            $set: { passwordHash: newPasswordHash },
            $unset: { passwordResetCode: '' },
        });

        if (result.lastErrorObject.n === 0) {
            return res.status(404).json({ message: "No user found" });
        }
        return res.sendStatus(200);
    }
}