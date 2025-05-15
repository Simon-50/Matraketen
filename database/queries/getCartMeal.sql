SELECT meals.name, meals.cost, meals.image_name, restaurants.logo_name FROM meals
INNER JOIN restaurants ON meals.offering_restaurant_id = restaurants.id
WHERE meals.id = $1;