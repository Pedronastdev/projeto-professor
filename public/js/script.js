async function handleAction(action) {
  const nomeInput = document.getElementById("nomeProfessor");
  const materiaInput = document.getElementById("materia");
  const resultado = document.getElementById("resultado");

  const nome = nomeInput.value.trim();
  const materia = materiaInput.value.trim();

  try {
      let response;

      switch (action) {
        case "buscar":
          if (!nome || !materia) {
              resultado.innerHTML = `
                  <p class="message error message-animate">Por favor, preencha os campos de nome e matéria.</p>
              `;
              return;
          }

          response = await fetch(
              `/professor?nome=${encodeURIComponent(nome)}&materia=${encodeURIComponent(materia)}`
          );

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Erro ao buscar professor");
          }

          const data = await response.json();

          if (!data.professores || data.professores.length === 0) {
              resultado.innerHTML = `
                  <p class="message error message-animate">Professor inexistente.</p>
              `;
          } else {
              const professores = data.professores.map((prof) => `
                  <div class="professor">
                      <div><strong>ID:</strong> ${prof.id}</div>
                      <div><strong>Nome:</strong> ${prof.nome}</div>
                      <div><strong>Matéria:</strong> ${prof.materia}</div>
                  </div>
              `).join("");

              resultado.innerHTML = `
                  <div class="resultado">
                      <h2>Lista de Professores Encontrados</h2>
                      ${professores}
                  </div>
              `;
          }
          break;

          case "novo":
              if (!nome || !materia) {
                  resultado.innerHTML = `
                      <p class="message error message-animate">Por favor, preencha os campos de nome e matéria.</p>
                  `;
                  return;
              }

              response = await fetch("/professor", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ nome, materia }),
              });

              if (response.status === 409) {
                  resultado.innerHTML = `
                      <p class="message error message-animate">Professor já adicionado.</p>
                  `;
              } else if (response.ok) {
                  resultado.innerHTML = `
                      <p class="message success message-animate">Professor adicionado com sucesso.</p>
                  `;
              } else {
                  resultado.innerHTML = `
                      <p class="message error message-animate">Erro ao adicionar professor.</p>
                  `;
              }

              nomeInput.value = "";
              materiaInput.value = "";
              break;

          case "excluir":
              if (!nome || !materia) {
                  resultado.innerHTML = `
                      <p class="message error message-animate">Por favor, preencha os campos de nome e matéria.</p>
                  `;
                  return;
              }

              response = await fetch(`/professor`, {
                  method: "DELETE",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ nome, materia }),
              });

              if (response.ok) {
                  resultado.innerHTML = `
                      <p class="message success message-animate">Professor excluído com sucesso.</p>
                  `;
              } else {
                  const errorData = await response.json();
                  resultado.innerHTML = `
                      <p class="message error message-animate">Erro ao excluir professor: ${errorData.message}</p>
                  `;
              }

              nomeInput.value = "";
              materiaInput.value = "";
              break;

          case "atualizar":
              if (!nome || !materia) {
                  resultado.innerHTML = `
                      <p class="message error message-animate">Por favor, preencha os campos de nome e matéria.</p>
                  `;
                  return;
              }

              const newNome = window.prompt("Insira o novo nome do professor:", nome);
              const newMateria = window.prompt("Insira a nova matéria do professor:", materia);

              if (!newNome || !newMateria) {
                  resultado.innerHTML = `
                      <p class="message error message-animate">Atualização cancelada. Ambos os campos são obrigatórios.</p>
                  `;
                  return;
              }

              response = await fetch("/professor", {
                  method: "PATCH",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ nome, materia, newNome, newMateria }),
              });

              if (response.ok) {
                  const data = await response.json();
                  resultado.innerHTML = `
                      <p class="message success message-animate">${data.mensagem}</p>
                      <div class="professor">
                          <div><strong>Nome Atualizado:</strong> ${data.professor.nome}</div>
                          <div><strong>Matéria Atualizada:</strong> ${data.professor.materia}</div>
                      </div>
                  `;
              } else {
                  const errorData = await response.json();
                  resultado.innerHTML = `
                      <p class="message error message-animate">Erro ao atualizar professor: ${errorData.message}</p>
                  `;
              }

              nomeInput.value = "";
              materiaInput.value = "";
              break;

          default:
              resultado.innerHTML = `
                  <p class="message error message-animate">Ação desconhecida.</p>
              `;
              break;
      }
  } catch (err) {
      resultado.innerHTML = `
          <p class="message error message-animate">Erro ao realizar a ação: ${err.message}</p>
      `;
  }
}

class Aluno {
  constructor() {
    this.arrayAlunos = [];
    this.id = 1;
  }

  salvarAluno() {
    let aluno = this.lerDados();
    if (this.validaCampos(aluno)) {
      this.adicionar(aluno);
    }
    this.listaTabela();
    this.cancelar();
  }

  lerDados() {
    let aluno = {};
    aluno.id = this.id;
    aluno.nome = document.getElementById("nome").value.trim();
    aluno.serie = document.getElementById("serie").value.trim();
    aluno.bi1 = Number(document.getElementById("bi1").value);
    aluno.bi2 = Number(document.getElementById("bi2").value);
    aluno.bi3 = Number(document.getElementById("bi3").value);
    aluno.bi4 = Number(document.getElementById("bi4").value);
    aluno.idade = Number(document.getElementById("idade").value);
    aluno.media = ((aluno.bi1 + aluno.bi2 + aluno.bi3 + aluno.bi4) / 4).toFixed(2);
    console.log("Dados do aluno lidos: ", aluno);
    return aluno;
  }

