// Espera o DOM carregar completamente antes de executar o script
document.addEventListener("DOMContentLoaded", () => {
    carregarDadosGrade();
});

/**
 * Função principal para buscar os dados e chamar os renderizadores
 */
async function carregarDadosGrade() {
    try {
        const response = await fetch('/data/db_aluno.json');
        if (!response.ok) throw new Error(`Falha ao carregar db_aluno.json: ${response.status}`);
        
        const db = await response.json();

        if (db.gradeCurricular && db.aluno) {
            // Chama as funções para renderizar cada seção
            renderizarCards(db.gradeCurricular.horarios, db.aluno.semestre);
            renderizarGridHorarios(db.gradeCurricular.horarios);
        } else {
            console.error("Dados de 'gradeCurricular' ou 'aluno' não encontrados no JSON.");
        }
    } catch (error) {
        console.error("Erro ao carregar dados da grade:", error);
    }
}

/**
 * Renderiza os cards de resumo (Matérias, Aulas Hoje, Semestre)
 * (AGORA COM "AULAS HOJE" DINÂMICO)
 * @param {Array} horarios - A lista de horários para calcular totais
 * @param {String} semestre - O semestre atual do aluno
 */
function renderizarCards(horarios, semestre) {
    const cardMaterias = document.querySelector('.card.meta .porcentagem');
    const cardAulasHoje = document.querySelector('.card.horaria .porcentagem');
    const cardSemestre = document.querySelector('.card.semestre .porcentagem');

    // 1. Mapeia o dia da semana (Número do JS -> String do seu JSON)
    // (0=Domingo, 1=Segunda, 2=Terça, ..., 6=Sábado)
    const diasLookup = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const hoje = new Date(); // Pega a data e hora atual
    const nomeDiaHoje = diasLookup[hoje.getDay()]; // Converte (ex: 1) para (ex: "Segunda")

    // 2. Preenche o semestre
    if (cardSemestre) {
        cardSemestre.textContent = semestre;
    }

    // 3. Calcula o total de matérias únicas (Isso já funcionava)
    if (cardMaterias && horarios) {
        const materiasUnicas = new Set(horarios.map(aula => aula.materia));
        cardMaterias.textContent = materiasUnicas.size;
    }

    // 4. Calcula "Aulas Hoje" (Agora dinâmico)
    if (cardAulasHoje && horarios) {
        // Filtra a lista de horários procurando pelo nome do dia de hoje
        const aulasHoje = horarios.filter(aula => aula.dia === nomeDiaHoje).length;
        cardAulasHoje.textContent = aulasHoje;
    }
}

/**
 * Renderiza dinamicamente todo o grid de horários
 * @param {Array} horarios - A lista de horários do JSON
 */
function renderizarGridHorarios(horarios) {
    const containerGrid = document.querySelector('.horario-grid');
    if (!containerGrid) return;

    // Apaga todo o conteúdo estático do grid
    containerGrid.innerHTML = '';

    // --- Definições do nosso grid ---
    const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const slotsHoras = ["07:30 - 09:20", "09:30 - 11:10", "11:20 - 12:30"];

    // --- 1. Renderiza o Cabeçalho (Dias) ---
    // Adiciona o slot vazio do canto
    containerGrid.insertAdjacentHTML('beforeend', '<div class="dia-header header-tempo"></div>'); 
    
    // Adiciona o cabeçalho de cada dia
    diasSemana.forEach(dia => {
        containerGrid.insertAdjacentHTML('beforeend', `<div class="dia-header">${dia}</div>`);
    });

    // --- 2. Renderiza as Linhas (Horas + Aulas) ---
    slotsHoras.forEach(hora => {
        // Adiciona a coluna de tempo (ex: "07:30 - 09:20")
        containerGrid.insertAdjacentHTML('beforeend', `<div class="horario-slot tempo-coluna">${hora}</div>`);

        // Itera em cada dia da semana para este slot de hora
        diasSemana.forEach(dia => {
            // Procura no JSON uma aula que corresponda a este DIA e HORA
            const aula = horarios.find(h => h.dia === dia && h.hora === hora);

            let slotHTML;
            if (aula) {
                // Se achou uma aula, cria o slot preenchido
                slotHTML = `
                    <div class="slot">
                        <p class="materia">${aula.materia}</p>
                        <p class="detalhe">${aula.sala}</p>
                    </div>
                `;
            } else {
                // Se não achou, cria um slot vazio
                slotHTML = '<div class="slot slot-vazio"></div>';
            }
            containerGrid.insertAdjacentHTML('beforeend', slotHTML);
        });
    });
}