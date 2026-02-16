// Configuração Inicial e LocalStorage
let transacaoPendente = null;

let plataformas = JSON.parse(localStorage.getItem('plataformas_ranking')) || [
    { nome: "Bet365", usos: 0 }, { nome: "Betano", usos: 0 },
    { nome: "Blaze", usos: 0 }, { nome: "EstrelaBet", usos: 0 }
];

// Inicialização do App
document.addEventListener('DOMContentLoaded', () => {
    atualizarDashboard();
    renderizarHistorico();
    
    // Listener de Busca no Modal
    document.getElementById('inputBusca').addEventListener('input', (e) => renderizarListaPlataformas(e.target.value));
    
    // Clique fora do modal para fechar
    document.getElementById('modalPlataformas').onclick = (e) => {
        if(e.target.id === 'modalPlataformas') fecharModal();
    }
});

// Lógica de Captura (Simulada para Capacitor/Cordova)
window.addEventListener("notificationReceived", function(e) {
    const texto = e.text; // "Pix enviado de R$ 50,00"
    const valorRegex = /R\$\s?(\d+,\d{2})/;
    const match = texto.match(valorRegex);

    if (match) {
        transacaoPendente = {
            valor: parseFloat(match[1].replace(',', '.')),
            tipo: texto.toLowerCase().includes('recebido') ? 'SAQUE' : 'DEPÓSITO',
            data: new Date().toISOString()
        };
        abrirModal();
    }
});

function renderizarListaPlataformas(filtro = "") {
    const container = document.getElementById('listaPlataformas');
    container.innerHTML = "";
    
    const ordenadas = plataformas.sort((a, b) => b.usos - a.usos);
    const filtradas = ordenadas.filter(p => p.nome.toLowerCase().includes(filtro.toLowerCase()));

    filtradas.forEach(p => {
        const div = document.createElement('div');
        div.className = 'platform-item';
        div.innerHTML = `<span>${p.nome}</span> <small style="color:#666">${p.usos} usos</small>`;
        div.onclick = () => finalizarRegistro(p.nome);
        container.appendChild(div);
    });
}

function finalizarRegistro(nomePlataforma) {
    if (!transacaoPendente) return;

    const index = plataformas.findIndex(p => p.nome === nomePlataforma);
    if (index !== -1) plataformas[index].usos += 1;
    else plataformas.push({ nome: nomePlataforma, usos: 1 });

    localStorage.setItem('plataformas_ranking', JSON.stringify(plataformas));

    const historico = JSON.parse(localStorage.getItem('historico_transacoes')) || [];
    historico.unshift({ ...transacaoPendente, plataforma: nomePlataforma });
    localStorage.setItem('historico_transacoes', JSON.stringify(historico));

    transacaoPendente = null;
    fecharModal();
    atualizarDashboard();
    renderizarHistorico();
}

function atualizarDashboard() {
    const historico = JSON.parse(localStorage.getItem('historico_transacoes')) || [];
    let dep = 0, saq = 0;
    historico.forEach(t => { t.tipo === "DEPÓSITO" ? dep += t.valor : saq += t.valor; });

    const saldo = saq - dep;
    const balanceEl = document.getElementById('total-balance');
    balanceEl.innerText = `R$ ${saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    balanceEl.style.color = saldo >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('total-deposits').innerText = `R$ ${dep.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
}

function renderizarHistorico() {
    const container = document.getElementById('transaction-list');
    const historico = JSON.parse(localStorage.getItem('historico_transacoes')) || [];
    container.innerHTML = historico.map(t => `
        <div class="history-item">
            <div>
                <small style="color:#666">${new Date(t.data).toLocaleDateString()}</small>
                <div style="font-weight:bold">${t.plataforma}</div>
            </div>
            <div style="color:${t.tipo === 'SAQUE' ? 'var(--accent-green)' : 'var(--accent-red)'}">
                ${t.tipo === 'SAQUE' ? '+' : '-'} R$ ${t.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </div>
        </div>
    `).join('');
}

function abrirModal() { document.getElementById('modalPlataformas').style.display = 'flex'; renderizarListaPlataformas(); }
function fecharModal() { document.getElementById('modalPlataformas').style.display = 'none'; }
