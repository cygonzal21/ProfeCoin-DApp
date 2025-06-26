document.addEventListener('DOMContentLoaded', () => {

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const messageDiv = document.getElementById('message');
    const adminPanel = document.getElementById('admin-panel');
    const historyTableBody = document.querySelector('#history-table tbody');
    
    const checkBalanceBtn = document.getElementById('checkBalanceBtn');
    const studentAddressInput = document.getElementById('studentAddressInput');
    const studentResultsDiv = document.getElementById('student-results');

    // --- ESTADO DE LA APLICACIÓN ---
    let isLoading = false;
    const transactionHistory = [];

    const students = [
        { name: "Estudiante de Prueba 1", address: "0x39FF144cBcB5De31E591971d2095466574Ad1d04" },
        { name: "Estudiante de Prueba 2", address: "0x5c61e890EBF2e4A562C93a530e4591304eF7A07E" }
    ];
    const logroVerificadoURI = "https://gist.githubusercontent.com/AI-Assisted-Dev/b031b79f225e3650215758c56c703b30/raw/7d7b322f98628b056158e8b61c9e884501a4e156/profe-coin-logro-final.json";

    // --- FUNCIONES AUXILIARES ---

    function showMessage(type, text) {
        messageDiv.className = type;
        messageDiv.textContent = text;
    }
    
    function setLoading(loading) {
        isLoading = loading;
        document.querySelectorAll('button').forEach(button => button.disabled = loading);
    }

    function updateHistory(tx) {
        transactionHistory.unshift(tx);
        if (transactionHistory.length > 5) {
            transactionHistory.pop();
        }
        renderHistory();
    }

    function renderHistory() {
        historyTableBody.innerHTML = '';
        transactionHistory.forEach(tx => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tx.type}</td>
                <td>${tx.details}</td>
                <td>${tx.txHash.slice(0, 12)}...</td>
            `;
            historyTableBody.appendChild(row);
        });
    }

    // --- RENDERIZADO INICIAL ---

    function renderAdminPanel() {
        adminPanel.innerHTML = '<h2>Panel de Administración</h2>'; // Limpia y añade el título
        students.forEach(student => {
            const card = document.createElement('div');
            card.className = 'student-card';
            card.innerHTML = `
                <h4>${student.name}</h4>
                <p><small>${student.address}</small></p>
                <div class="form-group">
                    <input type="number" id="pfc-amount-${student.address}" placeholder="Cantidad de PFC">
                    <button class="mint-btn" data-address="${student.address}">Acuñar PFC</button>
                </div>
                <button class="award-btn" data-address="${student.address}">Otorgar Logro NFT</button>
            `;
            adminPanel.appendChild(card);
        });
    }
    
    renderAdminPanel();

    // --- LÓGICA DE EVENTOS ---

    checkBalanceBtn.addEventListener('click', handleCheckBalance);
    
    adminPanel.addEventListener('click', (event) => {
        if (isLoading) return;

        const target = event.target;
        const studentAddress = target.dataset.address;

        if (target.classList.contains('mint-btn')) {
            const amountInput = document.getElementById(`pfc-amount-${studentAddress}`);
            handleMintPFC(studentAddress, amountInput.value);
            amountInput.value = '';
        } else if (target.classList.contains('award-btn')) {
            handleAwardNFT(studentAddress);
        }
    });

    // --- FUNCIONES DE INTERACCIÓN CON EL BACKEND ---

    async function handleCheckBalance() {
        const address = studentAddressInput.value;
        if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
            showMessage('error', 'Por favor, introduce una dirección de Ethereum válida.');
            return;
        }
        
        setLoading(true);
        showMessage('info', 'Consultando datos...');

        try {
            const [pfcRes, nftRes] = await Promise.all([
                fetch(`http://localhost:8080/api/profecoin/balance/${address}`),
                fetch(`http://localhost:8080/api/logronft/balance/${address}`)
            ]);

            if (!pfcRes.ok || !nftRes.ok) throw new Error('Error al conectar con el backend.');

            const pfcData = await pfcRes.json();
            const nftData = await nftRes.json();

            studentResultsDiv.innerHTML = `
                <h4>Resultados:</h4>
                <p><strong>Saldo de PFC:</strong> ${pfcData.balance}</p>
                <p><strong>Logros NFT:</strong> ${nftData.nftCount}</p>
            `;
            showMessage('success', 'Datos cargados.');
            studentAddressInput.value = '';

        } catch (error) {
            showMessage('error', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleMintPFC(toAddress, amount) {
        if (!amount || amount <= 0) {
            showMessage('error', 'Por favor, introduce una cantidad válida.');
            return;
        }
        setLoading(true);
        showMessage('info', 'Procesando acuñación de PFC...');

        try {
            const response = await fetch('http://localhost:8080/api/profecoin/mint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to: toAddress, amount: amount.toString() })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            
            showMessage('success', data.message);
            updateHistory({
                type: 'Acuñación PFC',
                details: `${amount} PFC a ${toAddress.slice(0, 10)}...`,
                txHash: data.transactionHash
            });

        } catch (error) {
            showMessage('error', error.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleAwardNFT(studentAddress) {
        setLoading(true);
        showMessage('info', 'Procesando otorgamiento de NFT...');

        try {
            const response = await fetch('http://localhost:8080/api/logronft/award', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student: studentAddress, tokenURI: logroVerificadoURI })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            showMessage('success', data.message);
            updateHistory({
                type: 'Logro NFT',
                details: `Token ID #${data.tokenId} a ${studentAddress.slice(0, 10)}...`,
                txHash: data.transactionHash
            });
        } catch (error) {
            showMessage('error', error.message);
        } finally {
            setLoading(false);
        }
    }
});