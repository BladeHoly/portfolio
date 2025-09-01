document.addEventListener("DOMContentLoaded", function () {
	console.log("DOM Cargado");
	/* Peligroso dejar esto asi */
	const formulario = document.querySelector("#contacto-formulario form");
	const nombreInput = document.getElementById("nombre");
	const emailInput = document.getElementById("email");
	const mensajeInput = document.getElementById("mensaje");

	nombreInput.addEventListener("input", () => {
		console.log("Nombre:", nombreInput.value);
	});

	emailInput.addEventListener("input", () => {
		console.log("Email:", emailInput.value);
	});

	mensajeInput.addEventListener("input", () => {
		console.log("Mensaje:", mensajeInput.value);
	});

	function validarFormulario(e) {
		e.preventDefault();

		const nombreRegex = /^[A-Za-zÁáÉéÍíÓóÚúÜüÑñ\s]+$/;
		if (!nombreRegex.test(nombreInput.value.trim())) {
			alert("Por favor, ingresa un nombre válido (solo letras y espacios)");
			nombreInput.focus();
			return false;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(emailInput.value.trim())) {
			alert("Por favor, ingresa un correo electrónico válido");
			emailInput.focus();
			return false;
		}
		const lineasCorte = mensajeInput.value.split("\n");
		const lineas = lineasCorte.length;
		if (lineas > 250) {
			alert("El mensaje no puede tener más de 250 líneas");
			mensajeInput.focus();
			return false;
		}

		const mensaje = `Datos del formulario:\n\nNombre: ${nombreInput.value.trim()}\nEmail: ${emailInput.value.trim()}\nMensaje: ${mensajeInput.value.trim()}`;
		alert(mensaje);

		formulario.reset();

		return true;
	}

	formulario.addEventListener("submit", validarFormulario);
});
