import cors from 'cors';
import express from 'express';
import { routes } from './routes/routing.js';
import { initializeDbConnection } from './db.js';

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors());

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

routes.forEach(route => {
    const method = route.method.toLowerCase();
    const path = route.path;
    const handler = route.handler;

    app[method](path, handler);
});

initializeDbConnection()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to the database', err);
    });