import crypto from 'crypto';
import { readFileSync } from 'fs';
import nodemailer from 'nodemailer';
import { join } from 'path';

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
 * @returns six-digit code
 */
function generateCode() {
    return crypto.randomInt(100000, 999999).toString();
}

const mailer = {
    /**
     * Generate code and send to given email adress
     * @param {string} recipientEmail
     * @returns Code sent to given email
     */
    async sendReset(recipientEmail) {
        const code = generateCode();

        // Get html to send
        let html = readFileSync(join('static-html', 'email.html'), 'utf-8');
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
    }
};

export default mailer;
