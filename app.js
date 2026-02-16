let transacaoPendente = null;
// Inicia vazio para construção conforme uso
let plataformas = JSON.parse(localStorage.getItem('plataformas_ranking')) || [];

function updateClock() {
    document.getElementById('current-time').innerText = new Date().toLocaleString('pt-BR');
}
setInterval(updateClock, 1000);

// Gatilhos dos novos botões
document.getElementById('btnDeposito').onclick = () => iniciarTransacao("DEPÓSITO");
document.getElementById('btnRetirada').onclick = () => iniciarTransacao("SAQUE");

function iniciarTransacao(tipo) {
    const valorStr = prompt(`Valor do ${tipo}:`);
    if (!valorStr) return;
    
    transacaoPendente = {
        valor: parseFloat(valorStr.replace(',', '.')),
        tipo: tipo,
        data: new Date().toISOString()
    };
    
    document.getElementById('modalTitle').innerText = `${tipo}: Selecione a Casa`;
    abrirModal();
}

// CORREÇÃO: Função para confirmar novo cadastro ou buscar existente
document.getElementById('btnConfirmarNovo').onclick = () => {
    const nome = document.getElementById('inputBusca').value.trim();
    if (nome) {
        finalizarRegistro(nome);
        document.getElementById('inputBusca').value = "";
    }
};

function finalizarRegistro(nomePlataforma) {
    if (!transacaoPendente) return;

    // Atualiza ranking
    let idx = plataformas.findIndex(p => p.nome.toLowerCase() === nomePlataforma.toLowerCase());
    if (idx !== -1) {
        plataformas[idx].usos += 1;
    } else {
        plataformas.push({ nome: nomePlataforma, usos: 1 });
    }
    
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
    const balEl = document.getElementById('total-balance');
    balEl.innerText = `R$ ${saldo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;
    balEl.style.color = saldo >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
    document.getElementById('total-deposits').innerText = `R$ ${dep.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`;

    renderizarHistorico(historico);
    renderizarLista();
    // Chamar IA aqui se desejar manter os alertas
}

function renderizarLista() {
    const cont = document.getElementById('listaPlataformas');
    cont.innerHTML = "";
    plataformas.sort((a,b) => b.usos - a.usos).forEach(p => {
        const d = document.createElement('div');
        d.className = 'platform-item';
        d.innerHTML = `<span>${p.nome}</span> <small>${p.usos}x</small>`;
        d.onclick = () => finalizarRegistro(p.nome);
        cont.appendChild(d);
    });
}

function abrirModal() { document.getElementById('modalPlataformas').style.display = 'flex'; }
function fecharModal() { document.getElementById('modalPlataformas').style.display = 'none'; }
function renderizarHistorico(h) {
    document.getElementById('transaction-list').innerHTML = h.map(t => `
        <div class="history-item">
            <div><small>${new Date(t.data).toLocaleDateString()}</small><div>${t.plataforma}</div></div>
            <div style="color:${t.tipo === 'SAQUE' ? 'var(--accent-green)' : 'var(--accent-red)'}">
                ${t.tipo === 'SAQUE' ? '+' : '-'} R$ ${t.valor.toFixed(2)}
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', atualizarTudo);
