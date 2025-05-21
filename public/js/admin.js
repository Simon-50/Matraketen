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

        return;
    } else if (event.target.matches('#add-restaurant-form')) {

        return;
    } else if (event.target.matches('#remove-restaurant-form')) {

        return;
    }
});
