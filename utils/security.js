import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy } from 'passport-local';
import database from '../database/database.js';
import mailer from './mailer.js';

const saltRounds = 12;

export function setupPassport() {
    // Use user id as identification
    passport.serializeUser((userId, cb) => {
        cb(null, userId);
    });

    // Make entire user accessible in backend
    passport.deserializeUser(async (id, cb) => {
        const user = await database.getUserById(id);
        cb(null, user);
    });

    // Login strategy
    passport.use(
        new Strategy(async function verify(email, password, cb) {
            const user = await database.getUserByEmail(email);

            if (user) {
                const match = await bcrypt.compare(password, user['password']);
                if (match) {
                    return cb(null, user);
                }
            } else {
                // Prevent timing attacks by doing compare regardless of user existence
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
    /**
     * Middleware requiring authentication to pass
     */
    async requireAuth(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        res.redirect('login');
    },
    /**
     * Middleware requiring authentication and admin status to pass
     */
    async requireAdmin(req, res, next) {
        if (req.isAuthenticated() && req.user['is_admin']) {
            return next();
        }

        res.redirect('/');
    },
    /**
     * Register new user
     */
    async register(req, res) {
        const data = req.body;

        // Check that double fields match
        if (data['email'] !== data['confirmEmail']) {
            return res.status(400).json({ error: 'Email matchar inte' });
        } else if (data['password'] !== data['confirmPassword']) {
            return res.status(400).json({ error: 'Lösenorden matchar inte' });
        }

        // Not included in data if not ticked
        if (!data['newsletter']) {
            data['newsletter'] = false;
        }

        delete data['confirmEmail'];
        delete data['confirmPassword'];

        // Can't register as admin even with custom requests
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

        const newUserId = await database.addUser(req.body);

        req.logIn(newUserId, (err) => {
            if (err) {
                return res.status(500).json({ error: errorMessage });
            }

            return res.json({ redirectTo: '/' });
        });
    },
    /**
     * Login user using passport strategy
     */
    async login(req, res, next) {
        passport.authenticate('local', (err, user, info) => {
            if (err || !user) {
                return res.status(400).json({ error: info['message'] });
            }
            req.logIn(user['id'], (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Fel vid inloggning. Försök igen' });
                }
                return res.status(200).json({ redirectTo: '/' });
            });
        })(req, res, next);
    },
    /**
     * Send code to given email and save with and expiration date
     */
    async getResetCode(req, res) {
        const { email } = req.body;
        let code = null;

        try {
            code = await mailer.sendReset(email);
        } catch (err) {
            console.log(err);
            return res.sendStatus(500);
        }

        // 5 minutes
        const expires = Date.now() + 1000 * 60 * 5;
        req.session['reset-password'] = { email, expires, sentCode: code };

        return res.status(200).json({ message: 'En kod har skickats' });
    },
    /**
     * Verify code sent to user and update password if correct
     */
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
        const hash = await bcrypt.hash(newPassword, saltRounds);
        const result = await database.updatePassword(email, hash);

        res.status(200).json({ redirectTo: '/login' });
    },
    /**
     * Update user details
     */
    async updateDetails(req, res) {
        const userDetails = { ...req.body };
        userDetails['newsletter'] = Boolean(req.body['newsletter']);

        await database.updateDetails(req.body);

        res.sendStatus(200);
    },
    /**
     * Update password
     */
    async updatePassword(req, res) {
        // Check that passwords match
        if (req.body['newPassword'] !== req.body['repeatPassword']) {
            return res.status(400).json({ error: 'Lösenorden matchar inte' });
        }

        // Correct current password
        if (!(await bcrypt.compare(req.body['currentPassword'], req.user['password']))) {
            return res.status(401).json({ error: 'Fel nuvarande lösenord' });
        }

        // Update in db
        const hash = await bcrypt.hash(req.body['newPassword'], saltRounds);
        await database.updatePassword(req.user['email'], hash);

        res.sendStatus(200);
    }
};

export default security;
