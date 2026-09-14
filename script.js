const LIMITE_ACEITACAO_CENTAVOS = 30; // A máquina só aceita moedas se o saldo for < 30
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
    
    // Mostra o alerta de "LIMITE: $0.30" se o saldo atual já for >= 30
    if (saldoCentavos >= LIMITE_ACEITACAO_CENTAVOS) {
        limiteAlerta.style.display = 'block'; 
    } else {
        limiteAlerta.style.display = 'none'; 
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
    
    // LÓGICA DO AUTÔMATO (JFLAP):
    // Os estados finais começam em 30 (30, 35, 40, 45, 50). 
    // Uma vez que atinge >= 30, não há mais caminhos de entrada. 
    // Ou seja: a máquina bloqueia a inserção de novas moedas e devolve direto no troco.
    if (saldoCentavos >= LIMITE_ACEITACAO_CENTAVOS) {
        limiteAlerta.style.display = 'block';
        limiteAlerta.classList.add('pisca-vermelho');
        visorContainer.style.borderColor = '#ef4444'; 
        mostrarMensagem("INSERÇÃO BLOQUEADA!");
        
        setTimeout(() => {
            limiteAlerta.classList.remove('pisca-vermelho');
            visorContainer.style.borderColor = '#000';
        }, 600);
        
        gerarTroco(centavos); // Devolve a moeda inteira pois já passou do limite
        return; 
    }
    
    // Se o saldo for menor que 30, ele ACEITA A MOEDA INTEIRA.
    // Ex: Se tem 0.25 e coloca 0.25, ele aceita tudo e o saldo vai a 0.50!
    saldoCentavos += centavos;
    mostrarMensagem("MOEDA ACEITA", false);
    
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
    if (saldoCentavos >= LIMITE_ACEITACAO_CENTAVOS) {
        mostrarMensagem("LIMITE ATINGIDO!");
        return;
    }
    
    // Adiciona o troco de volta ao saldo. 
    // Como a máquina não deve processar entradas se passar de 30, vamos respeitar essa transição no botão também.
    // Se ele jogar o troco e o saldo passar de 30, aceita o salto completo, mas deixa a sobra no troco
    if (saldoCentavos + trocoPendenteCentavos >= LIMITE_ACEITACAO_CENTAVOS) {
        // Encontra exatamente a moeda que faltaria pra passar de 30 (como se o usuário inserisse manualmente)
        // Simplificação: apenas soma tudo, limpa troco e deixa bater o limite
        saldoCentavos += trocoPendenteCentavos;
        limparTroco();
        mostrarMensagem("SALDO ADICIONADO", false);
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
