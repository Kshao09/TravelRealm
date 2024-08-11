import { getGoogleOAuthUrl } from "../util/getGoogleOAuthUrl.js";

export const getGoogleOAuthUrlRoute = {
    path: '/auth/google/url',
    method: "GET",
    handler: (req, res) => {
        const url = getGoogleOAuthUrl();
        res.status(200).json({ url });
    }
}