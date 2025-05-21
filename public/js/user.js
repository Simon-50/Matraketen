document.addEventListener('submit', async (event) => {
    if (event.target.matches('#register-form')) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const body = await response.json();

        if (response.ok) {
            window.location.href = body['redirectTo'];
        } else if (response.status === 400) {
            alert(body['error']);
        }
    } else if (event.target.matches('#login-form')) {
        event.preventDefault();

        const formData = new FormData(event.target);
        const data = Object.fromEntries(formData.entries());

        console.log('Login request sent');
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const body = await response.json();

        if (response.ok) {
            console.log('Login succesful');
            window.location.href = body['redirectTo'];
        } else {
            console.warn('Login failed', body);
            alert(body['error']);
        }
    }
});
