/**
 * @typedef {Object} MealData Data required to add a new meal to db
 * @property {String} name Meal name
 * @property {Number} cost Price in SEK
 * @property {String} description Short meal description
 * @property {String} imageName Name of file displaying meal
 */

/**
 * @typedef {Object} RestaurantData Data required to add a new restaurant to db
 * @property {String} name Restaurant name
 * @property {String} logotypeName Name of file of the logotype
 */

/**
 * @typedef {Object} Meal Full meal information
 * @property {Number} id Meal id
 * @property {Number} offering_restaurant_id Id of the restaurant that offers this meal
 * @property {String} name Meal name
 * @property {String} description Short meal description
 * @property {String} image_name Name of file displaying meal
 * @property {String[]} ingredients Array of ingredients
 */

/**
 * @typedef {Object} MenuMeal Partial meal information
 * @property {Number} id Meal id
 * @property {Number} offering_restaurant_id Id of the restaurant that offers this meal
 * @property {String} name Meal name
 * @property {String} description Short meal description
 * @property {String} image_name Name of file displaying meal
 */

/**
 * @typedef {Object} MenuRestaurant Partial restaurant information
 * @property {Number} id Id of restaurant
 * @property {String} name Restaurant name
 * @property {String} logo_name Name of file of the logotype
 * @property {MenuMeal[]} meals All meals offered by this restaurant
 */

/**
 * @typedef {Object} SessionCartItem
 * @property {Number} count Number of items in cart
 */

/**
 * @typedef {Object.<number, SessionCartItem>} SessionCart
 * Cart object with meal id as key and SessionCartItem as value.
 * The key (number) is the id of the meal.
 */

/**
 * @typedef {Object} CartItem
 * @property {Number} count Number of items in cart
 * @property {String} name Meal name
 * @property {Number} cost Price in SEK
 * @property {String} image_name Name of file displaying meal
 * @property {String} logo_name Name of file of the offering restaurants logo
 */

/**
 * @typedef {Object.<number, CartItem>} Cart
 * Cart object with meal id as key and CartItem as value.
 * The key (number) is the id of the meal.
 */

/**
 * @typedef {Object} UserData Data required to add a new user to db
 * @property {String} firstName
 * @property {String} lastName
 * @property {String} email
 * @property {Number} phoneNumber
 * @property {String} address
 * @property {Number} postcode
 * @property {String} password
 * @property {Boolean} newsletter
 * @property {Boolean} privacyPolicy
 * @property {Boolean} isAdmin
 */

/**
 * @typedef {Object} User
 * @property {Number} id User id
 */
