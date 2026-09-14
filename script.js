let saldoAtual = 0.00;
let maquinaFinalizada = false;
const PRECO_PRODUTO = 0.30;

function atualizarVisor() {
    const elSaldo = document.getElementById("saldo");
    elSaldo.textContent = `R$ ${saldoAtual.toFixed(2)}`;
}

function inserirMoeda(valorMoeda) {
    if (maquinaFinalizada) return;

    // Regra: Só permite inserir se o saldo ANTES da inserção for menor que R$ 0,30
    if (saldoAtual >= PRECO_PRODUTO) {
        return;
    }

    // Soma a moeda ao saldo
    saldoAtual = Number((saldoAtual + valorMoeda).toFixed(2));
    atualizarVisor();

    // Verifica se atingiu/ultrapassou o preço (Estado Final)
    if (saldoAtual >= PRECO_PRODUTO) {
        maquinaFinalizada = true;
        
        const troco = Number((saldoAtual - PRECO_PRODUTO).toFixed(2));
        const statusMsg = document.getElementById("status-mensagem");
        
        if (troco === 0) {
            statusMsg.innerHTML = `✅ Produto Liberado! Sem troco.`;
        } else {
            statusMsg.innerHTML = `✅ Produto Liberado! Troco: R$ ${troco.toFixed(2)}`;
        }

        desabilitarBotoesMoeda(true);
    } else {
        document.getElementById("status-mensagem").textContent = `Insira mais moedas (Saldo atual < R$ 0,30)`;
    }
}

function desabilitarBotoesMoeda(desabilitar) {
    const botoes = document.querySelectorAll(".coin-btn");
    botoes.forEach(btn => btn.disabled = desabilitar);
}

function resetarMaquina() {
    saldoAtual = 0.00;
    maquinaFinalizada = false;
    atualizarVisor();
    document.getElementById("status-mensagem").textContent = "Insira moedas (Produto: R$ 0.30)";
    desabilitarBotoesMoeda(false);
}

window.onload = function() {
    atualizarVisor();
};