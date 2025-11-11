// ===================================================================
// CONTROLA A PÁGINA "DETALHE DA ATIVIDADE" (atividade_detalhe.html)
// ===================================================================

document.addEventListener("DOMContentLoaded", () => {
    carregarDetalhesAtividade();
    
    // Liga a lógica que estava no script.js antigo
    configurarBotoesComentario();
    configurarBotaoVoltar();
});

let atividadeIdGlobal = null; // Para salvar o status no localStorage

/**
 * Função principal para carregar e preencher os detalhes
 */
async function carregarDetalhesAtividade() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const materiaNome = urlParams.get('materia');
        atividadeIdGlobal = materiaNome; // Salva o ID da matéria (ex: "Historia")

        if (!materiaNome) throw new Error("Atividade não encontrada na URL.");
        
        const response = await fetch('/data/db_aluno.json');
        if (!response.ok) throw new Error("Falha ao carregar JSON");
        const db = await response.json();

        const atividade = db.conteudosEAtividades.atividades.find(a => a.materia === materiaNome);
        if (!atividade) throw new Error(`Atividade "${materiaNome}" não encontrada no JSON.`);
        
        preencherDados(atividade);
        configurarUpload(atividade.status); // Configura o botão de upload
        
        // Simulação da lista de "Últimas Atividades" (lógica do script.js)
        simularListaLateral(materiaNome); 

    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        document.getElementById('atividade-titulo').textContent = error.message;
    }
}

/**
 * Preenche os IDs no HTML com os dados do JSON
 */
function preencherDados(atividade) {
    document.getElementById('header-materia-nome').textContent = atividade.materia;
    document.getElementById('header-materia').querySelector('i').className = `bx ${atividade.icone}`;
    document.getElementById('atividade-titulo').textContent = atividade.descricao;
    document.getElementById('atividade-professor').textContent = `${atividade.professor} - ${atividade.prazo}`;
    document.getElementById('atividade-codigo').textContent = atividade.turmaCodigo;
    
    const statusTag = document.getElementById('atividade-status');
    statusTag.textContent = atividade.status;
    statusTag.className = `tag ${atividade.status === 'Pendente' ? 'tag-pendente' : 'tag-entregue'}`;

    document.getElementById('anexo-nome').textContent = atividade.anexoNome;
    document.getElementById('anexo-link').href = atividade.anexoPath;
    document.getElementById('atividade-prazo').textContent = `Prazo: ${atividade.prazo}`;
    document.getElementById('atividade-pontos').textContent = `${atividade.pontos} Pontos`;

    // Lógica para mostrar o bloco de "Entregue" ou "Pendente"
    if (atividade.status === 'Entregue') {
        document.getElementById('bloco-tarefa-entregue').style.display = 'block';
        document.getElementById('bloco-tarefa-pendente').style.display = 'none';
        document.getElementById('arquivo-entregue-nome').textContent = atividade.arquivoEntregue;
    } else {
        document.getElementById('bloco-tarefa-entregue').style.display = 'none';
        document.getElementById('bloco-tarefa-pendente').style.display = 'block';
    }
}

/**
 * Configura o botão de Upload (lógica do script.js)
 */
function configurarUpload(statusInicial) {
    const btnAdicionarArquivo = document.querySelector('#bloco-tarefa-pendente .btn-adicionar-arquivo');
    const statusTag = document.getElementById('atividade-status');

    // Verifica o status salvo no localStorage (se o aluno já entregou nesta sessão)
    const statusSalvo = localStorage.getItem(`status_${atividadeIdGlobal}`);

    if (statusInicial === 'Entregue' || statusSalvo === 'Entregue') {
        // Se a atividade já veio como "Entregue" do JSON ou do localStorage
        statusTag.textContent = "Entregue";
        statusTag.className = "tag tag-entregue";
        
        // Esconde o botão de adicionar e mostra o bloco de entregue
        document.getElementById('bloco-tarefa-pendente').style.display = 'none';
        document.getElementById('bloco-tarefa-entregue').style.display = 'block';
        // (O nome do arquivo já foi preenchido em preencherDados)
    }

    // Adiciona o evento de clique para upload
    if (btnAdicionarArquivo) {
        btnAdicionarArquivo.addEventListener('click', () => {
            const seletor = document.createElement('input');
            seletor.type = 'file';
            seletor.accept = '*/*';

            seletor.addEventListener('change', () => {
                if (seletor.files.length > 0) {
                    const nomeArquivo = seletor.files[0].name;
                    alert(`Arquivo "${nomeArquivo}" enviado com sucesso!`);

                    // Salva o status no localStorage
                    localStorage.setItem(`status_${atividadeIdGlobal}`, "Entregue");

                    // Atualiza a UI para refletir a entrega
                    statusTag.textContent = "Entregue";
                    statusTag.className = "tag tag-entregue";
                    document.getElementById('bloco-tarefa-pendente').style.display = 'none';
                    document.getElementById('bloco-tarefa-entregue').style.display = 'block';
                    document.getElementById('arquivo-entregue-nome').textContent = nomeArquivo;
                }
            });
            seletor.click();
        });
    }
}

/**
 * Configura os botões de "Adicionar Comentário" (lógica do script.js)
 */
