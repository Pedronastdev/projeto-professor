async function handleAction(action) {
  const nomeInput = document.getElementById("nomeProfessor");
  const materiaInput = document.getElementById("materia");
  const resultado = document.getElementById("resultado");

  const nome = nomeInput.value.trim();
  const materia = materiaInput.value.trim();

  try {
    let response; // Mover a declaração da variável response para fora do switch

    switch (action) {
      case "buscar":
        // Corrigir: A variável 'response' não pode ser redeclarada
        response = await fetch(
          `/professor?nome=${encodeURIComponent(nome)}&materia=${encodeURIComponent(materia)}`
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar professores");
        }

        const data = await response.json();

        const professorHTML = `
    <div class="professor">
      <div><strong>ID:</strong> ${data.professor.id_professor}</div>
      <div><strong>Nome:</strong> ${data.professor.nome}</div>
      <div><strong>Matéria:</strong> ${data.professor.materia}</div>
    </div>
  `;

        resultado.innerHTML = `
    <div class="resultado">
      <h2>Detalhes do Professor</h2>
      ${professorHTML}
    </div>
  `;

        // Atualizar a tabela de alunos (caso haja)
        aluno.arrayAlunos = data.alunos.map((aluno) => {
          return {
            nome: aluno.nome,
            idade: aluno.idade,
            bimestre1: aluno.bimestre1,
            bimestre2: aluno.bimestre2,
            bimestre3: aluno.bimestre3,
            bimestre4: aluno.bimestre4,
            media: aluno.media,
            serie: aluno.serie,
          };
        });
        aluno.listaTabela(); // Atualizar a tabela de alunos

        break;

      case "novo":
        if (!nome || !materia) {
          resultado.innerHTML = `<p class="message error message-animate">Por favor, preencha os campos de nome e matéria.</p>`;
          return;
        }

        // Envia dados para adicionar professor
        response = await fetch("/professor", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nome, materia }),
        });

        if (response.status === 409) {
          resultado.innerHTML = `<p class="message error message-animate">Professor já adicionado.</p>`;
        } else if (response.ok) {
          resultado.innerHTML = `<p class="message success message-animate">Professor adicionado com sucesso.</p>`;
        } else {
          resultado.innerHTML = `<p class="message error message-animate">Erro ao adicionar professor.</p>`;
        }

        nomeInput.value = "";
        materiaInput.value = "";
        break;

      case "excluir":
        if (!nome || !materia) {
          resultado.innerHTML = `<p class="message error message-animate">Por favor, preencha os campos de nome e matéria.</p>`;
          return;
        }

        try {
          // Primeira requisição para verificar se o professor existe
          response = await fetch(
            `/professor?nome=${encodeURIComponent(nome)}&materia=${encodeURIComponent(materia)}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.status === 404) {
            resultado.innerHTML = `<p class="message error message-animate">Professor não encontrado.</p>`;
          } else if (response.ok) {
            // Professor encontrado, proceder com a exclusão
            response = await fetch(`/professor`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ nome, materia }),
            });

            if (response.ok) {
              resultado.innerHTML = `<p class="message success message-animate">Professor excluído com sucesso.</p>`;
            } else {
              const errorData = await response.json();
              resultado.innerHTML = `<p class="message error message-animate">Erro ao excluir professor: ${
                errorData.erro || "Erro desconhecido."
              }</p>`;
            }
          } else {
            resultado.innerHTML = `<p class="message error message-animate">Erro ao verificar o professor: ${response.statusText}</p>`;
          }
        } catch (err) {
          resultado.innerHTML = `<p class="message error message-animate">Erro ao excluir professor: ${err.message}</p>`;
          console.error("Erro ao excluir professor:", err);
        }

        nomeInput.value = "";
        materiaInput.value = "";
        break;

      case "atualizar":
        if (!nome || !materia) {
          resultado.innerHTML = `<p class="message error message-animate">Por favor, preencha os campos de nome e matéria.</p>`;
          return;
        }

        const newNome = window.prompt("Insira o novo nome do professor:", nome);
        const newMateria = window.prompt(
          "Insira a nova matéria do professor:",
          materia
        );

        if (!newNome || !newMateria) {
          resultado.innerHTML = `<p class="message error message-animate">Atualização cancelada. Ambos os campos são obrigatórios.</p>`;
          return;
        }

        try {
          response = await fetch("/professor", {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ nome, materia, newNome, newMateria }), // Enviando os dados corretos para o servidor
          });

          if (!response.ok) {
            if (response.status === 404) {
              resultado.innerHTML = `<p class="message error message-animate">Professor não encontrado.</p>`;
            } else if (response.status === 400) {
              resultado.innerHTML = `<p class="message error message-animate">Por favor, forneça todos os campos necessários: nome, materia, newNome, newMateria.</p>`;
            } else {
              throw new Error(`Erro na resposta: ${response.statusText}`);
            }
          } else {
            const data = await response.json();
            resultado.innerHTML = `
                      <p class="message success message-animate">${data.mensagem}</p>
                      <div class="professor">
                          <div><strong>Nome Atualizado:</strong> ${data.professor.nome}</div>
                          <div><strong>Matéria Atualizada:</strong> ${data.professor.materia}</div>
                      </div>
                  `;
          }
        } catch (err) {
          resultado.innerHTML = `<p class="message error message-animate">Erro ao realizar a ação: ${err.message}</p>`;
          console.error("Erro ao realizar a ação:", err);
        }

        nomeInput.value = "";
        materiaInput.value = "";
        break;

      default:
        resultado.innerHTML = `<p class="message error message-animate">Ação desconhecida.</p>`;
        break;
    }
  } catch (err) {
    resultado.innerHTML = `<p class="message error message-animate">Erro ao realizar a ação: ${err.message}</p>`;
  }
}


class Aluno {
  constructor() {
    this.arrayAlunos = [];
    this.id = 1;
  }

  async salvarAluno() {
    let aluno = this.lerDados();

    if (this.validaCampos(aluno)) {
      // Enviar os dados para o backend
      try {
        const response = await fetch('http://localhost:3000/Aluno', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(aluno),
        });

        const result = await response.json();
        if (response.ok) {
          alert('Aluno cadastrado com sucesso!');
          this.adicionar(aluno);
          this.listaTabela();
          this.cancelar();
        } else {
          alert('Erro ao cadastrar aluno: ' + result.mensagem);
        }
      } catch (error) {
        console.error('Erro ao enviar dados do aluno:', error);
        alert('Erro ao cadastrar aluno.');
      }
    }
  }

  lerDados() {
    let aluno = {};
    aluno.id = this.id;
    aluno.nome = document.getElementById('nome').value.trim();
    aluno.serie = Number(document.getElementById('serie').value);
    aluno.bimestre1 = Number(document.getElementById('bimestre1').value);
    aluno.bimestre2 = Number(document.getElementById('bimestre2').value);
    aluno.bimestre3 = Number(document.getElementById('bimestre3').value);
    aluno.bimestre4 = Number(document.getElementById('bimestre4').value);
    aluno.idade = Number(document.getElementById('idade').value);
    aluno.id_professor = document.getElementById('id_professor').value;
    aluno.media = (
      (aluno.bimestre1 + aluno.bimestre2 + aluno.bimestre3 + aluno.bimestre4) /
      4
    ).toFixed(2);

    return aluno;
  }

  validaCampos(aluno) {
    let msg = '';

    if (!aluno.nome) msg += '- Informe o nome do aluno \n';
    if (!aluno.serie || aluno.serie < 1 || aluno.serie > 9)
      msg += '- Informe uma série válida (1-9) \n';
    if (isNaN(aluno.bimestre1) || aluno.bimestre1 < 0 || aluno.bimestre1 > 10)
      msg += '- Informe uma nota válida para o 1º bimestre (0-10) \n';
    if (isNaN(aluno.bimestre2) || aluno.bimestre2 < 0 || aluno.bimestre2 > 10)
      msg += '- Informe uma nota válida para o 2º bimestre (0-10) \n';
    if (isNaN(aluno.bimestre3) || aluno.bimestre3 < 0 || aluno.bimestre3 > 10)
      msg += '- Informe uma nota válida para o 3º bimestre (0-10) \n';
    if (isNaN(aluno.bimestre4) || aluno.bimestre4 < 0 || aluno.bimestre4 > 10)
      msg += '- Informe uma nota válida para o 4º bimestre (0-10) \n';
    if (isNaN(aluno.idade) || aluno.idade < 1 || aluno.idade > 100)
      msg += '- Informe uma idade válida (1-100) \n';
    if (!aluno.id_professor)
      msg += '- Selecione um professor \n';

    if (msg) {
      alert(msg);
      return false;
    }
    return true;
  }

  adicionar(aluno) {
    this.arrayAlunos.push(aluno);
    this.id++;
  }

  listaTabela() {
    const tbody = document.getElementById('alunos-table-body');
    tbody.innerHTML = '';

    this.arrayAlunos.forEach((aluno) => {
      const { nome, serie, idade, bimestre1, bimestre2, bimestre3, bimestre4, media } = aluno;

      const tr = tbody.insertRow();
      tr.innerHTML = `
        <td>${nome}</td>
        <td>${serie}</td>
        <td>${idade}</td>
        <td>${bimestre1}</td>
        <td>${bimestre2}</td>
        <td>${bimestre3}</td>
        <td>${bimestre4}</td>
        <td>${media}</td>
        <td>
          <button class="btn btn-edit">Editar</button>
          <button class="btn btn-delete">Excluir</button>
        </td>
      `;

      tr.querySelector('.btn-edit').addEventListener('click', () =>
        this.editarAluno(aluno, tr)
      );
      tr.querySelector('.btn-delete').addEventListener('click', () =>
        this.deletarAluno(aluno.id)
      );
    });
  }

  cancelar() {
    const campos = ['nome', 'serie', 'bimestre1', 'bimestre2', 'bimestre3', 'bimestre4', 'idade', 'id_professor'];
    campos.forEach((campo) => {
      document.getElementById(campo).value = '';
    });
  }

  editarAluno(aluno, linha) {
    
  }

  deletarAluno(id) {
    this.arrayAlunos = this.arrayAlunos.filter((aluno) => aluno.id !== id);
    this.listaTabela();
  }
}

const aluno = new Aluno();

document.getElementById('studentForm').addEventListener('submit', (event) => {
  event.preventDefault();
  aluno.salvarAluno();
});

async function carregarProfessores() {
  try {
    const response = await fetch('http://localhost:3000/professor/todos');
    const data = await response.json();
    const professores = data.professores || [];
    const professorSelect = document.getElementById('id_professor');

    professores.forEach((professor) => {
      const option = document.createElement('option');
      option.value = professor.id_professor;
      option.textContent = professor.nome;
      professorSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar professores:', error);
  }
}

window.onload = carregarProfessores;


function openModal() {
  const modal = document.getElementById('myModal');
  modal.style.display = 'block';
}


function closeModal() {
  const modal = document.getElementById('myModal');
  modal.style.display = 'none';
}

function openEditModal() {
  const editModal = document.getElementById('editModal');
  editModal.style.display = 'block';
}


function closeEditModal() {
  const editModal = document.getElementById('editModal');
  editModal.style.display = 'none';
}


window.onclick = function (event) {
  const myModal = document.getElementById('myModal');
  const editModal = document.getElementById('editModal');

  if (event.target === myModal) closeModal();
  if (event.target === editModal) closeEditModal();
};

document.getElementById('studentForm').addEventListener('click', openModal);


