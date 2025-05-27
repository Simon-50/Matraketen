// Import the type definitions
/// <reference path="../utils/types.js" />

// Import modules
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

/**
 * Extract query data if there is any
 * @param {pg.QueryArrayResult} result Result from db query
 * @returns Query result if any, otherwise null
 */
function ifExists(result) {
    if (result.rows.length > 0) {
        return result.rows[0];
    } else {
        return null;
    }
}

/**
 * Check if any data was removed from db
 * @param {pg.QueryArrayResult} result Result from db query
 * @returns true if anything was removed, false otherwise
 */
function ifRemoved(result) {
    return result['rowCount'] > 0;
}

const database = {
    //* Meals
    /**
     * Add meal to db
     * @param {MealData} data Data required for db insertion
     * @returns {Promise<Object>} Promise resolving to id assigned to meal
     */
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
    /**
     * Get meal from db
     * @param {Number} id id of meal requested
     * @returns {Promise<Meal>} Promise resolving to meal data and its ingredients
     */
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
    /**
     * Remove meal from db
     * @param {Number} id Id of meal to delete
     * @returns {Promise<Boolean>} Promise resolving to true if Meal found and deleted
     */
    async removeMeal(id) {
        const result = await db.query(queries['removeMeal'], [id]);
        return ifRemoved(result);
    },
    /**
     * Add ingredient to db, if already added get its id
     * @param {String} ingredient Ingredient name
     * @returns {Promise<Object>} Promise resolving to id of ingredient
     */
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
    /**
     * Add meal-ingredient binding to db
     * @param {Number} mealId
     * @param {Number} ingredientId
     * @returns {Promise<void>} Promise that resolves when binding is added
     */
    async addMealIngredientBinding(mealId, ingredientId) {
        await db.query(queries['addMealIngredientBinding'], [mealId, ingredientId]);
    },
    /**
     * Add restaurant to db
     * @param {RestaurantData} data Data required for db insertion
     * @returns {Promise<pg.QueryArrayResult | null>} Promise resolving to query result or null
     */
    async addRestaurant(data) {
        const restaurantData = [data['name'], data['logotypeName']];

        try {
            return db.query(queries['addRestaurant'], restaurantData);
        } catch (err) {
            // Catch UNIQUE violations
            if (err.code === '23505') {
                return null;
            } else {
                throw err;
            }
        }
    },
    /**
     * Get restaurant from db
     * @param {String} name Name of requested restaurant
     * @returns {Promise<Object | null>} Promise resolving to query result if there is a restaurant with that name otherwise null
     */
    async getRestaurant(name) {
        const result = await db.query(queries['getRestaurant'], [name]);

        return ifExists(result);
    },
    /**
     * Remove restaurant from db
     * @param {Number} id Id of restaurant to delete
     * @returns {Promise<Boolean>} Promise resolving to true if restaurant is found and deleted
     */
    async removeRestaurant(id) {
        const result = await db.query(queries['removeRestaurant'], [id]);
        return ifRemoved(result);
    },
    /**
     * Get complete menu from db
     * @returns {Promise<MenuRestaurant[]>} Promise resolving to array of all restaurants in db
     */
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
    /**
     * Fills out session cart to full cart
     * @param {SessionCart} sessionCart Cart info stored in session
     * @returns {Promise<Cart>} Promise resolving to cart used to render /cart
     */
    async getCart(sessionCart) {
        for (const [mealID, info] of Object.entries(sessionCart)) {
            const result = await db.query(queries['getCartMeal'], [mealID]);

            sessionCart[mealID] = { ...info, ...result.rows[0] };
        }

        return sessionCart;
    },
    /**
     * Add user to db
     * @param {UserData} userData Data required for db insertion
     * @returns {Promise<Number>} Promise resolving to assigned id in db
     */
    async addUser(userData) {
        const queryOrder = [
            userData['firstName'],
            userData['lastName'],
            userData['email'],
            userData['phoneNumber'],
            userData['address'],
            userData['postcode'],
            userData['password'],
            userData['newsletter'],
            userData['privacyPolicy'],
            userData['isAdmin']
        ];

        const result = await db.query(queries['addUser'], queryOrder);
        return result.rows[0]['id'];
    },
    /**
     * Get user by email
     * @param {String} email
     * @returns {Promise<Object | null>} Promise resolving to query result if there is a user with that email otherwise null
     */
    async getUserByEmail(email) {
        const result = await db.query(queries['getUserByEmail'], [email]);

        return ifExists(result);
    },
    /**
     *  Get user by id
     * @param {Number} id
     * @returns {Promise<Object | null>} Promise resolving to query result if there is a user with that id otherwise null
     */
    async getUserById(id) {
        const result = await db.query(queries['getUserById'], [id]);

        return ifExists(result);
    },
    /**
     * Update every user detail but password and admin flag
     * @param {UserData} userDetails Data to be changed in db
     * @returns {Promise<pg.QueryArrayResult>} Promise resolving to query result
     */
    async updateDetails(userDetails) {
        const queryOrder = [
            userDetails['id'],
            userDetails['firstName'],
            userDetails['lastName'],
            userDetails['email'],
            userDetails['phoneNumber'],
            userDetails['address'],
            userDetails['postcode'],
            userDetails['newsletter']
        ];

        return db.query(queries['updateDetails'], queryOrder);
    },
    /**
     * Update password for user
     * @param {String} email Email of user to update
     * @param {String} hash New hash to place in db
     * @returns {Promise<pg.QueryArrayResult>} Promise resolving to query result
     */
    async updatePassword(email, hash) {
        return db.query(queries['updatePassword'], [email, hash]);
    }
};

export default database;
