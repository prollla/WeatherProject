function openLoginOrDashboard() {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'dashboard.html';
    } else {
        window.location.href = 'login.html';
    }
}
function openHoroscopeOrRegister() {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'horoscope.html';
    } else {
        window.location.href = 'login.html';
    }
}