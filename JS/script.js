// ===================================================================
//              1. DADOS DE CONFIGURAÇÃO (Global)
// ===================================================================

const alunos = [
    { email: "aluno1@escola.com", senha: "senha1" },
    { email: "aluno2@escola.com", senha: "senha2" },
    { email: "aluno3@escola.com", senha: "senha3" }
];

// ===================================================================
//          2. FUNÇÃO GLOBAL (Logout)
// ===================================================================

function logout() {
    localStorage.removeItem("usuarioSalvo");
    window.location.href = 'login.html';
}

// ===================================================================
//  3. LÓGICA DE LOGIN (Executa apenas na página de login)
// ===================================================================

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("formLogin");

    // Se não estamos na página de login, não faz mais nada
    if (!form) {
        return;
    }

    // --- Lógica de Login ---
    const emailInput = document.getElementById("email");
    const senhaInput = document.getElementById("senha");
    const lembrarCheckbox = document.getElementById("lembrar");

    const usuarioSalvo = localStorage.getItem("usuarioSalvo");
    if (usuarioSalvo) {
        emailInput.value = usuarioSalvo;
        lembrarCheckbox.checked = true;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const senha = senhaInput.value.trim();

        if (email === "" || senha === "") {
            alert("Preencha todos os campos.");
            return;
        }

        const usuarioValido = alunos.find(u => u.email === email && u.senha === senha);

        if (usuarioValido) {
            alert("Login realizado com sucesso!");
            if (lembrarCheckbox.checked) {
                localStorage.setItem("usuarioSalvo", email);
            } else {
                localStorage.removeItem("usuarioSalvo");
            }
            setTimeout(() => {
                window.location.href = "home.html";
            }, 500);

        } else {
            alert("Email ou senha incorretos!");
            senhaInput.style.border = "2px solid red";
        }
    });
});