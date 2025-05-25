import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { join } from 'path';

export default function applyMiddlewares(app, __dirname) {
    // Admin override only allowed on local database
    if (process.env.ADMIN && process.env.NODE_ENV !== 'production' && process.env.DATABASE_URL) {
        console.warn('⚠️  ADMIN OVERRIDE IS ENABLED ⚠️');
        app.use((req, res, next) => {
            if (!req.user) {
                req.user = {
                    id: 0,
                    first_name: 'admin',
                    last_name: 'admin',
                    email: 'admin@matraketen.com',
                    phone_number: 1000000000,
                    address: 'administratörsvägen 123',
                    postcode: 4567654,
                    password: '$2b$12$oYlLcmSzMckf5jCMTL4BduabrsigSGL0ITvLtNQVbl292avG6nsQO',
                    newsletter: false,
                    privacy_policy_accepted: true,
                    is_admin: true
                };
                req.isAuthenticated = () => true;
            }
            next();
        });
    }

    // Serve public
    app.use(express.static(join(__dirname, 'public')));

    // URLencoded parser
    app.use(express.urlencoded({ extended: true }));

    // Json support
    app.use(express.json());

    // Session
    app.use(
        session({
            name: 'session.matraketen',
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 1000 * 60 * 60 * 2 // 2h
            }
        })
    );

    // Passport
    app.use(passport.initialize());
    app.use(passport.session());

    // Send userdata to EJS templates
    app.use((req, res, next) => {
        res.locals.user = req.user || null;
        next();
    });

    // Set EJS as templating engine
    app.set('view engine', 'ejs');
    app.set('views', join(__dirname, 'views'));

    // Session - Debug
    // app.use((req, res, next) => {
    //     console.log(req.session);
    //     next();
    // });
}
