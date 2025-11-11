// ===================================================================
// CONTROLA A PÁGINA "CONTEÚDOS E ATIVIDADES" (contEatv.html)
// ===================================================================

let alunoDB = {};

document.addEventListener("DOMContentLoaded", () => {
    carregarDadosAluno();
    configurarAbas(); // Configura a troca de abas
});

async function carregarDadosAluno() {
    try {
        const response = await fetch('/data/db_aluno.json');
        if (!response.ok) throw new Error("Falha ao carregar JSON");
        alunoDB = await response.json();

        if (alunoDB.conteudosEAtividades) {
            const data = alunoDB.conteudosEAtividades;
            renderizarCardsResumo(data.materias, data.atividades);
            renderizarCardsConteudos(data.materias);
            renderizarCardsAtividades(data.atividades);
        }
    } catch (error) {
        console.error("Erro ao carregar dados do aluno:", error);
    }
}

// 1. RENDERIZAR CARDS DE RESUMO (Calculado)
function renderizarCardsResumo(materias, atividades) {
    const totalConteudos = Object.keys(materias).length;
    const totalAtividades = atividades.length;
    const totalPendentes = atividades.filter(a => a.status === 'Pendente').length;
    const totalCompletas = atividades.filter(a => a.status === 'Entregue').length;

    document.querySelector('.card.conteudos .porcentagem').textContent = totalConteudos || 0;
    document.querySelector('.card.atividades .porcentagem').textContent = totalAtividades || 0;
    document.querySelector('.card.pendentes .porcentagem').textContent = totalPendentes || 0;
    document.querySelector('.card.completas .porcentagem').textContent = totalCompletas || 0;
}

