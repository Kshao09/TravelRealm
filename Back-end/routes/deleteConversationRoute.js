import { getDbConnection } from '../db.js';
import pkg from 'mongodb';
const { ObjectId } = pkg;

export const deleteConversationRoute = {
    path: '/api/delete-conversation/:id',
    method: "DELETE",
    handler: async (req, res) => {
        const { id } = req.params;

        const db = getDbConnection("react-auth-db");

        try {
            console.log(`Attempting to delete post with id: ${id}`);
            const result = await db.collection('conversations').deleteOne({ id });

            if (result.deletedCount === 0) {
                console.log(`Post with id: ${id} not found`);
                return res.status(404).send('Post not found');
            }

            console.log(`Post with id: ${id} deleted successfully`);
            res.status(200).send('Post deleted successfully');
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete post', error });
        }
    },
};
