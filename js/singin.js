document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('singinForm');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');

        if (usernameInput.value.trim() !== '' && passwordInput.value.trim() !== '') { 
            console.log("Redirigiendo al home...");
            window.location.href = 'main-page.html'; // 
        } else {
            // Si los campos están vacíos, mostramos una alerta
            alert('Por favor, completa ambos campos.');
        }
    });
});