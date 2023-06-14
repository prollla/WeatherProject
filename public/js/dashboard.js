function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}
document.addEventListener('DOMContentLoaded', function() {
    const username = localStorage.getItem('user');
    const email = localStorage.getItem('email')
    if(email){
        document.getElementById('email').textContent = email;
    }
});