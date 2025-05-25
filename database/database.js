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

// Use local db if available, otherwise use online one
const db = new pg.Pool(
    process.env.DATABASE_URL
        ? {
              connectionString: process.env.DATABASE_URL
          }
        : {
              connectionString: process.env.RENDER_DATABASE_URL,
              ssl: {
                  rejectUnauthorized: false
              }
          }
);

function ifExists(result) {
    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return null;
    }
}

const database = {
    //* Meals
    async addMeal(data) {
        const restaurant = await this.getRestaurant(data['restaurant']);

        const mealData = [
            restaurant['id'],
            data['name'],
            data['cost'],
            data['description'],
            data['imageName']
        ];

        const result = await db.query(queries['addMeal'], mealData);
        return result.rows[0];
    },
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
    async removeMeal(id) {
        return db.query(queries['removeMeal'], [id]);
    },
    async addIngredient(ingredient) {
        try {
            const result = await db.query(queries['addIngredient'], [ingredient]);
            return result.rows[0];
        } catch (err) {
            // UNIQUE violation
            if (err.code === '23505') {
                const result = await db.query(queries['getIngredientId'], [ingredient]);
                return result.rows[0];
            } else {
                throw err;
            }
        }
    },
    async addMealIngredientBinding(mealId, ingredientId) {
        await db.query(queries['addMealIngredientBinding'], [mealId, ingredientId]);
    },
    async addRestaurant(data) {
        const restaurantData = [data['name'], data['logotypeName']];

        try {
            const result = await db.query(queries['addRestaurant'], restaurantData);
            return result;
        } catch (err) {
            // UNIQUE violation
            if (err.code === '23505') {
                return false;
            } else {
                throw err;
            }
        }
    },
    async getRestaurant(name) {
        const result = await db.query(queries['getRestaurant'], [name]);

        return ifExists(result);
    },
    async removeRestaurant(id) {
        const result = await db.query(queries['removeRestaurant'], [id]);
        return result;
    },
    async getMenu() {
        const menu = [];

        // Get restaurants
        const result = await db.query(queries['getRestaurants']);

        for (const restaurant of result.rows) {
            // Get meals for restaurant
            const result = await db.query(queries['getMeals'], [restaurant['id']]);

            // Add them to object
            restaurant['meals'] = result.rows;

            // Add complete restaurant to menu
            menu.push(restaurant);
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
    },
    async getUserById(id) {
        const result = await db.query(queries['getUserById'], [id]);

        return ifExists(result);
    },
    async updatePassword(email, hash) {
        return db.query(queries['updatePassword'], [email, hash]);
    }
};

export default database;
