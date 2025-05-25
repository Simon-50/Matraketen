document.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    // New or Login account
    if (event.target.matches('#register-form')) {
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
        } else if (response.status === 500) {
            alert(body['error']);
        }
    } else if (event.target.matches('#login-form')) {
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
            console.warn('Login failed');
            alert(body['error']);
        }
    }
    // Password reset
    else if (event.target.matches('#oneP')) {
        console.log('Email sent');
        const response = await fetch('/password/get', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const body = await response.json();

            alert(body['message']);
        }
    } else if (event.target.matches('#twoP')) {
        console.log('Verification request sent');
        const response = await fetch('/password/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const body = await response.json();

        if (response.ok) {
            alert('Reset successful');
            window.location.href = body['redirectTo'];
        } else if (response.status === 400) {
            alert(body['error']);
        } else if (response.status === 500) {
            alert('Fel vid försök att skicka e-post. Försök igen senare');
        }
    }
});
