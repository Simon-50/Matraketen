-- Restaurants
CREATE TABLE restaurants (
    id SERIAL NOT NULL PRIMARY KEY,
    restaurant_name TEXT NOT NULL UNIQUE,
    logo_name TEXT NOT NULL
);

-- Meals
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    offering_restaurant_id INT NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    dish_name TEXT NOT NULL,
    dish_description TEXT,
    image_name TEXT
);


-- Meal content
CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    ingredient_name TEXT NOT NULL UNIQUE
);

-- Meal to content 
CREATE TABLE meal_ingredients (
    meal_id INT NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    ingredient_id INT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    PRIMARY KEY (meal_id, ingredient_id)
);

-- Customers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE,
    phone_number TEXT,
    address TEXT,
    postcode TEXT,
    password TEXT,
    newsletter BOOLEAN DEFAULT FALSE,
    privacy_policy_accepted BOOLEAN NOT NULL
);


-- Add data
INSERT INTO restaurants (restaurant_name, logo_name)
VALUES
    ('McDonalds', 'Mclogo.webp'),
    ('Burger King', 'bklogo.webp'),
    ('Benne Pastabar', 'bennelogo.webp');

INSERT INTO ingredients (ingredient_name)
VALUES
    ('Kött'),                       -- 1
    ('Cheddar'),                    -- 2
    ('Ketchup'),                    -- 3
    ('Senap'),                      -- 4
    ('Inlagd Gurka'),               -- 5
    ('Finhackad lök (frystorkad)'), -- 6
    ('Kryddblandning'),             -- 7
    ('Kyckling'),                   -- 8
    ('Tomat'),                      -- 9
    ('Isbergssallad'),              -- 10
    ('Sås, Vegan McFeast'),         -- 11
    ('Tortilla'),                   -- 12
    ('Bröd'),                       -- 13
    ('Sås, Tasty'),                 -- 14
    ('Long bun'),                   -- 15
    ('Äggfri majonnäs'),            -- 16
    ('Chicken Royale'),             -- 17
    ('Whopperbröd'),                -- 18
    ('Whopper kött'),               -- 19
    ('Bacon'),                      -- 20
    ('Ägg'),                        -- 21
    ('Gluten'),                     -- 22
    ('Soja'),                       -- 23
    ('Selleri'),                    -- 24
    ('Vitlök'),                     -- 25
    ('Lök'),                        -- 26
    ('Mjölk');                      -- 27

INSERT INTO meals (offering_restaurant_id, dish_name, dish_description, image_name)
VALUES
    (
        1,
        'Cheeseburger',
        'Njut av den ostliknande läckerheten hos en McDonald''s Cheeseburgare! Vår enkla, klassiska cheeseburgare börjar med en burgarbiff av 100 % rent nötkött som kryddats med en nypa salt och peppar. McDonald''s Cheeseburger toppas med en syrlig saltgurka, hackad lök, ketchup, senap och en skiva smältande amerikansk ost. Den innehåller inga konstgjorda smaker, konserveringsmedel eller tillsatta färger från konstgjorda källor.',
        'mcdonalds-burgare.webp'
    ),
    (
        1,
        'McWrap',
        'Vår efterlängtade McWrap® är äntligen tillbaka på menyn! Den innehåller delad Chicken Premiere, sallad, tomat och McFeast-sås.',
        'mcwrap.webp'
    ),
    (
        1,
        'McChicken',
        'Vår populära Mc Chicken finns nu i en mindre version med den oemotståndligt goda Tasty-såsen, sallad och cheddar. Allt samlat i ett varmt och luftigt bröd.',
        'mcchicken.webp'
    ),
    (
        2,
        'Chicken royal',
        'En extra lång burgare med saftig, panerad kycklingfilé, färsk sallad och majonnäs.',
        'bkroyal.webp', 
    ),
    (
        2,
        'Chicken nuggets',
        'Krispiga på utsidan, saftiga på insidan. Inte undra på att våra panerade Chicken Nuggets är populära.',
        'bknuggets.webp', 
    ),
    (
        2,
        'Bacon king stack',
        'Den ikoniska Bacon King - mer överdådig än någonsin. Vi har gett din favoritburgare en uppgradering värdig en kung. En dubbelburgare med 100% grillat saftigt nötkött, toppad med 4 skivor cheddarost, krämig majonnäs och ketchup, och med en krona av 10 skivor knaprigt, rökigt bacon. Det här är inte bara en burgare, det är en Bacon King-upplevelse!',
        'bkbacon.webp', 
    ),
    (
        3,
        'Green Ragu'
        'Vegofärs från Anamma i vår mustiga ragusås smaksatt med färsk rosmarin och lagerblad. Toppad med lagrad hårdost, en vegansk vitlöks-créme fraiche, hackad persilja, nymalen svartpeppar och extra virgin olivolja.',
        '',
    ),
        (
        3,
        'Double cheese'
        'Vår himmelskt krämiga ostsås gjord på taleggio och lagrad hårdost, smaksatt med en generös mängd svartpeppar. Toppad med lagrad hårdost, hackad persilja och nymalen svartpeppar.',
        '',
    ),
        (
        3,
        'smokey pig'
        'Nystekt bacon i en krämig sås gjord på svenska mejerier som är smaksatt med svartpeppar. Toppad med lagrad hårdost och hackad persilja.',
        '',
    ),

INSERT INTO meal_ingredients (meal_id, ingredient_id)
VALUES
    (1, 13), (1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7),
    (2, 8), (2, 9), (2, 10), (2, 11), (2, 12),
    (3, 8), (3, 13), (3, 14), (3, 2),
    (4, 15), (4, 16), (4, 17), (4, 10),
    (5, 8),
    (6, 18), (6, 19), (6, 20), (6, 2), (6, 3), (6, 16),
    (7, 21), (7, 22), (7, 23), (7, 24), (7, 25), (7, 26),
    (8, 21), (8, 22), (8, 23),
    (9, ), (9, 22), (9, 23);
