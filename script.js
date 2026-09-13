const MAX_SALDO_CENTAVOS = 50; // O maior estado final do JFLAP é 50
let saldoCentavos = 0;
let trocoPendenteCentavos = 0;
let timerStatus;

const visorTexto = document.getElementById('saldo');
const visorContainer = document.getElementById('visor-container');
const slotProduto = document.getElementById('produto-slot');
const slotTroco = document.getElementById('troco-slot');
const trocoHint = document.getElementById('troco-hint');
const trocoActions = document.getElementById('troco-actions');
const statusScreen = document.getElementById('status-screen');
const limiteAlerta = document.getElementById('limite-alerta');

// Função para mostrar mensagens nativas na máquina
function mostrarMensagem(msg, erro = true) {
    statusScreen.innerText = msg;
    
    if (erro) {
        statusScreen.classList.add('status-error');
    } else {
        statusScreen.classList.remove('status-error');
    }
    
    // Limpa o texto após 2.5 segundos
    clearTimeout(timerStatus);
    timerStatus = setTimeout(() => {
        statusScreen.innerText = "AGUARDANDO...";
        statusScreen.classList.remove('status-error');
    }, 2500);
}

function formatarMoeda(centavos) {
    return (centavos / 100).toFixed(2);
}

function atualizarVisor() {
    visorTexto.innerText = formatarMoeda(saldoCentavos);
    
    if (saldoCentavos < MAX_SALDO_CENTAVOS) {
        limiteAlerta.style.display = 'none'; 
    } else {
        limiteAlerta.style.display = 'block'; 
    }
}

function gerarTroco(valor) {
    trocoPendenteCentavos += valor;
    
    slotTroco.innerHTML = `<div class="moeda-3d">$${formatarMoeda(trocoPendenteCentavos)}</div>`;
    
    trocoHint.style.display = 'none';
    trocoActions.style.display = 'flex';
}

function inserir(centavos) {
    if (slotProduto.innerHTML !== '') {
        mostrarMensagem("BANDEJA OCUPADA!");
        return;
    }
    
    // Transbordo se o limite absoluto (50) for atingido
    if (saldoCentavos === MAX_SALDO_CENTAVOS) {
        limiteAlerta.style.display = 'block';
        limiteAlerta.classList.add('pisca-vermelho');
        visorContainer.style.borderColor = '#ef4444'; 
        mostrarMensagem("LIMITE ATINGIDO!");
        
        setTimeout(() => {
            limiteAlerta.classList.remove('pisca-vermelho');
            visorContainer.style.borderColor = '#000';
        }, 600);
        
        gerarTroco(centavos);
        return; 
    }
    
    if (saldoCentavos + centavos > MAX_SALDO_CENTAVOS) {
        let excesso = (saldoCentavos + centavos) - MAX_SALDO_CENTAVOS;
        saldoCentavos = MAX_SALDO_CENTAVOS; 
        
        limiteAlerta.style.display = 'block';
        gerarTroco(excesso);
        mostrarMensagem("MOEDA DEVOLVIDA!", false);
    } else {
        saldoCentavos += centavos;
        mostrarMensagem("MOEDA ACEITA", false);
    }
    
    atualizarVisor();
}

function comprar(precoCentavos, emoji) {
    if (slotProduto.innerHTML !== '') {
        mostrarMensagem("BANDEJA OCUPADA!");
        return;
    }
    
    if (saldoCentavos >= precoCentavos) {
        let trocoCompra = saldoCentavos - precoCentavos;
        
        slotProduto.innerHTML = `<div class="item-produto">${emoji}</div>`;
        
        if (trocoCompra > 0) {
            gerarTroco(trocoCompra);
        }
        
        saldoCentavos = 0; 
        atualizarVisor();
        mostrarMensagem("OBRIGADO!", false);
    } else {
        mostrarMensagem("SALDO INSUFICIENTE!");
        visorContainer.style.color = '#ef4444'; 
        setTimeout(() => {
            visorContainer.style.color = '#34d399'; 
        }, 300);
    }
}

function reaproveitarTroco() {
    if (saldoCentavos === MAX_SALDO_CENTAVOS) {
        mostrarMensagem("LIMITE ATINGIDO!");
        return;
    }
    
    if (saldoCentavos + trocoPendenteCentavos > MAX_SALDO_CENTAVOS) {
        let espacoLivre = MAX_SALDO_CENTAVOS - saldoCentavos;
        
        if(espacoLivre > 0){
            saldoCentavos += espacoLivre;
            trocoPendenteCentavos -= espacoLivre;
            slotTroco.innerHTML = `<div class="moeda-3d">$${formatarMoeda(trocoPendenteCentavos)}</div>`;
        }
        limiteAlerta.style.display = 'block';
        mostrarMensagem("PARTE ADICIONADA", false);
    } else {
        saldoCentavos += trocoPendenteCentavos;
        mostrarMensagem("SALDO ADICIONADO", false);
        limparTroco();
    }
    atualizarVisor();
}

function retirarTroco() {
    mostrarMensagem("TROCO RETIRADO", false);
    limparTroco();
}

function limparTroco() {
    trocoPendenteCentavos = 0;
    slotTroco.innerHTML = '';
    
    trocoActions.style.display = 'none';
    trocoHint.style.display = 'block';
}

function pegarProduto() {
    if (slotProduto.innerHTML !== '') {
        slotProduto.innerHTML = ''; 
        mostrarMensagem("PRODUTO RETIRADO", false);
    }
}

// Inicializa a tela
atualizarVisor();
