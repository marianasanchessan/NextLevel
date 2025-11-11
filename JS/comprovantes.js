// Espera o DOM carregar completamente antes de executar o script
document.addEventListener("DOMContentLoaded", () => {
    // Pega o container da tabela
    const containerTabela = document.querySelector('.tabela-boletos');

    // 1. Carrega os dados do JSON para preencher a página
    carregarDadosComprovantes(containerTabela);

    // 2. (NOVO) Adiciona o "ouvinte" de cliques na tabela
    if (containerTabela) {
        containerTabela.addEventListener('click', (event) => {
            // Pega o elemento exato que foi clicado
            const target = event.target;

            // Verifica se o clique foi em um botão "Ver"
            if (target.classList.contains('btn-detalhe')) {
                const mes = target.dataset.mes; // Pega o mês do 'data-mes'
                alert(`Visualizando detalhes do boleto de ${mes}.\n(Aqui você abriria um modal ou PDF)`);
            }

            // Verifica se o clique foi em um botão "Pagar"
            if (target.classList.contains('btn-pagar')) {
                const mes = target.dataset.mes; // Pega o mês do 'data-mes'
                alert(`Redirecionando para o pagamento do boleto de ${mes}.\n(Aqui você redirecionaria para o banco)`);
                
                // (Opcional) Você poderia até mudar o status aqui para simular o pagamento
                // target.textContent = 'Ver';
                // target.classList.remove('btn-pagar');
                // target.classList.add('btn-detalhe');
                // target.closest('.boleto-linha').previousElementSibling.previousElementSibling.previousElementSibling.textContent = 'Pago';
                // target.closest('.boleto-linha').previousElementSibling.previousElementSibling.previousElementSibling.classList.add('status-pago');
            }
        });
    }
});

/**
 * Função principal para buscar os dados de comprovantes
 */
async function carregarDadosComprovantes(containerTabela) {
    try {
        const response = await fetch('/data/db_aluno.json');
        if (!response.ok) throw new Error(`Falha ao carregar db_aluno.json: ${response.status}`);
        
        const db = await response.json();

        if (db.comprovantes && db.comprovantes.boletos) {
            const boletos = db.comprovantes.boletos;
            
            renderizarCards(boletos);
            renderizarTabela(boletos, containerTabela); // Passa o container para a função
        } else {
            console.error("Dados de 'comprovantes.boletos' não encontrados no JSON.");
        }
    } catch (error) {
        console.error("Erro ao carregar dados de comprovantes:", error);
    }
}

/**
 * Renderiza os cards de resumo (Total, Aprovados, etc.)
 * @param {Array} boletos - A lista de boletos do JSON
 */
function renderizarCards(boletos) {
    // Calcula os totais filtrando a lista
    const total = boletos.length;
    const aprovados = boletos.filter(b => b.status === 'Pago').length;
    
    // Para 'Vencidos', filtramos os 'Pendentes' cuja data já passou
    const vencidos = boletos.filter(b => b.status === 'Pendente' && isVencido(b.vencimento)).length;

    // Para 'Pendentes', filtramos os 'Pendentes' que AINDA NÃO venceram
    const pendentes = boletos.filter(b => b.status === 'Pendente' && !isVencido(b.vencimento)).length;

    // Atualiza os elementos HTML
    document.querySelector('.card.total .porcentagem').textContent = total;
    document.querySelector('.card.aprovados .porcentagem').textContent = aprovados;
    document.querySelector('.card.pendente .porcentagem').textContent = pendentes;
    document.querySelector('.card.vencidos .porcentagem').textContent = vencidos;
}

/**
 * Renderiza a tabela de boletos
 * (AGORA COM LÓGICA DE STATUS "VENCIDO")
 * @param {Array} boletos - A lista de boletos do JSON
 * @param {HTMLElement} containerTabela - O elemento <table>
 */
function renderizarTabela(boletos, containerTabela) {
    // Apaga apenas as linhas de dados estáticos (se houver)
    // Deixa os headers intactos
    containerTabela.querySelectorAll('.boleto-linha').forEach(linha => linha.remove());

    boletos.forEach(boleto => {
        // --- INÍCIO DA NOVA LÓGICA ---
        let statusTexto, statusClasse, btnClasse, btnTexto;

        if (boleto.status === 'Pago') {
            // 1. Se já está Pago
            statusTexto = 'Pago';
            statusClasse = 'status-pago';
            btnClasse = 'btn-detalhe';
            btnTexto = 'Ver';
        } else {
            // 2. Se não está pago, verificamos se está Vencido
            if (isVencido(boleto.vencimento)) {
                statusTexto = 'Vencido';
                statusClasse = 'status-vencido'; // Nova classe
                btnClasse = 'btn-pagar'; // Ainda pode pagar
                btnTexto = 'Pagar';
            } else {
                // 3. Se não está pago e não está vencido, está Pendente
                statusTexto = 'Pendente';
                statusClasse = 'status-pendente';
                btnClasse = 'btn-pagar';
                btnTexto = 'Pagar';
            }
        }
        // (NOVO) Adicionamos 'data-mes' ao botão para identificá-lo
        // Usamos as novas variáveis 'statusTexto' e 'statusClasse'
        const linhaHTML = `
            <div class="boleto-linha mes-coluna">${boleto.mes}</div>
            <div class="boleto-linha ${statusClasse}">${statusTexto}</div>
            <div class="boleto-linha">${boleto.valor}</div>
            <div class="boleto-linha">${boleto.vencimento}</div>
            <div class="boleto-linha">
                <button class="${btnClasse}" data-mes="${boleto.mes}">${btnTexto}</button>
            </div>
        `;
        
        containerTabela.insertAdjacentHTML('beforeend', linhaHTML);
    });
}

/**
 * (Função Auxiliar) Verifica se uma data no formato "DD/MM/YY" já passou
 * @param {string} dataString - A data de vencimento (ex: "05/10/25")
 * @returns {boolean} - True se a data for anterior a hoje
 */
function isVencido(dataString) {
    try {
        const [dia, mes, ano] = dataString.split('/');
        const dataVencimento = new Date(`20${ano}-${mes}-${dia}`);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); 
        return dataVencimento < hoje;
    } catch (e) {
        console.error("Erro ao formatar data:", dataString, e);
        return false;
    }
}