document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('registerForm').addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                password: password,
            }),
        })
            .then((response) => response.text())
            .then((data) => {
                localStorage.setItem('email', email)
                if (data === 'User registered successfully') {
                    alert('Registration successful');
                    window.location.href = 'login.html';
                } else {
                    alert('Registration failed');
                }
            })
            .catch((error) => console.error('Error:', error));
    });
});
