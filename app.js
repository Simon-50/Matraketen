import express from 'express';
import session from 'express-session';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import database from './database/database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

//TODO Place this in a better spot
const shipping = 75;

// Initialize App
const app = express();
const PORT = 3000;

// Add middlewares
// Serve public
app.use(express.static(join(__dirname, 'public')));

// URLencoded parser
app.use(express.urlencoded({ extended: true }));

// Json support used for cart
app.use(express.json());

// Session
app.use(
    session({
        name: 'session.matraketen',
        secret: '13af98c158e9779573884a57542f50ddc12f83a098f18c6a7f530a14cfd42a11acccb73ab19773a04f609e11548f3004fb42351bcf46c16fb0de6bc9a2c04875',
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        }
    })
);

// Session - Debug
// app.use((req, res, next) => {
//     console.log(req.session);
//     next();
// });

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', join(__dirname, 'views'));

// Page get routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/menu', async (req, res) => {
    const menu = await database.queryMenu();
    res.render('menu', { menu });
});

app.get('/product', async (req, res) => {
    const productId = req.query['id'];
    const product = await database.queryMeal(productId);

    res.render('product', { product });
});

app.get('/cart', async (req, res) => {
    if (!req.session.cart) {
        req.session.cart = {};
    }

    // Copy before querying additional product info
    const cart = { ...req.session.cart };
    await database.queryCart(cart);

    res.render('cart', {
        cart,
        shipping
    });
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

app.get('/admin', async (req, res) => {
    const menu = await database.queryMenu();

    res.render('admin', { menu });
});

// Cart routes
app.post('/cart/add', (req, res) => {
    const { mealId } = req.body;

    // Create cart
    if (!req.session['cart']) {
        req.session['cart'] = {};
    }

    // Add to cart
    if (!req.session['cart'][mealId]) {
        req.session['cart'][mealId] = { count: 1 };
        console.log(`Add item (id=${mealId}) to cart`);
    } else {
        req.session['cart'][mealId]['count']++;
        console.log(`Incremented item (id=${mealId}) in cart`);
    }

    res.sendStatus(200);
});

app.delete('/cart/remove', (req, res) => {
    const { mealId } = req.body;

    try {
        req.session['cart'][mealId]['count']--;
        console.log(`Decremented item (id=${mealId}) in cart`);

        // Remove items if no longer in cart
        if (req.session['cart'][mealId]['count'] <= 0) {
            delete req.session['cart'][mealId];
        }
    } catch (err) {
        console.log(`Item (id=${mealId}) not present in cart`);
    }

    res.sendStatus(200);
});

app.delete('/cart', (req, res) => {
    req.session['cart'] = {};
    console.log('Cleared cart');

    res.sendStatus(200);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
