// Import the type definitions
/// <reference path="./types.js" />

import crypto from 'crypto';
import { readFileSync } from 'fs';
import nodemailer from 'nodemailer';
import { join } from 'path';
import database from '../database/database.js';

// Create transporter object
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Generates random code
 * @returns {Number} six-digit code
 */
function generateCode() {
    return crypto.randomInt(100000, 999999).toString();
}

const mailer = {
    /**
     * Generate code and send to given email adress
     * @param {string} recipientEmail
     * @returns {Promise<Number>} Code sent to given email
     */
    async sendReset(recipientEmail) {
        const code = generateCode();

        // Get html to send
        let html = readFileSync(join('static-html', 'email-templates', 'reset-code.html'), 'utf-8');
        html = html.replace('{{CODE}}', code);

        const options = {
            from: `"Matraketen" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: 'Din kod för att återställa lösenordet',
            text: `Koden för att återställa är: ${code}`,
            html
        };

        await transporter.sendMail(options);

        return code;
    },
    /**
     * Generate confirmation email and sent to given email adress
     * @param {string} recipientEmail
     * @param {SessionCart} sessionCart
     */
    async sendConfirmation(recipientEmail, sessionCart) {
        // Get full cart data
        const fullCart = await database.getCart(sessionCart);

        // Fill template
        let html = readFileSync(
            join('static-html', 'email-templates', 'order-confirmation.html'),
            'utf-8'
        );

        // Generate order summary HTML from fullCart
        const orderHtml = Object.values(fullCart)
            .map((item) => `<li>${item['name']} - ${item['count']} * ${item['cost']} kr</li>`)
            .join('');

        // Calculate sum
        let sum = 75;
        for (const item of Object.values(fullCart)) {
            sum += item['cost'] * item['count'];
        }

        // Add order and sum together
        const orderSummary = `<ul>${orderHtml}</ul><p>Totalt: ${sum} kr</p>`;

        html = html.replace('{{ORDER}}', orderSummary);

        const options = {
            from: `"Matraketen" <${process.env.EMAIL_USER}>`,
            to: recipientEmail,
            subject: 'Beställningsbekräftelse',
            text: `Tack för din beställning!`,
            html
        };

        await transporter.sendMail(options);
    }
};

export default mailer;
