import { getDbConnection } from '../db.js';

export const saveConversationRoute = {
    path: '/api/save-conversation',
    method: "POST",
    handler: async (req, res) => {
        const db = getDbConnection("react-auth-db");
        const { id, username, category, content, images, reactions } = req.body;

        try {
            const existingPost = await db.collection('conversations').findOne({ id });

            if (existingPost) {
                return res.status(409).send({ message: "Post already exists" });
            }

            await db.collection('conversations').insertOne({
                id,
                username,
                category,
                content,
                images,
                reactions
            });

            res.status(200).send({ message: 'Post created successfully', id });
        } catch (error) {
            console.error("Failed to create post:", error);
            res.status(500).json({ message: 'Failed to save conversation', error });
        }
    },
};