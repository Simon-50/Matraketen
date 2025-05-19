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
    Object.values(cart).forEach((item) => {
        sum += item['cost'] * item['count'];
    });

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
            if (cart) updateCounter(mealId, 1);

            console.log('Added to cart');
        }
    }

    if (event.target.matches('.remove-from-cart')) {
        const mealId = event.target.dataset['id'];

        const response = await fetch('/cart/remove', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mealId })
        });

        if (response.ok) {
            if (cart) updateCounter(mealId, -1);

            console.log('Removed from cart');
        }
    }
    if (event.target.matches('.confirm-order')) {
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
