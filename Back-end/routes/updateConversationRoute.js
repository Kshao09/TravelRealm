import { getDbConnection } from "../db.js";

export const updateConversationRoute = {
    path: "/api/update-conversation/:id",
    method: "PUT",
    handler: async (req, res) => {
        const db = getDbConnection("react-auth-db");
        const { id } = req.params;
        const { username, category, content, images, reactions } = req.body;

        try {
            const existingPost = await db.collection('conversations').findOne({ id });

            if (!existingPost) {
                return res.status(404).send({ message: "Post not found" });
            }

            const result = await db.collection('conversations').updateOne(
                { id: id },
                {
                    $set: {
                        username,
                        category,
                        content,
                        images,
                        reactions
                    }
                }
            );

            if (result.matchedCount > 0) {
                res.status(200).send({ message: 'Post updated successfully' });
            } else {
                res.status(409).send({ message: 'Conflict: Post could not be updated' });
            }
        } catch (error) {
            console.error("Failed to update post:", error);
            res.status(500).send({ message: 'Failed to update post' });
        }
    }
};