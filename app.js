o// Dados iniciais
let transacaoPendente = null;
let plataformas = JSON.parse(localStorage.getItem('plataformas_ranking')) || [
    { nome: "BacanaPlay", usos: 0 }, { nome: "Betano", usos: 0 }, { nome: "Betao", usos: 0 }, { nome: "sorte na bet", usos: 0 },{ nome: "8Casinos", usos: 0 }
];

// 1. Relógio em Tempo Real
function updateClock() {
    const now = new Date();
    document.getElementById('current-time').innerText = now.toLocaleString('pt-BR');
}
setInterval(updateClock, 1000);

// 2. IA de Gestão e Alertas
function executarIA(historico, saldo) {
    const aiAdvice = document.getElementById('ai-advice');
    const alertBox = document.getElementById('ai-alerts');
    alertBox.innerHTML = ""; // Limpa alertas anteriores

    if (historico.length === 0) {
        aiAdvice.innerText = "Senhor, inicie os registros para que eu possa analisar seu perfil de risco.";
        return;
    }

    // Lógica de Análise
    const depósitos = historico.filter(t => t.tipo === "DEPÓSITO");
    const ultimosDepósitos = depósitos.slice(0, 3);
    const mediaDepósito = depósitos.reduce((a, b) => a + b.valor, 0) / depósitos.length;

    // Alerta de Risco: Muitos depósitos seguidos
    if (ultimosDepósitos.length >= 3) {
        const alerta = document.createElement('div');
        alerta.className = "alert-box alert-warning";
        alerta.innerText = "⚠️ ALERTA: 3 depósitos seguidos detectados. Avalie sua estratégia.";
        alertBox.appendChild(alerta);
    }

    // Conselho da IA
    if (saldo < 0) {
        aiAdvice.innerText = `Análise: O Senhor está com déficit de R$ ${Math.abs(saldo).toFixed(2)}. Recomendo reduzir o valor médio das entradas (atualmente R$ ${mediaDepósito.toFixed(2)}) até recuperar o bankroll.`;
    } else {
        aiAdvice.innerText = "Análise: Gestão saudável. Saldo positivo mantido. Lembre-se de sacar uma porcentagem do lucro para garantir a meta mensal.";
    }
}

// 3. Funções de Registro e Interface
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
    atualizarTudo();
}

function atualizarTudo() {
    const historico = JSON.parse(localStorage.getItem('historico_transacoes')) || [];
    let dep = 0, saq = 0;
    
    historico.forEach(t => { t.tipo === "DEPÓSITO" ? dep += t.valor : saq += t.valor; });
    const saldo = saq - dep;

    // UI Updates
    const balEl = document.getElementById('total-balance');
    balEl.innerText = `R$ ${saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    balEl.style.color = saldo >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('total-deposits').innerText = `R$ ${dep.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;

    renderizarHistorico(historico);
    executarIA(historico, saldo);
}

function renderizarHistorico(historico) {
    const container = document.getElementById('transaction-list');
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

// Inicializadores
document.getElementById('btnNovoRegistro').onclick = () => {
    const v = prompt("Valor:");
    if (!v) return;
    const t = confirm("OK para DEPÓSITO, CANCELAR para SAQUE") ? "DEPÓSITO" : "SAQUE";
    transacaoPendente = { valor: parseFloat(v.replace(',', '.')), tipo: t, data: new Date().toISOString() };
    abrirModal();
};

function abrirModal() { document.getElementById('modalPlataformas').style.display = 'flex'; renderizarLista(); }
function fecharModal() { document.getElementById('modalPlataformas').style.display = 'none'; }
function renderizarLista() {
    const cont = document.getElementById('listaPlataformas');
    cont.innerHTML = "";
    plataformas.sort((a,b)=>b.usos-a.usos).forEach(p => {
        const d = document.createElement('div');
        d.className = 'platform-item'; d.innerHTML = `${p.nome} <small>${p.usos}x</small>`;
        d.onclick = () => finalizarRegistro(p.nome);
        cont.appendChild(d);
    });
}

document.addEventListener('DOMContentLoaded', atualizarTudo);
// Ativa o botão de cadastro manual no Modal
document.getElementById('btnManual').onclick = () => {
    const input = document.getElementById('inputBusca');
    const novoNome = input.value.trim();

    if (novoNome) {
        // Se o nome não estiver vazio, finaliza o registro com este novo nome
        finalizarRegistro(novoNome);
        input.value = ""; // Limpa o campo para a próxima vez
    } else {
        alert("Por favor, digite o nome da casa de apostas.");
    }
};
