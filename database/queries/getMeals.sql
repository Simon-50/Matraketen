SELECT
    *
FROM
    meals
WHERE
    offering_restaurant_id = $1
ORDER BY
    name ASC;