  validaCampos(aluno) {
    let msg = "";
    console.log("Validando campos do aluno: ", aluno);

    if (aluno.nome === "") {
      msg += "- Informe o nome do aluno \n";
    }
    if (aluno.serie === "") {
      msg += "- Informe a série do aluno \n";
    }
    if (isNaN(aluno.bi1) || aluno.bi1 < 0 || aluno.bi1 > 10) {
      msg += "- Informe uma nota válida para B1 (0-10) \n";
    }
    if (isNaN(aluno.bi2) || aluno.bi2 < 0 || aluno.bi2 > 10) {
      msg += "- Informe uma nota válida para B2 (0-10) \n";
    }
    if (isNaN(aluno.bi3) || aluno.bi3 < 0 || aluno.bi3 > 10) {
      msg += "- Informe uma nota válida para B3 (0-10) \n";
    }
    if (isNaN(aluno.bi4) || aluno.bi4 < 0 || aluno.bi4 > 10) {
      msg += "- Informe uma nota válida para B4 (0-10) \n";
    }
    if (isNaN(aluno.idade) || aluno.idade === "") {
      msg += "- Informe a idade do aluno \n";
    }
    if (msg !== "") {
      alert(msg);
      return false;
    }
    return true;
  }

  adicionar(aluno) {
    this.arrayAlunos.push(aluno);
    this.listaTabela();
    this.id++;
  }

  listaTabela() {
    const tbody = document.getElementById("alunos-table-body");
    tbody.innerHTML = "";

    this.arrayAlunos.forEach((aluno) => {
      const { nome, serie, idade, bi1, bi2, bi3, bi4, media, id } = aluno;

      const tr = tbody.insertRow();
      tr.innerHTML = `
                <td class="nome">${nome}</td>
                <td>${serie}</td>
                <td class="idade">${idade}</td>
                <td class="bi1">${bi1}</td>
                <td class="bi2">${bi2}</td>
                <td class="bi3">${bi3}</td>
                <td class="bi4">${bi4}</td>
                <td class="media">${media}</td>
                <td>
                    <button class="btn btn-edit btn-action">Editar</button>
                    <button class="btn btn-delete btn-action">Excluir</button>
                </td>
            `;

      const [btnEdit, btnDelete] = tr.querySelectorAll(".btn");

      btnEdit.addEventListener("click", () => this.editarAluno(aluno, tr));
      btnDelete.addEventListener("click", () => this.deletarAluno(id));
    });
  }

  cancelar() {
    const elementosParaLimpar = [
      "nome",
      "serie",
      "bi1",
      "bi2",
      "bi3",
      "bi4",
      "idade",
    ];

    elementosParaLimpar.forEach((id) => {
      document.getElementById(id).value = "";
    });
  }

  editarAluno(aluno, linha) {
    document.getElementById("editNome").value = aluno.nome;
    document.getElementById("editBi1").value = aluno.bi1;
    document.getElementById("editBi2").value = aluno.bi2;
    document.getElementById("editBi3").value = aluno.bi3;
    document.getElementById("editBi4").value = aluno.bi4;

    openEditModal();

    const editForm = document.getElementById("editForm");
    editForm.onsubmit = (event) => {
      event.preventDefault();
      aluno.nome = document.getElementById("editNome").value;
      aluno.bi1 = Number(document.getElementById("editBi1").value);
      aluno.bi2 = Number(document.getElementById("editBi2").value);
      aluno.bi3 = Number(document.getElementById("editBi3").value);
      aluno.bi4 = Number(document.getElementById("editBi4").value);

      aluno.media = (
        (aluno.bi1 + aluno.bi2 + aluno.bi3 + aluno.bi4) /
        4
      ).toFixed(2);

      linha.querySelector(".nome").innerText = aluno.nome;
      linha.querySelector(".bi1").innerText = aluno.bi1;
      linha.querySelector(".bi2").innerText = aluno.bi2;
      linha.querySelector(".bi3").innerText = aluno.bi3;
      linha.querySelector(".bi4").innerText = aluno.bi4;
      linha.querySelector(".media").innerText = aluno.media;

      closeEditModal();
    };
  }

  deletarAluno(id) {
    this.arrayAlunos = this.arrayAlunos.filter((aluno) => aluno.id !== id);
    this.listaTabela();
  }
}

var aluno = new Aluno();

document
  .getElementById("studentForm")
  .addEventListener("submit", function (event) {
    aluno.salvarAluno();
    event.preventDefault();
  });

function openModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "block";
}

function closeModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "none";
}

document.getElementById("myModal").addEventListener("click", (event) => {
  const modalContent = document.querySelector("#myModal .modal-content");
  if (!modalContent.contains(event.target)) {
    closeModal();
  }
});

function openEditModal() {
  const editModal = document.getElementById("editModal");
  editModal.style.display = "block";
}

function closeEditModal() {
  const editModal = document.getElementById("editModal");
  editModal.style.display = "none";
}