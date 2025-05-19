import dotenv from 'dotenv';
import { readdirSync, readFileSync } from 'fs';
import { join, parse } from 'path';
import pg from 'pg';

// Load environment
dotenv.config();

// Load queries
const queriesDir = join('database', 'queries');
const queries = {};

for (const file of readdirSync(queriesDir)) {
    if (file.endsWith('.sql')) {
        const name = parse(file).name; // Get filename without extension .sql
        queries[name] = readFileSync(join(queriesDir, file), 'utf-8');
    }
}

// Initialize database
const db = new pg.Client({
    user: 'postgres',
    password: process.env.DB_PASSWORD,

    host: 'localhost',
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});
db.connect();

function ifExists(result) {
    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return null;
    }
}

const database = {
    async getMeal(id) {
        // Get product info
        let result = await db.query(queries['getMeal'], [id]);
        const product = result.rows[0];

        // Get ingredients
        result = await db.query(queries['getIngredients'], [id]);
        product['ingredients'] = [];

        // Add them to the product object
        for (const { name } of result.rows) {
            product['ingredients'].push(name);
        }

        return product;
    },
    async getMenu() {
        const menu = [];

        // Get restarants
        const result = await db.query(queries['getRestaurants']);

        for (const restarant of result.rows) {
            // Get meals for restaurant
            const result = await db.query(queries['getMeals'], [restarant['id']]);

            // Add them to object
            restarant['meals'] = result.rows;

            // Add complete restarant to menu
            menu.push(restarant);
        }

        return menu;
    },
    async getCart(sessionCart) {
        for (const [mealID, info] of Object.entries(sessionCart)) {
            const result = await db.query(queries['getCartMeal'], [mealID]);

            sessionCart[mealID] = { ...info, ...result.rows[0] };
        }

        return sessionCart;
    },
    async getUserByEmail(email) {
        const result = await db.query(queries['getUserByEmail'], [email]);

        return ifExists(result);
    },
    async getUserById(id) {
        const result = await db.query(queries['getUserById'], [id]);

        return ifExists(result);
    },
    async addUser(data) {
        const userData = [
            data['firstName'],
            data['lastName'],
            data['email'],
            data['phoneNumber'],
            data['address'],
            data['postcode'],
            data['password'],
            data['newsletter'],
            data['privacyPolicy'],
            data['isAdmin']
        ];

        const result = await db.query(queries['addUser'], userData);
        return result.rows[0];
    }
};

export default database;
