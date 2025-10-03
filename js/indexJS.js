//animación y despliegue del menú hamburguesa
const menuhamburguesa = document.querySelector('.menu-hamburguesa');
const navMenu = document.querySelector('.nav'); 

menuhamburguesa.addEventListener('click', () => {
  menuhamburguesa.classList.toggle('active');
  navMenu.classList.toggle('active');
  
  //así puede cerrar con la misma animación
  const expanded = menuhamburguesa.getAttribute("aria-expanded") === true || false;
  menuhamburguesa.setAttribute("aria-expanded", !expanded);
});
