document.addEventListener("DOMContentLoaded", function () {
	// Elementos del DOM
	const menuHamburguesa = document.getElementById("menu-hamburguesa");
	const headerNavbar = document.getElementById("header-navbar");

	// Función para alternar el menú
	function toggleMenu() {
		menuHamburguesa.classList.toggle("activo");
		headerNavbar.classList.toggle("activo");

		// Actualizar el atributo aria-expanded para accesibilidad
		const expandido = menuHamburguesa.classList.contains("activo");
		menuHamburguesa.setAttribute("aria-expanded", expandido);
	}

	// Evento de clic para el botón de hamburguesa
	menuHamburguesa.addEventListener("click", toggleMenu);

	// Cerrar el menú al hacer clic en un enlace
	const navLinks = headerNavbar.querySelectorAll("a");
	navLinks.forEach((link) => {
		link.addEventListener("click", function () {
			if (window.innerWidth <= 768) {
				toggleMenu();
			}
		});
	});

	// Cerrar el menú al redimensionar la ventana a un tamaño mayor
	window.addEventListener("resize", function () {
		if (
			window.innerWidth > 768 &&
			menuHamburguesa.classList.contains("activo")
		) {
			menuHamburguesa.classList.remove("activo");
			headerNavbar.classList.remove("activo");
			menuHamburguesa.setAttribute("aria-expanded", "false");
		}
	});
});
