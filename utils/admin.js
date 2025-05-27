import database from '../database/database.js';

const admin = {
    /**
     * Add meal, ingredients, and their bindings to the db. Handles already added ingredients.
     */
    async addMeal(req, res) {
        const mealResult = await database.addMeal(req.body);

        // Add ingredients and meal-ingredient binding
        let ingredients = req.body['contents'];
        ingredients = ingredients.split('\n').filter((v) => v);

        for (const ingredient of ingredients) {
            const ingredientResult = await database.addIngredient(ingredient);

            await database.addMealIngredientBinding(mealResult['id'], ingredientResult['id']);
        }
        res.sendStatus(200);
    },
    /**
     * Remove meal from db.
     */
    async removeMeal(req, res) {
        const result = await database.removeMeal(req.body['mealId']);
        res.json({ success: result });
    },
    /**
     * Add restaurant to db.
     */
    async addRestaurant(req, res) {
        const result = await database.addRestaurant(req.body);

        if (result) {
            res.sendStatus(200);
        } else {
            res.sendStatus(409);
        }
    },
    /**
     * Remove restaurant from db. Sends true if removed, false otherwise.
     */
    async removeRestaurant(req, res) {
        const result = await database.removeRestaurant(req.body['restaurantId']);
        res.json({ success: result });
    }
};

export default admin;
