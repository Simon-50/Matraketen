SELECT
    ingredients.name
FROM
    meal_ingredients
    INNER JOIN ingredients ON meal_ingredients.ingredient_id = ingredients.id
WHERE
    meal_ingredients.meal_id = $1
ORDER BY
    name ASC;