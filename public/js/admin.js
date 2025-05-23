document.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    if (event.target.matches('#add-meal-form')) {
        // Stop meal from being submitted without an offering restaurant
        let selectedOption = document.querySelector('select[name="restaurant"] option:checked');
        if (selectedOption.value === 'default') {
            alert('Välj en restaurang');
            return;
        }

        // Saving in db
        console.log('Meal sent');
        const response = await fetch('/admin/meal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log('Meal added');
        }
    } else if (event.target.matches('#remove-meal-form')) {
        const button = event.submitter;
        const mealId = button.dataset['id'];

        console.log('Deletion request sent');
        const response = await fetch('/admin/meal', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mealId })
        });

        const body = await response.json();

        if (response.ok) {
            if (body['success']) {
                console.log('Meal removed');
                document.querySelector(`.meal-${mealId}`).remove();
            } else {
                console.log('Meal not found');
            }
        }
    } else if (event.target.matches('#add-restaurant-form')) {
        console.log('Restaurant sent');
        const response = await fetch('/admin/restaurant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log('Restaurant added');
        }
        if (response.status === 409) {
            console.log('Restaurant already added');
            alert('Restaurangen finns redan');
        }
    } else if (event.target.matches('#remove-restaurant-form')) {
        const button = event.submitter;
        const restaurantId = button.dataset['id'];

        console.log('Deletion request sent');
        const response = await fetch('/admin/restaurant', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ restaurantId })
        });

        const body = await response.json();

        if (response.ok) {
            if (body['success']) {
                console.log('Restaurant removed');

                // Remove option from add meal and remove restaurant
                for (const element of document.querySelectorAll(`.restaurant-${restaurantId}`)) {
                    element.remove();
                }
            } else {
                console.log('Restaurant not found');
            }
        }
    }
});
