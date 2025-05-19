import database from '../database/database.js';

const cart = {
    async init(req, res) {
        if (!req.session.cart) {
            req.session.cart = {};
        }

        // Cart testing
        if (false) {
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
