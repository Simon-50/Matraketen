import express from 'express';

import cart from './utils/cart.js';
import database from './database/database.js';
import applyMiddlewares from './utils/middlewares.js';
import security, { setupPassport } from './utils/security.js';
import admin from './utils/admin.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { title } from 'process';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize App
const app = express();
const PORT = process.env.PORT || 3000;

// Apply all middlewares
applyMiddlewares(app, __dirname);

// Setup passport strategies
setupPassport();

//* Page get routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Hem' });
});
app.get('/menu', async (req, res) => {
    const menu = await database.getMenu();
    res.render('menu', { title: 'Meny', menu });
});
app.get('/product', async (req, res) => {
    const productId = req.query['id'];
    const product = await database.getMeal(productId);

    res.render('product', { title: 'Produkt', product });
});
app.get('/confirmation', (req, res) => {
    res.render('confirmation', { title: 'Orderbekräftelse' });
});
app.get('/about', (req, res) => {
    res.render('omOss', { title: 'Om oss' });
});
app.get('/login', (req, res) => {
    res.render('login', { title: 'Logga in' });
});
app.get('/register', (req, res) => {
    res.render('register', { title: 'Registrera' });
});
app.get('/reset-password', (req, res) => {
    res.render('password', { title: 'Återställ lösenord' });
});
app.get('/profile', security.requireAuth, (req, res) => {
    res.render('profile', { title: 'Profil' });
});
app.get('/admin', security.requireAdmin, async (req, res) => {
    const menu = await database.getMenu();

    res.render('admin', { title: 'Administratör', menu });
});

// User post routes
app.post('/register', security.register);
app.post('/login', security.login);
app.post('/password/get', security.getResetCode);
app.post('/password/verify', security.verifyCode);
app.post('/profile/details', security.requireAuth, security.updateDetails);
app.post('/profile/password', security.requireAuth, security.updatePassword);

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