function configurarBotoesComentario() {
    document.querySelectorAll(".btn-adicionar-comentario").forEach(botao => {
        botao.addEventListener("click", () => {
            if (botao.classList.contains("ativo")) return;
            botao.classList.add("ativo");
            botao.style.display = "none";

            const container = document.createElement("div");
            container.className = "comentario-input-container";
            container.innerHTML = `
                <textarea class="comentario-textarea" placeholder="Escreva seu comentário..."></textarea>
                <div class="comentario-botoes-grupo">
                    <button class="btn-cancelar-comentario">Cancelar</button>
                    <button class="btn-salvar-comentario">Salvar</button>
                </div>`;
            
            botao.parentNode.insertBefore(container, botao);

            container.querySelector(".btn-cancelar-comentario").addEventListener("click", () => {
                container.remove();
                botao.classList.remove("ativo");
                botao.style.display = "block";
            });

            container.querySelector(".btn-salvar-comentario").addEventListener("click", () => {
                const texto = container.querySelector(".comentario-textarea").value.trim();
                if (texto === "") return alert("Digite um comentário.");
                
                const comentarioSalvo = document.createElement("div");
                comentarioSalvo.className = "comentario-salvo";
                comentarioSalvo.style.padding = "10px 0";
                comentarioSalvo.style.borderBottom = "1px solid var(--line)";
                comentarioSalvo.innerHTML = `<p style="font-size:14px; color:var(--text-primary); margin:0; word-wrap: break-word;">${texto}</p>`;
                
                botao.parentNode.insertBefore(comentarioSalvo, botao);
                container.remove();
                botao.classList.remove("ativo");
                botao.style.display = "block";
            });
        });
    });
}

/**
 * Configura o botão "Acessar Todos os Conteúdos" (lógica do script.js)
 */
function configurarBotaoVoltar() {
    const btnVoltar = document.querySelector(".btn-todas-atividades");
    if (btnVoltar) {
        btnVoltar.addEventListener("click", () => {
            // Salva a aba "atividades" como ativa ao voltar
            localStorage.setItem('abaAtivaContEatv', 'atividades-tarefas');
            window.location.href = "/HTML/contEatv.html";
        });
    }
}

/**
 * Simula a lista de aulas (lógica do script.js)
 */
function simularListaLateral(materiaNome) {
    // Dados de simulação
    const topicos = {
        "História": ["Aula 1: A Nova Ordem Mundial", "Aula 2: Globalização", "Aula 3: Brasil Colônia", "Aula 4: Conflitos na Ásia", "Aula 5: Fim da URSS", "Aula 6: Queda do Muro", "Aula 7: Legado"],
        "Física": ["Aula 1: Potência e Energia", "Aula 2: Leis de Newton", "Aula 3: MUV", "Aula 4: Trabalho", "Aula 5: Vetores", "Aula 6: SI", "Aula 7: Introdução"],
        "Matemática": ["Aula 1: Introdução a Derivadas", "Aula 2: Regras", "Aula 3: Otimização", "Aula 4: Taxas Relacionadas", "Aula 5: Trigonométricas", "Aula 6: Implícitas", "Aula 7: Gráficos"],
        "Literatura": ["Aula 1: Regionalismo", "Aula 2: Graciliano Ramos", "Aula 3: Análise: Fabiano", "Aula 4: Sinhá Vitória e Baleia", "Aula 5: Crítica Social", "Aula 6: Narrativa", "Aula 7: Linguagem", "Aula 8: Projeto Final"]
    };

    const listaContainer = document.getElementById('lista-ultimas-atividades');
    const btnVerMais = listaContainer.nextElementSibling; // O botão "Ver mais"
    
    if (!listaContainer || !btnVerMais || !topicos[materiaNome]) return;

    const listaTopicos = topicos[materiaNome];
    listaContainer.innerHTML = ''; // Limpa

    // Mostra os 3 primeiros
    listaTopicos.slice(0, 3).forEach(texto => {
        listaContainer.innerHTML += `<p class="topico-aula-item">${texto}</p>`;
    });

    // Se houver mais de 3, mostra o botão "Ver mais"
    if (listaTopicos.length > 3) {
        btnVerMais.style.display = 'block';
        btnVerMais.textContent = `Ver todos os ${listaTopicos.length} tópicos`;
        
        btnVerMais.onclick = () => { // Usamos onclick para facilitar a remoção/substituição
            if (btnVerMais.classList.contains("expandido")) {
                // Recolhe
                listaContainer.innerHTML = '';
                listaTopicos.slice(0, 3).forEach(texto => {
                    listaContainer.innerHTML += `<p class="topico-aula-item">${texto}</p>`;
                });
                btnVerMais.textContent = `Ver todos os ${listaTopicos.length} tópicos`;
                btnVerMais.classList.remove("expandido");
            } else {
                // Expande
                listaContainer.innerHTML = '';
                listaTopicos.forEach(texto => {
                    listaContainer.innerHTML += `<p class="topico-aula-item">${texto}</p>`;
                });
                btnVerMais.textContent = "Mostrar menos";
                btnVerMais.classList.add("expandido");
            }
        };
    }
}