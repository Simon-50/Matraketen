function updateDateTime() {
    const now = new Date();
    const options = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',

        hour: '2-digit',
        minute: '2-digit'
    };
    document.querySelector('#current-time').textContent =
        'Aktuellt datum och tid: ' + now.toLocaleString('sv-SE', options);
}

// Run function after loading
updateDateTime();

// Add interval based updates at next minute shift
const now = new Date();
setTimeout(() => {
    updateDateTime();
    setInterval(updateDateTime, 1000 * 60);
}, (60 - now.getSeconds()) * 1000 - now.getMilliseconds());
