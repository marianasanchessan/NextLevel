document.addEventListener("DOMContentLoaded", () => {
    carregarDadosDashboard();
});

async function carregarDadosDashboard() {
    try {
        const response = await fetch('/data/db_aluno.json');
        if (!response.ok) throw new Error("Falha ao carregar JSON");
        const db = await response.json();

        if (db.documentos && db.notasEFaltas && db.dashboard) {
            renderizarCards(db.documentos.lista, db.notasEFaltas.frequenciaLog, db.notasEFaltas.desempenho);
            renderizarProgresso(db.dashboard.progressoSemestre);
            renderizarPrazos(db.dashboard.proximosPrazos);
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

    // 1. Card Documentos (Calculado)
    if (cardDocum) cardDocum.textContent = docLista.length;

    // 2. Card Frequência (Calculado)
    if (cardFreq && freqLog.length > 0) {
        const presencas = freqLog.filter(log => log.status === 'Presente' || log.status === 'Atraso').length;
        cardFreq.textContent = `${(presencas / freqLog.length * 100).toFixed(0)}%`;
    } else if (cardFreq) {
        cardFreq.textContent = "0%";
    }

    // 3. Card Média Geral (Calculado)
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

    void container.offsetHeight; // Força o re-flow para a animação

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