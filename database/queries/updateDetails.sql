UPDATE users
SET
    first_name = $2,
    last_name = $3,
    email = $4,
    phone_number = $5,
    address = $6,
    postcode = $7,
    newsletter = $8
WHERE
    id = $1;