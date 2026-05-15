import { professorService } from "./services/professorService.js";
import { alunoService } from "./services/alunoService.js";

import { notify } from "./utils/notify.js";

import { openModal, closeModal } from "./utils/modal.js";

function openEditModal() {
  document.getElementById("editModal").style.display = "block";
}

function closeEditModal() {
  document.getElementById("editModal").style.display = "none";
}

class Aluno {
  constructor() {
    this.arrayAlunos = [];
  }

  lerDados() {
    return {
      nome: document.getElementById("nome").value.trim(),

      serie: Number(document.getElementById("serie").value),

      idade: Number(document.getElementById("idade").value),

      bimestre1: Number(document.getElementById("bimestre1").value),

      bimestre2: Number(document.getElementById("bimestre2").value),

      bimestre3: Number(document.getElementById("bimestre3").value),

      bimestre4: Number(document.getElementById("bimestre4").value),

      id_professor: document.getElementById("id_professor").value,
    };
  }

  validaCampos(aluno) {
    if (!aluno.nome) {
      notify("Digite o nome", "error");

      return false;
    }

    return true;
  }

  adicionar(aluno) {
    this.arrayAlunos.push(aluno);
  }

  listaTabela() {
    const tbody = document.getElementById("alunos-table-body");

    tbody.innerHTML = "";

    this.arrayAlunos.forEach((aluno) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
      
        <td>${aluno.nome}</td>

        <td>${aluno.serie}º ano</td>

        <td>${aluno.idade}</td>

        <td>${aluno.bimestre1}</td>

        <td>${aluno.bimestre2}</td>

        <td>${aluno.bimestre3}</td>

        <td>${aluno.bimestre4}</td>

        <td>${aluno.media}</td>

        <td>

          <button class="btn-edit">
            Editar
          </button>

          <button class="btn-delete">
            Excluir
          </button>

        </td>
      `;

      tbody.appendChild(tr);

      tr.querySelector(".btn-delete").addEventListener("click", () => {
        this.deletarAluno(aluno.id_aluno);
      });

      tr.querySelector(".btn-edit").addEventListener("click", () => {
        this.editarAluno(aluno);
      });
    });
  }

  async salvarAluno() {
    const aluno = this.lerDados();

    if (!this.validaCampos(aluno)) {
      return;
    }

    try {
      const result = await alunoService.criar(aluno);

      aluno.id_aluno = result.alunoCriado.id_aluno;

      this.adicionar(aluno);

      this.listaTabela();

      closeModal("myModal");

      notify("Aluno cadastrado");
    } catch (error) {
      console.error(error);

      notify("Erro ao cadastrar aluno", "error");
    }
  }

  async deletarAluno(id_aluno) {
    try {
      await alunoService.deletar(id_aluno);

      this.arrayAlunos = this.arrayAlunos.filter(
        (aluno) => aluno.id_aluno !== id_aluno,
      );

      this.listaTabela();

      notify("Aluno excluído");
    } catch (error) {
      console.error(error);

      notify("Erro ao excluir aluno", "error");
    }
  }

  editarAluno(aluno) {
    document.getElementById("editNome").value = aluno.nome;

    document.getElementById("editSerie").value = aluno.serie;

    document.getElementById("editIdade").value = aluno.idade;

    document.getElementById("editBi1").value = aluno.bimestre1;

    document.getElementById("editBi2").value = aluno.bimestre2;

    document.getElementById("editBi3").value = aluno.bimestre3;

    document.getElementById("editBi4").value = aluno.bimestre4;

    openEditModal();

    document.getElementById("editForm").onsubmit = async (event) => {
      event.preventDefault();

      const alunoAtualizado = {
        nome: document.getElementById("editNome").value,

        serie: Number(document.getElementById("editSerie").value),

        idade: Number(document.getElementById("editIdade").value),

        bimestre1: Number(document.getElementById("editBi1").value),

        bimestre2: Number(document.getElementById("editBi2").value),

        bimestre3: Number(document.getElementById("editBi3").value),

        bimestre4: Number(document.getElementById("editBi4").value),
      };

      alunoAtualizado.media = (
        (alunoAtualizado.bimestre1 +
          alunoAtualizado.bimestre2 +
          alunoAtualizado.bimestre3 +
          alunoAtualizado.bimestre4) /
        4
      ).toFixed(2);

      try {
        await alunoService.atualizar(aluno.id_aluno, alunoAtualizado);

        this.arrayAlunos = this.arrayAlunos.map((a) =>
          a.id_aluno === aluno.id_aluno
            ? {
                ...a,
                ...alunoAtualizado,
              }
            : a,
        );

        this.listaTabela();

        closeEditModal();

        notify("Aluno atualizado");
      } catch (error) {
        console.error(error);

        notify("Erro ao atualizar aluno", "error");
      }
    };
  }
}

const aluno = new Aluno();

async function handleAction(action) {
  const nomeInput = document.getElementById("nomeProfessor");

  const materiaInput = document.getElementById("materia");

  const resultado = document.getElementById("resultado");

  const nome = nomeInput.value.trim();

  const materia = materiaInput.value.trim();

  try {
    switch (action) {
      case "buscar":
        const data = await professorService.buscar(nome, materia);

        if (data.error) {
          resultado.innerHTML = `
  
    <div class="resultado erro-resultado">

      <h2>
        Professor não encontrado
      </h2>

    </div>
  `;

          aluno.arrayAlunos = [];

          aluno.listaTabela();

          notify(data.message, "error");

          return;
        }
        break;

      case "novo":
        await professorService.criar({
          nome,
          materia,
        });

        notify("Professor criado");

        break;

      case "atualizar":
        const novoNome = prompt("Novo nome:", nome);

        const novaMateria = prompt("Nova matéria:", materia);

        await professorService.atualizar({
          nome,
          materia,

          newNome: novoNome,
          newMateria: novaMateria,
        });

        notify("Professor atualizado");

        break;

      case "excluir":
        await professorService.deletar({
          nome,
          materia,
        });

        resultado.innerHTML = `
        
          <div class="resultado fade-out">

            <h2>
              Professor removido
            </h2>

          </div>
        `;

        notify("Professor excluído");

        break;
    }
  } catch (error) {
    console.error(error);

    notify(error.message, "error");
  }
}

async function carregarProfessores() {
  try {
    const data = await professorService.listar();

    const select = document.getElementById("id_professor");

    select.innerHTML = `
    
      <option value="">
        Selecione o professor
      </option>
    `;

    data.professores.forEach((professor) => {
      const option = document.createElement("option");

      option.value = professor.id_professor;

      option.textContent = professor.nome;

      select.appendChild(option);
    });
  } catch (error) {
    console.error(error);
  }
}

document.getElementById("studentForm").addEventListener("submit", (event) => {
  event.preventDefault();

  aluno.salvarAluno();
});

window.handleAction = handleAction;

window.openModal = () => openModal("myModal");

window.closeModal = () => closeModal("myModal");

window.closeEditModal = closeEditModal;

window.onload = carregarProfessores;
