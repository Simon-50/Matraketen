import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy } from 'passport-local';
import database from '../database/database.js';

const saltRounds = 12;

export function setupPassport() {
    passport.serializeUser((user, cb) => {
        cb(null, user['id']);
    });
    passport.deserializeUser(async (id, cb) => {
        const user = await database.getUserById(id);
        cb(null, user);
    });

    passport.use(
        new Strategy(async function verify(email, password, cb) {
            const user = await database.getUserByEmail(email);
            if (user) {
                const match = await bcrypt.compare(password, user['password']);
                if (match) {
                    cb(null, user);
                } else {
                    cb(null, false, { message: 'Fel lösenord' });
                }
            } else {
                return cb(null, false, { message: 'Det finns inget konto med den e-postadressen' });
            }
        })
    );
}

const security = {
    async register(req, res) {
        (async () => {
            const data = req.body;
            if (data['email'] !== data['confirmEmail']) {
                return res.status(400).json({ error: 'Email matchar inte' });
            } else if (data['password'] !== data['confirmPassword']) {
                return res.status(400).json({ error: 'Lösenord matchar inte' });
            }

            if (!data['newsletter']) {
                data['newsletter'] = false;
            }

            delete data['confirmEmail'];
            delete data['confirmPassword'];

            data['privacyPolicy'] = true;
            data['isAdmin'] = false;

            const user = await database.getUserByEmail(req.body['email']);
            if (user) {
                return res.status(409).json({ error: 'User already exists' });
            }

            const hash = await bcrypt.hash(req.body['password'], saltRounds);
            req.body['password'] = hash;

            const newUser = await database.addUser(req.body);

            req.logIn(newUser, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Login error. Please try again' });
                }

                console.log(`Added new user: ${newUser['first_name']}`);
                return res.json({ redirectTo: '/' });
            });
        })();
    },

    async login(req, res, next) {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.status(500).json({ error: info['message'] });
            }
            if (!user) {
                return res.status(401).json({ error: info['message'] });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Login error. Please try again' });
                }
                return res.status(200).json({ redirectTo: '/' });
            });
        })(req, res, next);
    }
};

export default security;
