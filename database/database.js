import { readdirSync, readFileSync } from 'fs';
import { join, parse } from 'path';
import pg from 'pg';

// Load queries
const queriesDir = join('database', 'queries');
const queries = {};

for (const file of readdirSync(queriesDir)) {
    if (file.endsWith('.sql')) {
        const name = parse(file).name; // get filename without .sql
        queries[name] = readFileSync(join(queriesDir, file), 'utf-8');
    }
}

// Initialize database
const db = new pg.Client({
    user: 'postgres',
    password: 'ec5Zmbnd',

    host: 'localhost',
    database: 'Matraketen',
    port: 5432
});
db.connect();

const database = {
    async queryMeal(id) {
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
    async queryMenu() {
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
    }
};

export default database;
