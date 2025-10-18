const logoutButton = document.querySelector('.logout');

logoutButton.addEventListener('click', () => {

    console.log('Cerrando sesión y redirigiendo...');
    window.location.href = '/index.html';
});