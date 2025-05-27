function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function additionAnimation(event) {
    button = event.target;

    const plus = document.createElement('div');
    plus.textContent = '+';
    plus.classList.add('floating-plus');

    const rect = button.getBoundingClientRect();

    // Select random horizontal position within button
    horisontalPosition = getRandomInt(Math.round(rect.left) + 10, Math.round(rect.right) - 10);

    // Adjust for scroll position
    plus.style.left = `${horisontalPosition}px`;
    plus.style.top = `${rect.top + window.scrollY}px`;

    document.body.appendChild(plus);

    // Remove element after animation
    plus.addEventListener('animationend', () => {
        plus.remove();
    });
}

function updateElement(element, value) {
    element.textContent = value;
}

function updateCounter(id, delta) {
    // Visually decrement without forcing full page update

    // Don't go below 0 items
    if (cart[id]['count'] > 0 || (cart[id]['count'] === 0 && delta > 0)) {
        cart[id]['count'] = cart[id]['count'] + delta;
    }

    updateElement(document.querySelector(`#item-count-${id}`), cart[id]['count']);
    updateElement(document.querySelector(`#sum-count-${id}`), cart[id]['count']);
    updateTotal();
}

function updateTotal() {
    let sum = shipping;

    for (const item of Object.values(cart)) {
        sum += item['cost'] * item['count'];
    }

    // Update element with rounded sum to two digits
    updateElement(document.querySelector('#total'), sum.toFixed(2));
}

document.addEventListener('click', async (event) => {
    // If click event is triggered by element with class

    if (event.target.matches('.add-to-cart')) {
        const mealId = event.target.dataset['id'];

        const response = await fetch('/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mealId })
        });

        if (response.ok) {
            console.log('Added to cart');

            // Update visual indicator if user is on cart page
            if (location.pathname === '/product') {
                additionAnimation(event);
            } else if (location.pathname === '/cart') {
                updateCounter(mealId, 1);
            }
        }
    } else if (event.target.matches('.remove-from-cart')) {
        const mealId = event.target.dataset['id'];

        const response = await fetch('/cart/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mealId })
        });

        if (response.ok) {
            console.log('Removed from cart');

            if (location.pathname === '/cart') {
                updateCounter(mealId, -1);
            }
        }
    } else if (event.target.matches('.confirm-order')) {
        const response = await fetch('/cart', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Cart emptied');
        }
    }
});
