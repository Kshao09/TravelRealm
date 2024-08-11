import jwt from 'jsonwebtoken';
import { getGoogleUser } from '../util/getGoogleUser.js';
import { updateOrCreateUserFromOAuth } from '../util/updateOrCreateUserFromOAuth.js';

export const googleOAuthCallbackRoute = {
    path: "/auth/google/callback",
    method: "GET",
    handler: async (req, res) => {
        const { code } = req.query;

        const oauthUserInfo = await getGoogleUser({ code });
        const updatedUser = await updateOrCreateUserFromOAuth({ oauthUserInfo });

        const { _id: id, isVerified, email, info } = updatedUser;

        jwt.sign({ id, isVerified, email, info },
            process.env.JWT_SECRET,
            (err, token) => {
                if (err) {
                    res.status(500).json(err.message);
                }
                res.redirect(`http://localhost:3000/HTML/login_register.html?token=${token}`);
            })

    }
}