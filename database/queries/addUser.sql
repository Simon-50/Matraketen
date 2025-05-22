INSERT INTO
    customers (
        first_name,
        last_name,
        email,
        phone_number,
        address,
        postcode,
        password,
        newsletter,
        privacy_policy_accepted,
        is_admin
    )
VALUES
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
RETURNING
    id,
    first_name;