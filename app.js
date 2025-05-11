import express from 'express';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Serve static files
app.use(express.static(join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/menu', (req, res) => {
    res.render('menu');
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
