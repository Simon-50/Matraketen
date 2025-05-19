import database from '../database/database.js';

const cart = {
    async init(req, res) {
        if (!req.session.cart) {
            req.session.cart = {};
        }

        // Copy before querying additional product info
        const cart = { ...req.session.cart };
        await database.getCart(cart);

        res.render('cart', {
            cart,
            shipping: 75
        });
    },
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
    async clear(req, res) {
        req.session['cart'] = {};
        res.sendStatus(200);
    }
};

export default cart;
