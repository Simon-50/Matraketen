import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy } from 'passport-local';
import database from '../database/database.js';
import mailer from './mailer.js';

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
                    return cb(null, user);
                }
            } else {
                // Prevent timing attacks
                await bcrypt.compare(
                    password,
                    '$2b$12$PF3Cq9XVJRjzfCtZ53RLLugeZ5dx9ZYOe2agVXJ3OKzN/w1Fhj276'
                );
            }

            // Incorrect credentials does not reveal if email exists
            return cb(null, false, { message: 'Fel email eller lösenord' });
        })
    );
}

const security = {
    async requireAuth(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        res.redirect('login');
    },
    async requireAdmin(req, res, next) {
        if (req.isAuthenticated() && req.user['is_admin']) {
            return next();
        }

        res.redirect('/');
    },
    async register(req, res) {
        const data = req.body;
        if (data['email'] !== data['confirmEmail']) {
            return res.status(400).json({ error: 'Email matchar inte' });
        } else if (data['password'] !== data['confirmPassword']) {
            return res.status(400).json({ error: 'Lösenorden matchar inte' });
        }

        if (!data['newsletter']) {
            data['newsletter'] = false;
        }

        delete data['confirmEmail'];
        delete data['confirmPassword'];

        data['privacyPolicy'] = true;
        data['isAdmin'] = false;

        // Preventing timing attacks by always hashing
        const hash = await bcrypt.hash(req.body['password'], saltRounds);
        req.body['password'] = hash;

        // Same error message for all cases
        const errorMessage = 'Registrering misslyckades. Kontrollera dina uppgifter';

        const user = await database.getUserByEmail(req.body['email']);
        if (user) {
            return res.status(500).json({ error: errorMessage });
        }

        const newUser = await database.addUser(req.body);

        req.logIn(newUser, (err) => {
            if (err) {
                return res.status(500).json({ error: errorMessage });
            }

            console.log(`Added new user: ${newUser['first_name']}`);
            return res.json({ redirectTo: '/' });
        });
    },
    async login(req, res, next) {
        passport.authenticate('local', (err, user, info) => {
            if (err || !user) {
                return res.status(400).json({ error: info['message'] });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Fel vid inloggning. Försök igen' });
                }
                return res.status(200).json({ redirectTo: '/' });
            });
        })(req, res, next);
    },
    async getResetCode(req, res) {
        const { email } = req.body;
        let code = null;

        try {
            code = await mailer.sendReset(email);
        } catch (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        const expires = Date.now() + 1000 * 60 * 5; // 5 minutes
        req.session['reset-password'] = { email, expires, sentCode: code };

        return res.status(200).json({ message: 'En kod har skickats' });
    },
    async verifyCode(req, res) {
        const { code, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Lösenorden matchar inte' });
        }

        const { email, sentCode, expires } = req.session['reset-password'];

        // If no code has been sent or user session has expired
        if (!sentCode || expires < Date.now() || code !== sentCode) {
            return res.status(400).json({ error: 'Fel eller utgången kod' });
        }

        // Hash new password and replace in database
        const hash = await bcrypt.hash(newPassword, 12);
        const result = await database.updatePassword(email, hash);

        console.log(result);

        res.status(200).json({ redirectTo: '/login' });
    }
};

export default security;
