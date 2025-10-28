// ===================================================================
//              1. DADOS DE CONFIGURAÇÃO (Global)
// ===================================================================

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

  const form = document.getElementById("formLogin");

  // Se o formulário de login não for encontrado, estamos em um painel.
  if (!form) {
    renderizarTabelaDocumentos(); // Lógica da página de documentos

    // ===================================================================
    //           4. LÓGICA DE TROCA DE ABAS (NOTAS/FREQUÊNCIA) 
    // ===================================================================

    const abas = document.querySelectorAll('.abas .aba');
    const conteudos = document.querySelectorAll('.aba-content');

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
        const conteudoAlvo = document.getElementById(targetId);
        if (conteudoAlvo) {
          conteudoAlvo.style.display = 'block'; // Mostra apenas o alvo
        }
      }

      // Adicionar o Event Listener a cada botão de aba
      abas.forEach(aba => {
        aba.addEventListener('click', trocarAba);
      });

      // --- INICIALIZAÇÃO ---
      // Garante que apenas o painel ativo no HTML esteja visível ao carregar a página
      const abaAtivaInicial = document.querySelector('.abas .aba-active');

      if (abaAtivaInicial) {
        const idAtivo = abaAtivaInicial.getAttribute('data-target');

        // Esconde todos os painéis, exceto o que corresponde à aba-active
        conteudos.forEach(conteudo => {
          if (conteudo.id !== idAtivo) {
            conteudo.style.display = 'none';
          } else {
            conteudo.style.display = 'block';
          }
        });
      }
      // FIM DA INICIALIZAÇÃO

    } // Fim da checagem de abas Notas/Frequência


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