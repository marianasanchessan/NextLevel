// Espera o HTML carregar totalmente antes de executar o código
document.addEventListener("DOMContentLoaded", function() {
  // Captura os elementos do HTML
  const form = document.getElementById("formLogin");
  const emailInput = document.getElementById("email");
  const senhaInput = document.getElementById("senha");
  const lembrarCheckbox = document.getElementById("lembrar");

  // Lista de alunos cadastrados pela instituição
  const alunos = [
    { email: "aluno1@escola.com", senha: "senha1" },
    { email: "aluno2@escola.com", senha: "senha2" },
    { email: "aluno3@escola.com", senha: "senha3" }
  ];

  // Preenche automaticamente o email se marcou "lembrar senha"
  const usuarioSalvo = localStorage.getItem("usuarioSalvo");
  if (usuarioSalvo) {
    emailInput.value = usuarioSalvo; // coloca o email salvo no input
    lembrarCheckbox.checked = true; // marca o checkbox
  }

  // Evento do login
  form.addEventListener("submit", function(event) {
    event.preventDefault(); // impede que a página recarregue ao enviar

    // Pega os valores digitados pelo aluno e remove espaços extras
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

    // Se encontrou um usuário válido
    if (usuarioValido) {
      alert("Login realizado com sucesso!");

      // Salva email se marcar lembrar
      if (lembrarCheckbox.checked) {
        localStorage.setItem("usuarioSalvo", email);
      } else {
        localStorage.removeItem("usuarioSalvo");
      }

      // Redireciona para dashboard após 0,5 segundos
      setTimeout(function() {
        // Redirecionamento correto para o novo arquivo home.html
        window.location.href = "dashboard.html"; 
      }, 500);

    } else {
      // Se não encontrou, alerta que os dados estão incorretos
      alert("Email ou senha incorretos!");
      senhaInput.style.border = "2px solid red";
    }
  });
});

/**
 * Redireciona o usuário para a tela de login (index.html).
 * Esta função é chamada pelo atributo onclick do botão "Sair" em home.html.
 */
function logout() {
    // Redireciona o navegador para a página de login
    window.location.href = 'index.html'; 
}
