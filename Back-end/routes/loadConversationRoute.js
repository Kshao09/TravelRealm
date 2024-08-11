import { getDbConnection } from "../db.js";

export const loadConversationRoute = {
    path: '/api/load-conversation',
    method: "GET",
    handler: async (req, res) => {
        const db = getDbConnection("react-auth-db");

        try {
            const conversations = await db.collection('conversations').find({}).toArray();
            res.status(200).json(conversations);
        } catch (err) {
            res.status(500).json({ message: "Failed to load conversations", err });
        }
    },
};