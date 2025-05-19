import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { dirname, join } from 'path';

export default function applyMiddlewares(app, __dirname) {
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
            secret: '13af98c158e9779573884a57542f50ddc12f83a098f18c6a7f530a14cfd42a11acccb73ab19773a04f609e11548f3004fb42351bcf46c16fb0de6bc9a2c04875',
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge: 1000 * 60 * 60 // 1h
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
}
