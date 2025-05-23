import database from '../database/database.js';

const admin = {
    async addMeal(req, res) {
        // Add the meal itself
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
    async removeMeal(req, res) {
        const result = await database.removeMeal(req.body['mealId']);
        res.json({ success: result['rowCount'] > 0 });
    },
    async addRestaurant(req, res) {
        const result = await database.addRestaurant(req.body);

        if (result) {
            res.sendStatus(200);
        } else {
            res.sendStatus(409);
        }
    },
    async removeRestaurant(req, res) {}
};

export default admin;
