// Variável global para guardar a lista completa de documentos
let todosDocumentos = [];

/**
 * Função que inicia tudo assim que o HTML carregar
 */
document.addEventListener("DOMContentLoaded", () => {
    const containerTabela = document.querySelector(".corpoTabela");
    const inputBusca = document.querySelector('.search-box input');

    // 1. Carrega os dados do JSON e preenche a página
    carregarDadosDocumentos(containerTabela);
    
    // 2. Configura o "escutador" da barra de busca
    if (inputBusca && containerTabela) {
        inputBusca.addEventListener('input', (event) => {
            handleBusca(event, containerTabela);
        });
    }
});

/**
 * Carrega os dados do JSON e chama as funções de renderização
 * @param {HTMLElement} containerTabela - O elemento do DOM onde a tabela será renderizada.
 */
async function carregarDadosDocumentos(containerTabela) {
    try {
        const response = await fetch('/data/db_aluno.json');
        if (!response.ok) throw new Error(`Falha ao carregar db_aluno.json: ${response.status}`);
        const db = await response.json();

        if (db.documentos && db.documentos.lista) {
            // Armazena a lista na variável global
            todosDocumentos = db.documentos.lista; 
            
            // 1. Renderiza os cards CALCULANDO os totais a partir da lista
            renderizarCards(todosDocumentos);
            
            // 2. Renderiza a tabela com a lista completa
            renderizarTabela(todosDocumentos, containerTabela); 
        } else {
            console.error("Dados de 'documentos.lista' não encontrados no JSON.");
        }
    } catch (error) {
        console.error("Erro ao carregar dados de documentos:", error);
    }
}

/**
 * Preenche os cards de resumo CALCULANDO 100% dos dados
 * @param {Array} lista - A lista 'documentos.lista' do JSON
 */
function renderizarCards(lista) {
    // Calcula os totais filtrando a lista
    const total = lista.length;
    const aprovados = lista.filter(doc => doc.status === 'Aprovado').length;
    const correcao = lista.filter(doc => doc.status === 'Em correção').length;

    // Atualiza os elementos HTML
    document.querySelector('.card.total .porcentagem').textContent = total;
    document.querySelector('.card.aprovados .porcentagem').textContent = aprovados;
    document.querySelector('.card.correcao .porcentagem').textContent = correcao;
}

/**
 * Renderiza as linhas da tabela de documentos (AGORA COM 5 COLUNAS E STATUS)
 * @param {Array} documentos - A lista de documentos (completa ou filtrada) a ser renderizada.
 * @param {HTMLElement} containerTabela - O elemento do DOM onde a tabela será renderizada.
 */
function renderizarTabela(documentos, containerTabela) {
    if (!containerTabela) return;
    
    containerTabela.innerHTML = ''; 

    if (documentos.length === 0) {
        containerTabela.innerHTML = '<div class="tabLinha" style="text-align: center; display: block; padding: 20px;">Nenhum documento encontrado.</div>';
        return;
    }

    documentos.forEach(doc => {
        // Define a classe de estilo para o status
        let statusClasse = '';
        if (doc.status === 'Aprovado') {
            statusClasse = 'status-aprovado';
        } else if (doc.status === 'Em correção') {
            statusClasse = 'status-correcao';
        }

        // Cria o HTML para a linha (agora com 5 'divs')
        const linhaHTML = `
            <div class="tabLinha">
                <div>${doc.nome}</div>
                <div>${doc.tipo}</div>
                <div>${doc.materia}</div>
                <div>${doc.data}</div>
                <div>
                    <span class="status ${statusClasse}">${doc.status}</span>
                </div>
            </div>
        `;
        containerTabela.insertAdjacentHTML('beforeend', linhaHTML);
    });
}

/**
 * Lida com o evento 'input' na barra de pesquisa (AGORA BUSCA POR STATUS TAMBÉM)
 * @param {Event} event - O evento de input.
 * @param {HTMLElement} containerTabela - O elemento do DOM da tabela.
 */
function handleBusca(event, containerTabela) {
    const termoBusca = event.target.value.toLowerCase().trim();

    const documentosFiltrados = todosDocumentos.filter(doc => {
        // Verifica se o termo de busca está em qualquer um dos campos
        return doc.nome.toLowerCase().includes(termoBusca) ||
               doc.tipo.toLowerCase().includes(termoBusca) ||
               doc.materia.toLowerCase().includes(termoBusca) ||
               doc.status.toLowerCase().includes(termoBusca); // Busca por status
    });

    // Re-renderiza a tabela apenas com os itens filtrados
    renderizarTabela(documentosFiltrados, containerTabela);
}