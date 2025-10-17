document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const successMessage = document.getElementById('successMessage');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Seleccionás por id (más fiable)
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const edad = document.getElementById('edad').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validaciones básicas
    if (!nombre || !apellido || !edad || !email || !password || !confirmPassword) {
      alert('Por favor, completá todos los campos obligatorios.');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Mostrar animación de éxito
    successMessage.classList.add('show');
    successMessage.setAttribute('aria-hidden', 'false');

    // Opcional: desactivar el formulario para evitar más envíos
    form.querySelectorAll('input, button').forEach(el => el.setAttribute('disabled', 'true'));

    // Redirigir luego de 1.8s
    setTimeout(() => {
      window.location.href = './index.html'; // ajustar ruta de destino si es necesario
    }, 1800);
  });
});