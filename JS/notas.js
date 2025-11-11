// Espera o DOM carregar completamente antes de executar o script
document.addEventListener("DOMContentLoaded", () => {
    // Chama a função principal para carregar os dados
    carregarDadosNotas();
});

/**
 * Função principal para buscar os dados do aluno e distribuí-los
 */
async function carregarDadosNotas() {
    try {
        const response = await fetch('/data/db_aluno.json');
        if (!response.ok) {
            throw new Error(`Falha ao carregar db_aluno.json: ${response.status}`);
        }
        const db = await response.json();

        // Verifica se os dados de 'notasEFaltas' existem
        if (db.notasEFaltas && db.notasEFaltas.desempenho) {
            const desempenhoData = db.notasEFaltas.desempenho;
            
            // Chama as funções para renderizar as seções de NOTAS
            renderizarCardsResumoNotas(desempenhoData);
            renderizarTabelaDesempenho(desempenhoData);
            
        } else {
            console.error("Dados de 'notasEFaltas.desempenho' não encontrados no JSON.");
        }

    } catch (error) {
        console.error("Erro ao carregar dados da página de notas:", error);
    }
}

/**
 * Renderiza os cards de resumo (Média Geral e Matérias)
 * @param {Array} desempenhoData - Dados de desempenho para calcular média
 */
function renderizarCardsResumoNotas(desempenhoData) {
    const cardMedia = document.querySelector('.card.media-geral .porcentagem');
    const cardMaterias = document.querySelector('.card.materias .porcentagem');

    // 1. Calcula e preenche a Média Geral (calculada a partir das notas)
    if (cardMedia && desempenhoData) {
        const medias = desempenhoData.map(item => (item.tri1 + item.tri2 + item.tri3) / 3);
        const total = medias.reduce((acc, media) => acc + media, 0);
        const mediaGeral = (total / medias.length).toFixed(1);
        cardMedia.textContent = mediaGeral;
    }

    // 2. Preenche o total de matérias
    if (cardMaterias && desempenhoData) {
        cardMaterias.textContent = desempenhoData.length;
    }
}

/**
 * Renderiza a tabela de desempenho por matéria
 * (Calcula média e status)
 * @param {Array} desempenhoData - Array de objetos de desempenho vindo do JSON
 */
function renderizarTabelaDesempenho(desempenhoData) {
    const containerTabela = document.querySelector("#painel-notas-desempenho .corpoTabela");
    if (!containerTabela) return;

    containerTabela.innerHTML = '';

    desempenhoData.forEach(item => {
        const mediaCalculada = (item.tri1 + item.tri2 + item.tri3) / 3;
        let statusTexto, statusClasse;

        if (mediaCalculada > 6) {
            statusTexto = "Aprovado";
            statusClasse = "status-aprovado";
        } else {
            statusTexto = "Reprovado";
            statusClasse = "status-reprovado";
        }
        
        const linhaHTML = `
            <div class="tabLinha">
                <div>${item.materia}</div>
                <div>${item.tri1.toFixed(1)}</div>
                <div>${item.tri2.toFixed(1)}</div>
                <div>${item.tri3.toFixed(1)}</div>
                <div>${mediaCalculada.toFixed(1)}</div> 
                <div><span class="status ${statusClasse}">${statusTexto}</span></div>
            </div>
        `;
        containerTabela.insertAdjacentHTML('beforeend', linhaHTML);
    });
}