import express from 'express';

import cart from './utils/cart.js';
import database from './database/database.js';
import applyMiddlewares from './utils/middlewares.js';
import security, { setupPassport } from './utils/security.js';
import admin from './utils/admin.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize App
const app = express();
const PORT = process.env.PORT || 3000;

// Apply all middlewares
applyMiddlewares(app, __dirname);

// Setup passport strategies
setupPassport();

//* Misc
// Session - Debug
// app.use((req, res, next) => {
//     console.log(req.session);
//     next();
// });

//* Page get routes
app.get('/', (req, res) => {
    res.render('index');
});
app.get('/menu', async (req, res) => {
    const menu = await database.getMenu();
    res.render('menu', { menu });
});
app.get('/product', async (req, res) => {
    const productId = req.query['id'];
    const product = await database.getMeal(productId);

    res.render('product', { product });
});
app.get('/confirmation', (req, res) => {
    res.render('confirmation');
});
app.get('/about', (req, res) => {
    res.render('omOss');
});
app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.get('/reset-password', security.requireAuth, (req, res) => {
    res.render('password');
});
app.get('/profile', security.requireAuth, (req, res) => {
    res.render('profile');
});
app.get('/admin', security.requireAdmin, async (req, res) => {
    const menu = await database.getMenu();

    res.render('admin', { menu });
});

// User routes
app.post('/register', security.register);
app.post('/login', security.login);

//* API routes
// Cart routes
app.get('/cart', cart.init);
app.delete('/cart', cart.clear);
app.post('/cart/add', cart.add);
app.delete('/cart/remove', cart.remove);

// Admin routes
app.post('/admin/meal', security.requireAdmin, admin.addMeal);
app.delete('/admin/meal', security.requireAdmin, admin.removeMeal);
app.post('/admin/restaurant', security.requireAdmin, admin.addRestaurant);
app.delete('/admin/restaurant', security.requireAdmin, admin.removeRestaurant);

// Start server
app.listen(PORT, () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log(`Server running on http://localhost:${PORT}`);
    }
});
