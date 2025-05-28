import database from '../database/database.js';
import mailer from './mailer.js';

const cart = {
    /**
     * Initializes the cart in the session and renders the cart page with product info.
     */
    async init(req, res) {
        if (!req.session.cart) {
            req.session.cart = {};
        }

        // Cart testing
        if (process.env.DEBUG === 'true' || false) {
            req.session.cart = {
                1: { count: 2 },
                4: { count: 4 },
                7: { count: 1 },
                5: { count: 100 },
                8: { count: 10 }
            };
        }

        // Copy before querying additional product info
        const cart = { ...req.session.cart };
        await database.getCart(cart);

        res.render('cart', {
            title: 'Kundvagn',
            shipping: 75,
            cart
        });
    },
    /**
     * Adds a meal to the cart or increments its count.
     */
    async add(req, res) {
        const { mealId } = req.body;
        if (!req.session['cart']) {
            req.session['cart'] = {};
        }
        if (!req.session['cart'][mealId]) {
            req.session['cart'][mealId] = { count: 1 };
        } else {
            req.session['cart'][mealId]['count']++;
        }
        res.sendStatus(200);
    },
    /**
     * Decrements the count of a meal in the cart or removes it if count reaches zero.
     */
    async remove(req, res) {
        const { mealId } = req.body;
        try {
            req.session['cart'][mealId]['count']--;
            if (req.session['cart'][mealId]['count'] <= 0) {
                delete req.session['cart'][mealId];
            }
        } catch (err) {
            // Item not present in cart
        }
        res.sendStatus(200);
    },
    /**
     * Clears all items from the cart after sending order confirmation if logged in
     */
    async clear(req, res) {
        await mailer.sendConfirmation(req.body['email'], req.session['cart'])

        req.session['cart'] = {};
        res.sendStatus(200);
    }
};

export default cart;
