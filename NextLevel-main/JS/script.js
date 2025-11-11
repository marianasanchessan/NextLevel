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
/// ==========================================================
//   POP-UP DE PESQUISA + MODAL DE DETALHE DO DOCUMENTO
// ==========================================================
document.addEventListener("DOMContentLoaded", function () {
  const abrirModal = document.getElementById("abrirModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const fecharModal = document.getElementById("fecharModal");
  const campoBusca = document.getElementById("campoBusca");
  const listaDocumentos = document.getElementById("listaDocumentos");
  const corpoTabela = document.getElementById("corpoTabela");

  // Modal de detalhe do arquivo
  const modalArquivo = document.getElementById("modalArquivo");
  const fecharArquivo = document.getElementById("fecharArquivo");
  const tituloArquivo = document.getElementById("tituloArquivo");
  const tipoArquivo = document.getElementById("tipoArquivo");
  const materiaArquivo = document.getElementById("materiaArquivo");
  const dataArquivo = document.getElementById("dataArquivo");
  const abrirArquivoLink = document.getElementById("abrirArquivoLink");

  if (!abrirModal) return;

  // ==============================================
  //    Lista de arquivos reais vinculados à tabela
  // ==============================================
  const documentos = [
  {
    id: 0,
    nome: "Trabalho de História",
    tipo: "Trabalho",
    materia: "História",
    data: "02/09/25",
    link: "../docs/trabalho-historia.pdf"
  },
  {
    id: 1,
    nome: "Relatório de Física",
    tipo: "Relatório",
    materia: "Física",
    data: "27/08/25",
    link: "../docs/relatorio-fisica.pdf"
  },
  {
    id: 2,
    nome: "Prova de Matemática",
    tipo: "Prova",
    materia: "Matemática",
    data: "19/08/25",
    link: "../docs/prova-matematica.pdf"
  },
  {
    id: 3,
    nome: "Apresentação de Química",
    tipo: "Apresentação",
    materia: "Química",
    data: "09/08/25",
    link: "../docs/apresentacao-quimica.pdf"
  }
];


  // -------- MODAL DE PESQUISA --------
  abrirModal.addEventListener("click", () => {
    modalOverlay.style.display = "flex";
    campoBusca.focus();
  });

  fecharModal.addEventListener("click", () => {
    modalOverlay.style.display = "none";
    campoBusca.value = "";
    listaDocumentos.innerHTML = "";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modalOverlay) modalOverlay.style.display = "none";
    if (e.target === modalArquivo) modalArquivo.style.display = "none";
  });

  // Filtro da pesquisa
  campoBusca.addEventListener("input", () => {
    const termo = campoBusca.value.toLowerCase();
    const resultados = documentos.filter((doc) =>
      doc.nome.toLowerCase().includes(termo) ||
      doc.tipo.toLowerCase().includes(termo) ||
      doc.materia.toLowerCase().includes(termo)
    );

    listaDocumentos.innerHTML = resultados.length
      ? resultados
          .map(
            (doc) =>
              `<li data-id="${doc.id}">
                <div>
                  <strong>${doc.nome}</strong><br>
                  <small>${doc.tipo} - ${doc.materia}</small>
                </div>
                <a href="#" class="verDoc">Ver</a>
              </li>`
          )
          .join("")
      : `<li><span style="color:#777;">Nenhum documento encontrado.</span></li>`;
  });

  // Clique em resultado do pop-up de pesquisa
  listaDocumentos.addEventListener("click", (e) => {
    e.preventDefault();
    const item = e.target.closest("li");
    if (!item) return;
    const id = item.getAttribute("data-id");
    const doc = documentos.find((d) => d.id == id);
    if (!doc) return;
    abrirModalArquivo(doc);
  });

  // Clique direto na tabela
  corpoTabela.addEventListener("click", (e) => {
    const linha = e.target.closest(".tabLinha");
    if (!linha) return;
    const index = Array.from(corpoTabela.children).indexOf(linha);
    const doc = documentos[index];
    abrirModalArquivo(doc);
  });

  // -------- FUNÇÃO QUE ABRE O MODAL DO DOCUMENTO --------
  function abrirModalArquivo(doc) {
    tituloArquivo.textContent = doc.nome;
    tipoArquivo.textContent = doc.tipo;
    materiaArquivo.textContent = doc.materia;
    dataArquivo.textContent = doc.data;
    abrirArquivoLink.href = doc.link;
    modalArquivo.style.display = "flex";
  }

  fecharArquivo.addEventListener("click", () => {
    modalArquivo.style.display = "none";
  });
});
