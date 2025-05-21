INSERT INTO meals
    (offering_restaurant_id, name, cost, description, image_name)
VALUES
    ($1, $2, $3, $4, $5)
RETURNING id;