// 2. RENDERIZAR ABA 1: CONTEÚDOS (Modal)
function renderizarCardsConteudos(materiasCache) {
    const container = document.getElementById("conteudos-aulas");
    if (!container) return;
    container.innerHTML = ''; // Limpa

    Object.keys(materiasCache).forEach(materiaNome => {
        const ultimoTopico = materiasCache[materiaNome][0]?.nome || "Conteúdo";
        let icone = 'bx bxs-book-reader'; // Padrão
        if (materiaNome === 'Física') icone = 'bx bx-magnet';
        if (materiaNome === 'Matemática') icone = 'bx bx-math';
        if (materiaNome === 'Química') icone = 'bx bx-dna';

        const cardHTML = `
            <article class="materia-card">
                <div class="card-header">
                    <h5 class="titulo-materia">${materiaNome}</h5>
                    <div class="status-icon"><i class="${icone}"></i></div>
                </div>
                <p class="tarefa-detalhe">Último arquivo: <span class="tarefa-nome">${ultimoTopico}</span></p>
                <button class="btn-acessar" data-materia="${materiaNome}">Acessar</button>
            </article>`;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
    ligarEventosBotoesModal();
}

// 3. RENDERIZAR ABA 2: ATIVIDADES (Template)
function renderizarCardsAtividades(atividades) {
    const container = document.getElementById("atividades-tarefas");
    if (!container) return;
    container.innerHTML = ''; // Limpa

    atividades.forEach(ativ => {
        const isPendente = ativ.status === 'Pendente';
        const cardClasse = isPendente ? 'pendente' : 'completa';
        const tagClasse = isPendente ? 'tag-pendente' : 'tag-entregue';
        const btnClasse = isPendente ? 'btn-realizar' : 'btn-detalhes';
        const btnTexto = isPendente ? 'Realizar tarefa' : 'Ver detalhes';

        const cardHTML = `
            <article class="atividade-card ${cardClasse}" data-atividade-id="${ativ.materia}">
                <div class="card-header">
                    <h5 class="titulo-atividade">${ativ.materia}</h5>
                    <span class="tag ${tagClasse} tag-status-atividade">${ativ.status}</span>
                </div>
                <p class="detalhe-topico">
                    <span class="topico-status">Última Tarefa:</span>
                    <span class="descricao">${ativ.descricao}</span>
                </p>
                <div class="card-footer">
                    <div class="info-meta"><p>Prazo:</p><p>Pontuação:</p></div>
                    <div class="info-data"><p>${ativ.prazo}</p><p>${ativ.pontos} pontos</p></div>
                </div>
                <button class="botao-acao ${btnClasse}">${btnTexto}</button>
            </article>`;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
    ligarEventosBotoesAtividades();
}

// 4. LÓGICA DAS ABAS
function configurarAbas() {
    const abasControle = document.querySelectorAll('.abas-container .aba');
    const conteudosControle = document.querySelectorAll('.aba-content');

    if (abasControle.length === 0) return;

    abasControle.forEach(aba => {
        aba.addEventListener('click', (event) => {
            const botaoClicado = event.currentTarget;
            const targetId = botaoClicado.getAttribute('data-target');

            abasControle.forEach(a => a.classList.remove('aba-active'));
            conteudosControle.forEach(c => c.style.display = 'none');

            botaoClicado.classList.add('aba-active');
            const conteudoAlvo = document.getElementById(targetId);
            if (conteudoAlvo) {
                conteudoAlvo.style.display = 'grid';
            }
        });
    });

    // Garante que a aba ativa inicial esteja visível
    const abaAtivaInicial = document.querySelector('.abas-container .aba-active');
    if (abaAtivaInicial) {
        const idAtivo = abaAtivaInicial.getAttribute('data-target');
        document.getElementById(idAtivo).style.display = 'grid';
    }
}

// 5. LÓGICA DOS EVENTOS DE CLIQUE

// (Aba 1) Ligar botões "Acessar" para abrir o Modal
function ligarEventosBotoesModal() {
    const modal = document.getElementById("modalArquivos");
    const spanFechar = document.querySelector("#modalArquivos .close");

    document.querySelectorAll(".btn-acessar").forEach(botao => {
        botao.addEventListener("click", (event) => {
            const nomeMateria = event.currentTarget.getAttribute("data-materia");
            abrirModal(nomeMateria, modal);
        });
    });

    if (spanFechar) spanFechar.onclick = () => modal.style.display = "none";
    window.onclick = e => { if (e.target === modal) modal.style.display = "none"; };
}

function abrirModal(materia, modal) {
    const arquivos = alunoDB.conteudosEAtividades?.materias[materia] || [];
    
    document.getElementById("tituloMateria").textContent = `Arquivos: ${materia}`;
    const listaArquivos = document.getElementById("listaArquivos");
    listaArquivos.innerHTML = "";
    
    const visualizador = document.getElementById("visualizador");
    const iframeVisualizador = document.getElementById("iframeVisualizador");
    visualizador.style.display = "none";
    iframeVisualizador.src = "";

    if (arquivos.length === 0) {
        listaArquivos.innerHTML = "<li>Nenhum arquivo encontrado.</li>";
    } else {
        arquivos.forEach(arq => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${arq.nome}</span>
                <div>
                    <a href="#" class="ver" data-caminho="${arq.caminho}">Visualizar</a>
                    <a href="${arq.caminho}" download>Baixar</a>
                </div>`;
            li.querySelector(".ver").addEventListener("click", e => {
                e.preventDefault();
                visualizador.style.display = "block";
                iframeVisualizador.src = arq.caminho;
            });
            listaArquivos.appendChild(li);
        });
    }
    modal.style.display = "block";
}

// (Aba 2) Ligar botões "Realizar/Detalhes" para ir à página template
function ligarEventosBotoesAtividades() {
    document.querySelectorAll('#atividades-tarefas .botao-acao').forEach(botao => {
        botao.addEventListener('click', (event) => {
            const materiaNome = event.currentTarget.closest('.atividade-card').dataset.atividadeId;
            if (materiaNome) {
                // Redireciona para o template único
                window.location.href = `/HTML/detalhes_atividade.html?materia=${materiaNome}`;
            }
        });
    });
}