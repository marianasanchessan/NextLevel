document.addEventListener("DOMContentLoaded", () => {
    carregarDadosDashboard();
});

async function carregarDadosDashboard() {
    try {
        const response = await fetch('/data/db_aluno.json');
        if (!response.ok) throw new Error("Falha ao carregar JSON");
        const db = await response.json();

        // Adicionamos 'documentos' e 'conteudosEAtividades' para a nova função
        if (db.documentos && db.notasEFaltas && db.dashboard && db.conteudosEAtividades) {
            renderizarCards(db.documentos.lista, db.notasEFaltas.frequenciaLog, db.notasEFaltas.desempenho);
            renderizarProgresso(db.dashboard.progressoSemestre);
            renderizarPrazos(db.dashboard.proximosPrazos);
            
            // (NOVO) Chama a função para preencher as atividades recentes
            renderizarAtividadesRecentes(db.notasEFaltas.frequenciaLog, db.documentos.lista);
        } else {
            console.error("Dados essenciais não encontrados no JSON.");
        }
    } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
    }
}

function renderizarCards(docLista, freqLog, desempenho) {
    const cardDocum = document.querySelector('.card.docum .porcentagem');
    const cardFreq = document.querySelector('.card.frequencia .porcentagem');
    const cardMedia = document.querySelector('.card.meta .porcentagem');

    if (cardDocum) cardDocum.textContent = docLista.length;

    if (cardFreq && freqLog.length > 0) {
        const presencas = freqLog.filter(log => log.status === 'Presente' || log.status === 'Atraso').length;
        cardFreq.textContent = `${(presencas / freqLog.length * 100).toFixed(0)}%`;
    } else if (cardFreq) {
        cardFreq.textContent = "0%";
    }

    if (cardMedia) {
        const medias = desempenho.map(item => (item.tri1 + item.tri2 + item.tri3) / 3);
        cardMedia.textContent = (medias.reduce((a, b) => a + b, 0) / medias.length).toFixed(1);
    }
}

function renderizarProgresso(progressoData) {
    const container = document.querySelector('.abadeprocesso');
    container.innerHTML = '<h4>Progresso do semestre</h4>'; // Limpa

    progressoData.forEach((dadosMateria, index) => {
        const linhaHTML = `
            <div class="linhaprogresso" data-prog-index="${index}">
                <div class="matpg">${dadosMateria.materia}</div>
                <div>${dadosMateria.progresso}%</div>
                <div class="barra-prog"><span class="barra-span"></span></div>
            </div>`;
        container.insertAdjacentHTML('beforeend', linhaHTML);
    });

    void container.offsetHeight; 

    container.querySelectorAll('.barra-span').forEach((barra, index) => {
        barra.style.width = `${progressoData[index].progresso}%`;
    });
}

function renderizarPrazos(prazosData) {
    const container = document.querySelector('.proximosprazos .proximos');
    container.innerHTML = ''; // Limpa

    prazosData.forEach(dadosPrazo => {
        container.insertAdjacentHTML('beforeend', `
            <div class="quad">
                <span>${dadosPrazo.descricao}</span>
                <span class="data">${dadosPrazo.data}</span>
            </div>`);
    });
}

/**
 *Preenche a lista de Atividades Recentes
 */
function renderizarAtividadesRecentes(frequenciaLog, documentos) {
    const container = document.querySelector('.ativrecente .lista');
    if (!container) return;
    container.innerHTML = ''; // Limpa o container

    // Define 'hoje' para a formatação de data relativa
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera o tempo para comparar apenas o dia

    let atividades = [];

    // 1. Mapeia os eventos do log de frequência (faltas/atrasos)
    frequenciaLog.forEach(log => {
        if (log.status === 'Ausente' || log.status === 'Atraso') {
            atividades.push({
                date: parseData(log.data),
                text: `${log.status} na aula <span class="muted">— ${log.materia}</span>`
            });
        }
    });

    // 2. Mapeia os eventos de entrega de documentos
    documentos.forEach(doc => {
        let textoEvento = "";
        if (doc.tipo === 'Prova') {
            textoEvento = `Nota adicionada <span class="muted">— ${doc.materia}</span>`;
        } else {
            textoEvento = `Documento enviado <span class="muted">— ${doc.materia}</span>`;
        }
        atividades.push({
            date: parseData(doc.data),
            text: textoEvento
        });
    });

    // 3. Ordena todas as atividades pela data, da mais nova para a mais antiga
    atividades.sort((a, b) => b.date - a.date);

    // 4. Pega apenas as 3 mais recentes e exibe no HTML
    const atividadesRecentes = atividades.slice(0, 3);

    if (atividadesRecentes.length === 0) {
        container.innerHTML = '<div class="linha"><div>Nenhuma atividade recente.</div></div>';
        return;
    }

    atividadesRecentes.forEach(ativ => {
        // Formata a data (Hoje, Ontem, X dias atrás)
        const dataRelativa = formatarDataRelativa(ativ.date, hoje);
        
        container.innerHTML += `
            <div class="linha">
                <div>${ativ.text}</div>
                <div class="muted">${dataRelativa}</div>
            </div>
        `;
    });
}

/**
 * Converte uma string de data (qualquer formato) para um objeto Date
 * @param {string} dataString - A data (ex: "2025-10-08" ou "02/09/25")
 * @returns {Date} - O objeto de data
 */
function parseData(dataString) {
    if (dataString.includes('/')) {
        // Formato: DD/MM/YY (dos documentos)
        const [dia, mes, ano] = dataString.split('/');
        return new Date(`20${ano}-${mes}-${dia}`);
    } else {
        // Formato: YYYY-MM-DD (do log de frequência)
        return new Date(dataString);
    }
}

/**
 * (AJUDANTE 2) Converte uma data em "Hoje", "Ontem", "X dias atrás"
 * @param {Date} dataEvento - A data do evento
 * @param {Date} hoje - A data de hoje (para comparação)
 * @returns {string} - O texto relativo
 */
function formatarDataRelativa(dataEvento, hoje) {
    const diffTime = Math.abs(hoje - dataEvento);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    return `${diffDays} dias atrás`;
}