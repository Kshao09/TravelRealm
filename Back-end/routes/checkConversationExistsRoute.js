import { getDbConnection } from "../db.js";

export const checkConverationExistsRoute = {
    path: "/api/check-conversation/:id",
    method: "GET",
    handler: async (req, res) => {
        const db = getDbConnection("react-auth-db");

        const { id } = req.params;

        try {
            const conversation = await db.collection("conversations").findOne({ id });

            if (!conversation) {
                return res.status(404).json({ message: "Conversation not found" });
            }

            res.status(200).json(conversation);
        } catch (error) {
            res.status(500).json({ message: "Error checking conversation", error });
        }
    }
};