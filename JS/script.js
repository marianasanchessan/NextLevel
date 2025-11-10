// ====================================================================
//              1. DADOS DE CONFIGURAÇÃO (Global)
// ====================================================================

// Lista de alunos cadastrados para o LOGIN
const alunos = [
    { email: "aluno1@escola.com", senha: "senha1" },
    { email: "aluno2@escola.com", senha: "senha2" },
    { email: "aluno3@escola.com", senha: "senha3" }
];

// ===================================================================
//          2. FUNÇÕES GLOBAIS (Logout e Renderização)
// ===================================================================

/**
 * Redireciona o usuário para a tela de login (index.html).
 * Chamada pelo atributo onclick do botão "Sair".
 */
function logout() {
    localStorage.removeItem("usuarioSalvo");
    window.location.href = 'login.html';
}

/* Funções dummy para evitar erros de referência se não estiver na página */
function renderizarTabelaDocumentos() {
    // Lógica para renderizar a tabela de documentos (se estiver na página de documentos)
}

// ===================================================================
//  3. LÓGICA DE LOGIN E INICIALIZAÇÃO (Executa após o DOM carregar)
// ===================================================================

document.addEventListener("DOMContentLoaded", function () {

    // ===================================================================
    // LIMPAR STATUS AO REINICIAR O SERVIDOR OU RECARREGAR O PROJETO
    // ===================================================================
    if (performance.getEntriesByType('navigation')[0].type === 'reload') {
        localStorage.removeItem('status_Historia');
    }

    if (performance.getEntriesByType('navigation')[0].type === 'reload') {
        localStorage.removeItem('status_Literatura');
    }

    // Também limpa se o Live Server for fechado e reaberto (nova sessão)
    if (!sessionStorage.getItem('sessaoIniciada')) {
        localStorage.removeItem('status_Historia');
        sessionStorage.setItem('sessaoIniciada', 'true');
    }

    if (!sessionStorage.getItem('sessaoIniciada')) {
        localStorage.removeItem('status_Literatura');
        sessionStorage.setItem('sessaoIniciada', 'true');
    }

    const form = document.getElementById("formLogin");

    // Se o formulário de login não for encontrado, estamos em um painel.
    if (!form) {
        renderizarTabelaDocumentos(); // Lógica da página de documentos

        // ===================================================================
        //           4. LÓGICA DE TROCA DE ABAS (NOTAS/FREQUÊNCIA) 
        // ===================================================================

        // Escopamos a seleção para o painel de notas para evitar conflitos
        const painelNotasSection = document.querySelector('.painel-notas');
        if (painelNotasSection) {
            const abas = painelNotasSection.querySelectorAll('.abas .aba');
            const conteudos = painelNotasSection.querySelectorAll('.aba-content');

            // Se a página atual tiver as abas de notas/frequência
            if (abas.length > 0 && conteudos.length > 0) {

                // Função que lida com o clique na aba
                function trocarAba(event) {
                    const botaoClicado = event.currentTarget;
                    const targetId = botaoClicado.getAttribute('data-target');

                    // 1. Desativar todos os botões e esconder todos os conteúdos
                    abas.forEach(aba => {
                        aba.classList.remove('aba-active');
                    });

                    conteudos.forEach(conteudo => {
                        conteudo.style.display = 'none'; // Esconde todos
                    });

                    // 2. Ativar o botão clicado
                    botaoClicado.classList.add('aba-active');

                    // 3. Mostrar o conteúdo correspondente
                    // Usamos document.getElementById pois o conteúdo pode estar fora do escopo do parent
                    const conteudoAlvo = document.getElementById(targetId);
                    if (conteudoAlvo) {
                        conteudoAlvo.style.display = 'block'; // Mostra apenas o alvo
                    }
                }

                // Adicionar o Event Listener a cada botão de aba
                abas.forEach(aba => {
                    aba.addEventListener('click', trocarAba);
                });

                // --- INICIALIZAÇÃO (Corrigida) ---
                // Garante que APENAS o painel ativo no HTML esteja visível ao carregar a página
                const abaAtivaInicial = painelNotasSection.querySelector('.abas .aba-active');

                if (abaAtivaInicial) {
                    const idAtivo = abaAtivaInicial.getAttribute('data-target');

                    // Esconde todos os painéis, exceto o que corresponde à aba-active
                    conteudos.forEach(conteudo => {
                        if (conteudo.id !== idAtivo) {
                            conteudo.style.display = 'none';
                        } else {
                            // FORÇA o display 'block' para o painel ativo, resolvendo a falha inicial
                            conteudo.style.display = 'block';
                        }
                    });
                }
                // FIM DA INICIALIZAÇÃO

            } // Fim da checagem de abas Notas/Frequência
        }


        // ===================================================================
        //      5. LÓGICA DE TROCA DE ABAS (Conteúdos e Atividades)
        // ===================================================================

        const abasControle = document.querySelectorAll('.abas-container .aba');
        const conteudosControle = document.querySelectorAll('.aba-content');

        // Se a página atual tiver as abas de Conteúdos/Atividades
        if (abasControle.length > 0 && conteudosControle.length > 0) {

            function trocarAbaConteudo(event) {
                const botaoClicado = event.currentTarget;
                const targetId = botaoClicado.getAttribute('data-target');

                // 1. Desativar todos os botões e esconder todos os conteúdos
                abasControle.forEach(aba => aba.classList.remove('aba-active'));
                conteudosControle.forEach(conteudo => conteudo.style.display = 'none');

                // 2. Ativar o botão clicado
                botaoClicado.classList.add('aba-active');

                // 3. Mostrar o conteúdo correspondente
                const conteudoAlvo = document.getElementById(targetId);
                if (conteudoAlvo) {
                    // Usa 'grid' para o layout de cards das duas seções (como definido no CSS)
                    conteudoAlvo.style.display = 'grid';
                }
            }

            // Adicionar o Event Listener a cada botão de aba
            abasControle.forEach(aba => {
                aba.addEventListener('click', trocarAbaConteudo);
            });

            // --- Inicialização: Esconder o conteúdo inativo ---
            const abaAtivaInicial = document.querySelector('.abas-container .aba-active');

            if (abaAtivaInicial) {
                const idAtivo = abaAtivaInicial.getAttribute('data-target');

                conteudosControle.forEach(conteudo => {
                    if (conteudo.id !== idAtivo) {
                        conteudo.style.display = 'none';
                    } else {
                        conteudo.style.display = 'grid'; // Define como grid na inicialização
                    }
                });
            }

        }

        // ===================================================================
        //     5.1. LÓGICA DE ATUALIZAÇÃO DE STATUS (Página contEatv.html)
        // ===================================================================

        const atividadesGrid = document.getElementById('atividades-tarefas');

        if (atividadesGrid) {

            const materias = ["Historia", "Literatura", "Matematica", "Fisica"];

            materias.forEach(id => {

                const status = localStorage.getItem(`status_${id}`);
                const card = document.querySelector(`.atividade-card[data-atividade-id="${id}"]`);

                if (!card || !status) return;

                const tag = card.querySelector(".tag");
                const botao = card.querySelector(".botao-acao, .botao-acao-lit, .botao-acao-fis");

                if (status === "Entregue") {
                    card.classList.remove("pendente");
                    card.classList.add("completa");

                    tag.textContent = "Entregue";
                    tag.classList.remove('tag-pendente');
                    tag.classList.add('tag-entregue');

                    if (botao) {
                        botao.textContent = "Ver detalhes";
                        botao.classList.remove("btn-realizar", "btn-realizar-lit");
                        botao.classList.add("btn-detalhes");
                    }

                } else {
                    // Caso queira voltar para pendente manualmente
                    card.classList.add("pendente");
                }

            });
        }


        // ===================================================================
        //      6. LÓGICA DE COMENTÁRIOS (Botão "Adicionar Comentário")
        // ===================================================================

        const botoesComentario = document.querySelectorAll(".btn-adicionar-comentario");

        botoesComentario.forEach(botao => {
            botao.addEventListener("click", function () {

                // Evita abrir múltiplos campos
                if (botao.classList.contains("ativo")) return;

                botao.classList.add("ativo");
                botao.style.display = "none";

                const container = document.createElement("div");
                container.classList.add("comentario-input-container");

                const textarea = document.createElement("textarea");
                textarea.classList.add("comentario-textarea");
                textarea.placeholder = "Escreva seu comentário aqui...";

                const grupoBotoes = document.createElement("div");
                grupoBotoes.classList.add("comentario-botoes-grupo");

                const btnSalvar = document.createElement("button");
                btnSalvar.classList.add("btn-salvar-comentario");
                btnSalvar.textContent = "Salvar";

                const btnCancelar = document.createElement("button");
                btnCancelar.classList.add("btn-cancelar-comentario");
                btnCancelar.textContent = "Cancelar";

                grupoBotoes.appendChild(btnCancelar);
                grupoBotoes.appendChild(btnSalvar);

                container.appendChild(textarea);
                container.appendChild(grupoBotoes);

                // Insere o container logo antes do botão "Adicionar Comentário"
                botao.parentNode.insertBefore(container, botao);

                // -------------------------------
                // Função de CANCELAR comentário
                // -------------------------------
                btnCancelar.addEventListener("click", () => {
                    container.remove();
                    botao.classList.remove("ativo");
                    botao.style.display = "block";
                });

                // -------------------------------
                // Função de SALVAR comentário
                // -------------------------------
                btnSalvar.addEventListener("click", () => {
                    const texto = textarea.value.trim();

                    if (texto === "") {
                        alert("Digite um comentário antes de salvar!");
                        return;
                    }

                    // Simula o salvamento e cria o elemento visual
                    const comentarioSalvo = document.createElement("div");
                    comentarioSalvo.classList.add("comentario-salvo");
                    comentarioSalvo.style.padding = "10px 0";
                    comentarioSalvo.style.borderBottom = "1px solid var(--line)";
                    comentarioSalvo.innerHTML = `
          <p style="font-size:14px; color:var(--text-primary); margin:0; word-wrap: break-word;">
            ${texto}
          </p>
        `;

                    // Insere o comentário salvo
                    botao.parentNode.insertBefore(comentarioSalvo, botao);

                    // Remove o campo e volta o botão
                    container.remove();
                    botao.classList.remove("ativo");
                    botao.style.display = "block";
                });
            });
        });

        // ===================================================================
        //     7. LÓGICA DO BOTÃO "ADICIONAR ARQUIVO" (Entrega automática)
        // ===================================================================

        const btnAdicionarArquivo = document.querySelector('.btn-adicionar-arquivo');
        const statusTag = document.querySelector('.atividade-header .tag');
        const blocoTarefas = document.querySelector('.bloco-tarefas');
        const atividadeView = document.querySelector('.atividade-view');
        const atividadeId = atividadeView ? atividadeView.getAttribute('data-atividade-id') : null;

        // ✅ MOSTRAR STATUS SALVO AO ABRIR A PÁGINA
        if (atividadeId) {
            const saved = localStorage.getItem(`status_${atividadeId}`);

            if (saved === "Entregue") {
                // Atualiza a tag
                statusTag.textContent = "Entregue";
                statusTag.classList.remove("tag-pendente");
                statusTag.classList.add("tag-entregue");

                // Atualiza o botão de enviar arquivo
                btnAdicionarArquivo.textContent = "Arquivo Enviado";
                btnAdicionarArquivo.disabled = true;
            }
        }

        // ✅ EVENTO DE UPLOAD
        if (btnAdicionarArquivo) {
            btnAdicionarArquivo.addEventListener('click', function () {
                const seletor = document.createElement('input');
                seletor.type = 'file';
                seletor.accept = '*/*';

                seletor.addEventListener('change', function () {
                    if (seletor.files.length > 0) {
                        alert(`Arquivo enviado com sucesso!`);

                        btnAdicionarArquivo.textContent = "Arquivo Enviado";
                        btnAdicionarArquivo.disabled = true;

                        // Atualiza o status visual
                        statusTag.textContent = "Entregue";
                        statusTag.classList.add("tag-entregue");
                        statusTag.classList.remove("tag-pendente");

                        // SALVA no localStorage
                        localStorage.setItem(`status_${atividadeId}`, "Entregue");
                    }
                });

                seletor.click();
            });
        }


        // ===================================================================
        //      8. BOTÃO "ACESSAR TODAS AS ATIVIDADES"
        // ===================================================================

        const btnTodasAtividades = document.querySelector(".btn-todas-atividades");

        if (btnTodasAtividades) {
            btnTodasAtividades.addEventListener("click", () => {
                // Redireciona para a página de todas as atividades
                window.location.href = "/HTML/contEatv.html";
            });
        }


        // ===================================================================
        //     9. SALVAR ABA ANTES DE REDIRECIONAR PARA DETALHES
        // ===================================================================

        const botoesAtividade = document.querySelectorAll(
            ".btn-realizar, .btn-realizar-lit, .btn-detalhes, .btn-detalhes-fis, .btn-detalhes-lit"
        );

        botoesAtividade.forEach(botao => {
            botao.addEventListener("click", () => {

                // Mantém aba de atividades ao voltar
                localStorage.setItem('abaAtivaContEatv', 'atividades-tarefas');

                // Pega o card da atividade que foi clicado
                const card = botao.closest('.atividade-card');
                const id = card.getAttribute('data-atividade-id');
                // Ex: "Matematica", "Literatura", "Fisica", "Historia"

                // Monta o nome do arquivo automaticamente
                const url = `/HTML/acessarAtividades_${id}.html`;

                // Redireciona
                window.location.href = url;
            });
        });


        // ===================================================================
        //      10. BOTÃO "VER TODOS OS TÓPICOS" — Expande lista de aulas
        // ===================================================================

        // PARTE DE HISTÓRIA 

        const btnVerMais = document.querySelector(".btn-ver-mais");
        const listaAulas = document.querySelector(".lista-aulas");

        if (btnVerMais && listaAulas) {
            btnVerMais.addEventListener("click", () => {
                // Verifica se já foi expandido
                if (btnVerMais.classList.contains("expandido")) {
                    // Recolhe novamente
                    const aulas = listaAulas.querySelectorAll(".topico-aula");
                    aulas.forEach((aula, i) => {
                        if (i >= 3) aula.style.display = "none";
                    });
                    btnVerMais.textContent = "Ver todos os 7 tópicos";
                    btnVerMais.classList.remove("expandido");
                } else {
                    // Adiciona mais 4 tópicos (simulação)
                    const aulasExtras = [
                        "Aula 4: Conflitos na Ásia e África",
                        "Aula 5: O Fim da União Soviética",
                        "Aula 6: A Queda do Muro de Berlim",
                        "Aula 7: O Legado da Guerra Fria"
                    ];

                    // Verifica se já existem
                    const aulasExistentes = listaAulas.querySelectorAll(".topico-aula").length;
                    if (aulasExistentes < 7) {
                        aulasExtras.forEach(texto => {
                            const p = document.createElement("p");
                            p.classList.add("topico-aula");
                            p.innerHTML = `${texto}`;
                            listaAulas.insertBefore(p, btnVerMais);
                        });
                    } else {
                        // Apenas mostra as escondidas (se já tiver sido expandido uma vez)
                        const aulas = listaAulas.querySelectorAll(".topico-aula");
                        aulas.forEach(aula => aula.style.display = "flex");
                    }

                    btnVerMais.textContent = "Mostrar menos";
                    btnVerMais.classList.add("expandido");

                }
            });
        }
        // PARTE DE LITERATURA 
        const btnVerMaisLit = document.querySelector(".btn-ver-mais-lit");
        const listaAulasLit = document.querySelector(".lista-aulas-lit");

        if (btnVerMaisLit && listaAulasLit) {
          btnVerMaisLit.addEventListener("click", () => {
            if (btnVerMaisLit.classList.contains("expandido")) {
              // Recolhe novamente (mantém só os 3 primeiros à mostra)
              const aulas = listaAulasLit.querySelectorAll(".topico-aula-lit");
              aulas.forEach((aula, i) => {
                if (i >= 3) aula.style.display = "none";
              });
              btnVerMaisLit.textContent = "Ver todos os 8 tópicos";
              btnVerMaisLit.classList.remove("expandido");
            } else {
              // Tópicos extras (você já tinha definido 5, totalizando 8)
              const aulasExtrasLit = [
                "Aula 4: A Psicologia de Sinhá Vitória e Baleia",
                "Aula 5: O Ciclo da Seca e a Crítica Social",
                "Aula 6: A Fragmentação e a Circularidade da Narrativa",
                "Aula 7: A Linguagem Seca de Graciliano Ramos",
                "Aula 8: Projeto Final: Adaptação e Interpretação",
              ];

              // Verifica quantos já existem dentro de .lista-aulas-lit
              const aulasExistentes = listaAulasLit.querySelectorAll(".topico-aula-lit").length;

              if (aulasExistentes < 8) {
                aulasExtrasLit.forEach(texto => {
                  const p = document.createElement("p");
                  p.classList.add("topico-aula-lit");
                  p.textContent = texto;
                  // INSERE NO CONTÊINER CERTO:
                  listaAulasLit.insertBefore(p, btnVerMaisLit);
                });
              } else {
                // Já criados antes? Só reexibe
                const aulas = listaAulasLit.querySelectorAll(".topico-aula-lit");
                aulas.forEach(aula => aula.style.display = "flex");
              }

              btnVerMaisLit.textContent = "Mostrar menos";
              btnVerMaisLit.classList.add("expandido");
            }
          });
        }


        // PARTE DE MATEMÄTICA 
        const btnVerMaisMat = document.querySelector(".btn-ver-mais-mat");
        const listaAulasMat = document.querySelector(".lista-aulas-mat");

        if (btnVerMaisMat && listaAulasMat) {
            btnVerMaisMat.addEventListener("click", () => {
                // Verifica se já foi expandido
                if (btnVerMaisMat.classList.contains("expandido")) {
                    // Recolhe novamente
                    const aulas = listaAulasMat.querySelectorAll(".topico-aula-mat");
                    aulas.forEach((aula, i) => {
                        if (i >= 3) aula.style.display = "none";
                    });
                    btnVerMaisMat.textContent = "Ver todos os 7 tópicos";
                    btnVerMaisMat.classList.remove("expandido");
                } else {
                    // Adiciona mais 4 tópicos (simulação)
                    const aulasExtrasMat = [
                        "Aula 4: Problemas de Taxas Relacionadas",
                        "Aula 5: Derivadas de Funções Trigonométricas",
                        "Aula 6: Derivadas Implícitas e Inversas",
                        "Aula 7: Análise de Gráficos e Pontos Críticos"
                    ];

                    // Verifica se já existem
                    const aulasExistentes = listaAulasMat.querySelectorAll(".topico-aula-mat").length;
                    if (aulasExistentes < 7) {
                        aulasExtrasMat.forEach(texto => {
                            const p = document.createElement("p");
                            p.classList.add("topico-aula-mat");
                            p.innerHTML = `${texto}`;
                            listaAulasMat.insertBefore(p, btnVerMaisMat);
                        });
                    } else {
                        // Apenas mostra as escondidas (se já tiver sido expandido uma vez)
                        const aulas = listaAulasMat.querySelectorAll(".topico-aula-mat");
                        aulas.forEach(aula => aula.style.display = "flex");
                    }

                    btnVerMaisMat.textContent = "Mostrar menos";
                    btnVerMaisMat.classList.add("expandido");
                }
            });
        }

        // PARTE DE FISICA 
        const btnVerMaisFis = document.querySelector(".btn-ver-mais-fis");
        const listaAulasFis = document.querySelector(".lista-aulas-fis");

        if (btnVerMaisFis && listaAulasFis) {
            btnVerMaisFis.addEventListener("click", () => {
                // Verifica se já foi expandido
                if (btnVerMaisFis.classList.contains("expandido")) {
                    // Recolhe novamente
                    const aulas = listaAulasFis.querySelectorAll(".topico-aula-fis");
                    aulas.forEach((aula, i) => {
                        if (i >= 3) aula.style.display = "none";
                    });
                    btnVerMaisFis.textContent = "Ver todos os 7 tópicos";
                    btnVerMaisFis.classList.remove("expandido");
                } else {
                    // Adiciona mais 4 tópicos (simulação)
                    const aulasExtrasFis = [
                        "Aula 4: Trabalho e Energia Mecânica",
                        "Aula 5: Vetores e Movimento Retilíneo",
                        "Aula 6: Unidades de Medida e Conversões no SI",
                        "Aula 7: Introdução à Física e Grandezas Fundamentais"
                    ];

                    // Verifica se já existem
                    const aulasExistentes = listaAulasFis.querySelectorAll(".topico-aula-fis").length;
                    if (aulasExistentes < 7) {
                        aulasExtrasFis.forEach(texto => {
                            const p = document.createElement("p");
                            p.classList.add("topico-aula-fis");
                            p.innerHTML = `${texto}`;
                            listaAulasFis.insertBefore(p, btnVerMaisFis);
                        });
                    } else {
                        // Apenas mostra as escondidas (se já tiver sido expandido uma vez)
                        const aulas = listaAulasFis.querySelectorAll(".topico-aula-fis");
                        aulas.forEach(aula => aula.style.display = "flex");
                    }

                    btnVerMaisFis.textContent = "Mostrar menos";
                    btnVerMaisFis.classList.add("expandido");
                }
            });
        }

    } else {


        // -------------------------------------------------------------------
        //      -- Lógica de Login (só executa se o form existir) --
        // -------------------------------------------------------------------

        const emailInput = document.getElementById("email");
        const senhaInput = document.getElementById("senha");
        const lembrarCheckbox = document.getElementById("lembrar");

        // Preenche automaticamente o email se marcou "lembrar senha"
        const usuarioSalvo = localStorage.getItem("usuarioSalvo");
        if (usuarioSalvo) {
            emailInput.value = usuarioSalvo;
            lembrarCheckbox.checked = true;
        }

        // Evento do login
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const email = emailInput.value.trim();
            const senha = senhaInput.value.trim();

            // Limpa bordas de erros anteriores
            emailInput.style.border = "2px solid rgba(255, 255, 255, 0.2)";
            senhaInput.style.border = "2px solid rgba(255, 255, 255, 0.2)";

            // Validação básica
            if (email === "" || senha === "") {
                alert("Preencha todos os campos.");
                if (email === "") emailInput.style.border = "2px solid red";
                if (senha === "") senhaInput.style.border = "2px solid red";
                return;
            }

            // Procura aluno válido
            const usuarioValido = alunos.find(u => u.email === email && u.senha === senha);

            if (usuarioValido) {
                alert("Login realizado com sucesso!");

                // Salva email se marcar lembrar
                if (lembrarCheckbox.checked) {
                    localStorage.setItem("usuarioSalvo", email);
                } else {
                    localStorage.removeItem("usuarioSalvo");
                }

                // Redireciona para dashboard após 0,5 segundos
                setTimeout(function () {
                    window.location.href = "home.html";
                }, 500);

            } else {
                alert("Email ou senha incorretos!");
                senhaInput.style.border = "2px solid red";
            }
        });
    } // Fim do bloco else (Lógica de Login)

}); // Fim do DOMContentLoaded