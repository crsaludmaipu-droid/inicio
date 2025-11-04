document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.querySelector('.btn-text');
    const loadingSpinner = document.querySelector('.loading-spinner');

    // Mostrar/ocultar contraseña
    togglePassword.addEventListener('click', function() {
        const passwordGroup = document.querySelector('.password-group');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        passwordGroup.classList.toggle('show-password');
    });

    // Validación en tiempo real
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailError = document.getElementById('email-error');
        const emailGroup = emailInput.parentElement;

        if (!email) {
            showError(emailGroup, emailError, 'Ingresa un correo electrónico o teléfono');
            return false;
        }

        if (!isValidEmail(email)) {
            showError(emailGroup, emailError, 'Ingresa un correo electrónico válido');
            return false;
        }

        hideError(emailGroup, emailError);
        return true;
    }

    function validatePassword() {
        const password = passwordInput.value;
        const passwordError = document.getElementById('password-error');
        const passwordGroup = passwordInput.parentElement;

        if (!password) {
            showError(passwordGroup, passwordError, 'Ingresa tu contraseña');
            return false;
        }

        if (password.length < 6) {
            showError(passwordGroup, passwordError, 'La contraseña es demasiado corta');
            return false;
        }

        hideError(passwordGroup, passwordError);
        return true;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(inputGroup, errorElement, message) {
        inputGroup.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function hideError(inputGroup, errorElement) {
        inputGroup.classList.remove('error');
        errorElement.style.display = 'none';
    }

    // Envío del formulario
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        if (isEmailValid && isPasswordValid) {
            await simulateLogin();
        }
    });

    async function simulateLogin() {
        // Mostrar estado de carga
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'block';
        loginBtn.disabled = true;

        try {
            // Simular llamada a API (reemplaza con tu lógica real)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Aquí iría tu lógica real de autenticación
            const loginData = {
                email: emailInput.value.trim(),
                password: passwordInput.value
            };

            // Ejemplo de éxito
            alert('¡Inicio de sesión exitoso!');
            // Redireccionar a la página principal
            // window.location.href = 'dashboard.html';
            
        } catch (error) {
            alert('Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            // Restaurar estado normal
            btnText.style.display = 'block';
            loadingSpinner.style.display = 'none';
            loginBtn.disabled = false;
        }
    }

    // Efectos de focus mejorados
    emailInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });

    emailInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });

    passwordInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });

    passwordInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });

    // Manejo de placeholder para labels
    emailInput.addEventListener('input', function() {
        if (this.value) {
            this.setAttribute('data-has-value', 'true');
        } else {
            this.removeAttribute('data-has-value');
        }
    });

    passwordInput.addEventListener('input', function() {
        if (this.value) {
            this.setAttribute('data-has-value', 'true');
        } else {
            this.removeAttribute('data-has-value');
        }
    });
});