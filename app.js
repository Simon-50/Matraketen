import express from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import database from './database/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize App
const app = express();
const PORT = 3000;

// Add middlewares
app.use(express.static(join(__dirname, 'public'))); // Serve public
app.use(express.urlencoded({ extended: true })); // urlencoded parser

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/menu', async (req, res) => {
    const menu = await database.queryMenu();
    res.render('menu', { menu: menu });
});

app.get('/product', (req, res) => {
    res.render('product');
});

app.get('/cart', (req, res) => {
    res.render('cart');
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

app.get('/reset-password', (req, res) => {
    res.render('password');
});

app.get('/profile', (req, res) => {
    res.render('profile');
});

app.get('/admin', (req, res) => {
    res.render('admin');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
