// Espera o DOM carregar completamente antes de executar o script
document.addEventListener("DOMContentLoaded", () => {
    carregarDadosFrequencia();
});

/**
 * Função principal para buscar os dados de frequência
 */
async function carregarDadosFrequencia() {
    try {
        const response = await fetch('/data/db_aluno.json');
        if (!response.ok) throw new Error(`Falha ao carregar db_aluno.json: ${response.status}`);
        
        const db = await response.json();

        if (db.notasEFaltas) {
            const data = db.notasEFaltas;
            
            // Chama as funções específicas de frequência
            renderizarCardFrequencia(data.frequenciaLog);
            renderizarResumoFrequencia(data.desempenho, data.frequenciaLog);
            renderizarFrequenciaRecente(data.frequenciaLog);
        } else {
            console.error("Dados de 'notasEFaltas' não encontrados no JSON.");
        }
    } catch (error) {
        console.error("Erro ao carregar dados de frequência:", error);
    }
}

/**
 * Renderiza o card de resumo de Frequência
 * @param {Array} frequenciaLog - Log de frequência para calcular a média geral
 */
function renderizarCardFrequencia(frequenciaLog) {
    const cardFreq = document.querySelector('.card.frequencia .porcentagem');

    if (cardFreq && frequenciaLog && frequenciaLog.length > 0) {
        const totalAulas = frequenciaLog.length;
        // Conta "Presente" e "Atraso" como presença
        const presencas = frequenciaLog.filter(log => log.status === 'Presente' || log.status === 'Atraso').length;
        const mediaFreq = (presencas / totalAulas * 100).toFixed(0);
        cardFreq.textContent = `${mediaFreq}%`;
    } else if (cardFreq) {
        cardFreq.textContent = "0%";
    }
}

/**
 * Renderiza as barras de resumo de frequência (com animação)
 * @param {Array} desempenhoData - Usado para pegar a lista de matérias
 * @param {Array} frequenciaLog - Log de frequência
 */
function renderizarResumoFrequencia(desempenhoData, frequenciaLog) {
    const containerProgresso = document.querySelector("#painel-frequencia-resumo .abadeprocesso");
    if (!containerProgresso) return;

    containerProgresso.innerHTML = '<h4>Resumo de Faltas</h4>'; 
    
    const materias = desempenhoData.map(item => item.materia);

    materias.forEach((materia, index) => {
        const aulasMateria = frequenciaLog.filter(log => log.materia === materia);
        const totalAulasMateria = aulasMateria.length;

        let percentual = 0;
        if (totalAulasMateria > 0) {
            const presencasMateria = aulasMateria.filter(log => log.status === 'Presente' || log.status === 'Atraso').length;
            percentual = Math.round((presencasMateria / totalAulasMateria) * 100);
        }

        const linhaHTML = `
            <div class="linhaprogresso" data-freq-index="${index}">
                <div class="matpg">${materia}</div>
                <div>${percentual}%</div>
                <div class="barra-prog"><span class="barra-span" data-percentual="${percentual}"></span></div>
            </div>
        `;
        containerProgresso.insertAdjacentHTML('beforeend', linhaHTML);
    });

    void containerProgresso.offsetHeight; 

    containerProgresso.querySelectorAll('.barra-span').forEach(barraSpan => {
        const percentual = barraSpan.getAttribute('data-percentual');
        barraSpan.style.width = `${percentual}%`;
    });
}

/**
 * Renderiza a lista de "Frequência Recente"
 * @param {Array} frequenciaLog - Log de frequência
 */
function renderizarFrequenciaRecente(frequenciaLog) {
    const containerLista = document.querySelector("#painel-frequencia-resumo .ativrecente .lista");
    if (!containerLista) return;

    containerLista.innerHTML = '';
    
    const registrosRecentes = frequenciaLog.slice(-5).reverse();

    registrosRecentes.forEach(log => {
        let icone, classeIcone, textoStatus;

        switch (log.status) {
            case 'Presente':
                icone = 'bx bx-check-circle';
                classeIcone = 'icon-presente';
                textoStatus = 'Presente';
                break;
            case 'Ausente':
                icone = 'bx bx-x-circle';
                classeIcone = 'icon-falta';
                textoStatus = 'Falta';
                break;
            case 'Atraso':
                icone = 'bx bx-time-five';
                classeIcone = 'icon-aviso';
                textoStatus = 'Atraso';
                break;
            default:
                icone = 'bx bx-question-mark';
                classeIcone = '';
                textoStatus = log.status;
        }

        const linhaHTML = `
            <div class="linha">
                <i class="${icone} ${classeIcone}"></i>
                <div>
                    <span class="materia-status">${textoStatus}</span> 
                    <span class="muted">— ${log.materia} (${log.data})</span>
                </div>
            </div>
        `;
        containerLista.insertAdjacentHTML('beforeend', linhaHTML);
    });
}