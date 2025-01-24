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
    try {
        // Fazer a requisição para buscar os dados do professor
        const response = await fetch(
            `/professor?nome=${encodeURIComponent(
                nome
            )}&materia=${encodeURIComponent(materia)}`
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

        // Atualizar a tabela de alunos com os dados retornados
        aluno.arrayAlunos = data.alunos.map((aluno) => ({
            nome: aluno.nome,
            serie: aluno.serie,
            idade: aluno.idade,
            bimestre1: aluno.bimestre1,
            bimestre2: aluno.bimestre2,
            bimestre3: aluno.bimestre3,
            bimestre4: aluno.bimestre4,
            media: aluno.media,
            id_aluno: aluno.id_aluno, // Importante para editar/excluir
        }));

        aluno.listaTabela();
    } catch (error) {
        // Lidar com erros na requisição
        console.error("Erro ao buscar professor:", error);
        resultado.innerHTML = `
            <div class="erro">
                <p>Erro ao buscar professor. Por favor, tente novamente.</p>
            </div>
        `;
    }
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
          await carregarProfessores()
          
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
            `/professor?nome=${encodeURIComponent(
              nome
            )}&materia=${encodeURIComponent(materia)}`,
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
    console.log(`ID inicial: ${this.id}`); // Verificando o id inicial
  }

  async salvarAluno() {
    let aluno = this.lerDados();

    if (this.validaCampos(aluno)) {
      try {
        const response = await fetch("http://localhost:3000/Aluno", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(aluno),
        });

        const result = await response.json();
        console.log("Resposta do servidor:", result);

        if (response.ok && result.alunoCriado && result.alunoCriado.id_aluno) {
          aluno.id_aluno = result.alunoCriado.id_aluno;
          console.log(`Aluno cadastrado com ID: ${aluno.id_aluno}`);
          this.adicionar(aluno); // Adiciona somente com ID definido
          this.listaTabela();
          this.cancelar();
          closeModal();
        } else {
          console.error("Erro no cadastro do aluno:", result.mensagem);
          alert("Erro ao cadastrar aluno.");
        }
      } catch (error) {
        console.error("Erro ao salvar aluno:", error);
        alert("Erro ao cadastrar aluno.");
      }
    }
  }

  lerDados() {
    let aluno = {};
    aluno.nome = document.getElementById("nome").value.trim();
    aluno.serie = Number(document.getElementById("serie").value);
    aluno.bimestre1 = Number(document.getElementById("bimestre1").value);
    aluno.bimestre2 = Number(document.getElementById("bimestre2").value);
    aluno.bimestre3 = Number(document.getElementById("bimestre3").value);
    aluno.bimestre4 = Number(document.getElementById("bimestre4").value);
    aluno.idade = Number(document.getElementById("idade").value);
    aluno.id_professor = document.getElementById("id_professor").value;
    aluno.media = (
      (aluno.bimestre1 + aluno.bimestre2 + aluno.bimestre3 + aluno.bimestre4) / 4
    ).toFixed(2);

    return aluno;
  }

  validaCampos(aluno) {
    let msg = "";

    if (!aluno.nome) msg += "- Informe o nome do aluno \n";
    if (!aluno.serie || aluno.serie < 1 || aluno.serie > 9)
      msg += "- Informe uma série válida (1-9) \n";
    if (isNaN(aluno.bimestre1) || aluno.bimestre1 < 0 || aluno.bimestre1 > 10)
      msg += "- Informe uma nota válida para o 1º bimestre (0-10) \n";
    if (isNaN(aluno.bimestre2) || aluno.bimestre2 < 0 || aluno.bimestre2 > 10)
      msg += "- Informe uma nota válida para o 2º bimestre (0-10) \n";
    if (isNaN(aluno.bimestre3) || aluno.bimestre3 < 0 || aluno.bimestre3 > 10)
      msg += "- Informe uma nota válida para o 3º bimestre (0-10) \n";
    if (isNaN(aluno.bimestre4) || aluno.bimestre4 < 0 || aluno.bimestre4 > 10)
      msg += "- Informe uma nota válida para o 4º bimestre (0-10) \n";
    if (isNaN(aluno.idade) || aluno.idade < 1 || aluno.idade > 100)
      msg += "- Informe uma idade válida (1-100) \n";
    if (!aluno.id_professor) msg += "- Selecione um professor \n";

    if (msg) {
      alert(msg);
      return false;
    }
    return true;
  }

  // Adicionando aluno ao array e atribuindo id_aluno corretamente
  adicionar(aluno) {
    if (aluno.id_aluno !== undefined) {
      console.log("Adicionando aluno ao array:", aluno);
      this.arrayAlunos.push(aluno);
      console.log(`Aluno adicionado com ID: ${aluno.id_aluno}`);
    } else {
      console.error("Aluno sem ID não pode ser adicionado:", aluno);
    }
  }

  // Método para renderizar os alunos na tabela
  listaTabela() {
    const tbody = document.getElementById("alunos-table-body");
    tbody.innerHTML = "";

    this.arrayAlunos.forEach((aluno) => {
      console.log(`Renderizando aluno com ID: ${aluno.id_aluno}`); // Verificando o ID ao renderizar
      const { nome, serie, idade, bimestre1, bimestre2, bimestre3, bimestre4, media, id_aluno } = aluno;

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
          <button class="btn-edit">Editar</button>
          <button class="btn-delete">Excluir</button>
        </td>
      `;

      tr.querySelector(".btn-edit").addEventListener("click", () => this.editarAluno(aluno, tr));
      tr.querySelector(".btn-delete").addEventListener("click", () => {
        console.log(`Deletando aluno com ID: ${id_aluno}`); 
        this.deletarAluno(id_aluno); 
      });
    });
  }

  // Método para excluir aluno
  deletarAluno(id_aluno) {
    console.log(`Excluindo aluno com ID: ${id_aluno}`); // Verificando o ID ao excluir

    if (!id_aluno) {
      console.error("ID do aluno não fornecido ou inválido");
      alert("ID do aluno não foi fornecido corretamente.");
      return;
    }

    fetch(`http://localhost:3000/aluno/${id_aluno}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
  })
  .then(async (response) => {
      if (!response.ok) {
          const errorMessage = await response.text();
          console.error("Erro do servidor:", errorMessage);
          throw new Error(errorMessage || "Erro ao excluir aluno");
      }
      return response.json();
  })
  .then((data) => {
      console.log("Resposta do servidor após excluir:", data);
      alert(data.mensagem || "Aluno excluído com sucesso.");
  
      // Atualiza a lista de alunos
      this.arrayAlunos = this.arrayAlunos.filter((aluno) => aluno.id_aluno !== id_aluno);
      this.listaTabela();
  })
  .catch((error) => {
      console.error("Erro ao excluir aluno:", error);
      alert("Erro ao excluir aluno. Verifique a conexão ou tente novamente.");
  });
}  

  cancelar() {
    const campos = [
      "nome",
      "serie",
      "bimestre1",
      "bimestre2",
      "bimestre3",
      "bimestre4",
      "idade",
      "id_professor",
    ];
    campos.forEach((campo) => {
      document.getElementById(campo).value = "";
    });
  }

  async editarAluno(aluno) {
    console.log(`Editando aluno com ID: ${aluno.id_aluno}`);

    document.getElementById("editNome").value = aluno.nome || "";
    document.getElementById("editSerie").value = aluno.serie || ""; 
    document.getElementById("editBi1").value = aluno.bimestre1 || "";
    document.getElementById("editBi2").value = aluno.bimestre2 || "";
    document.getElementById("editBi3").value = aluno.bimestre3 || "";
    document.getElementById("editBi4").value = aluno.bimestre4 || "";
    document.getElementById("editIdade").value = aluno.idade || ""; 

    openEditModal(); 

  
    document.getElementById("editForm").onsubmit = async (event) => {
        event.preventDefault(); 

       
        aluno.nome = document.getElementById("editNome").value.trim();
        aluno.serie = Number(document.getElementById("editSerie").value); 
        aluno.bimestre1 = Number(document.getElementById("editBi1").value);
        aluno.bimestre2 = Number(document.getElementById("editBi2").value);
        aluno.bimestre3 = Number(document.getElementById("editBi3").value);
        aluno.bimestre4 = Number(document.getElementById("editBi4").value);
        aluno.idade = Number(document.getElementById("editIdade").value);

        // Calcula a nova média
        aluno.media = ((aluno.bimestre1 + aluno.bimestre2 + aluno.bimestre3 + aluno.bimestre4) / 4).toFixed(2);

        try {
          
            const response = await fetch(`http://localhost:3000/aluno/${aluno.id_aluno}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    nome: aluno.nome,
                    serie: aluno.serie,
                    bimestre1: aluno.bimestre1,
                    bimestre2: aluno.bimestre2,
                    bimestre3: aluno.bimestre3,
                    bimestre4: aluno.bimestre4,
                    idade: aluno.idade,
                    media: aluno.media,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                this.arrayAlunos = this.arrayAlunos.map((a) => 
                    a.id_aluno === aluno.id_aluno ? { ...a, ...aluno } : a
                );

               
                alert(result.mensagem || "Aluno atualizado com sucesso.");
                this.listaTabela(); 
                closeEditModal(); 
            } else {
           
                alert(result.error || "Erro ao atualizar o aluno.");
            }
        } catch (error) {
            console.error("Erro ao enviar os dados:", error);
            alert("Erro ao conectar com o servidor.");
        }
    };
}
}

const aluno = new Aluno();

document.getElementById("studentForm").addEventListener("submit", (event) => {
  event.preventDefault();
  aluno.salvarAluno();
});

async function carregarProfessores() {
  try {

      const response = await fetch("http://localhost:3000/professor/todos");
      if (!response.ok) {
          throw new Error(`Erro ao carregar professores: ${response.statusText}`);
      }

      const data = await response.json();
      const professores = data.professores || [];
      const professorSelect = document.getElementById("id_professor");

      if (!professorSelect) {
          console.error("Elemento com id 'id_professor' não encontrado.");
          return;
      }

      console.log("Professores recebidos:", professores);

      professorSelect.innerHTML = '';

      // Adiciona as novas opções ao select
      professores.forEach(({ id_professor, nome }) => {
          const option = document.createElement("option");
          option.value = id_professor;
          option.textContent = nome;
          professorSelect.appendChild(option);
      });
  } catch (error) {
      console.error("Erro ao carregar professores:", error.message);
  }
}

window.onload = () => carregarProfessores(0);


function openModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "block";
}

function closeModal() {
  const modal = document.getElementById("myModal");
  modal.style.display = "none";
}

function openEditModal() {
  const editModal = document.getElementById("editModal");
  editModal.style.display = "block";
}

function closeEditModal() {
  const editModal = document.getElementById("editModal");
  editModal.style.display = "none";
}

window.onclick = function (event) {
  const myModal = document.getElementById("myModal");
  const editModal = document.getElementById("editModal");

  if (event.target === myModal) closeModal();
  if (event.target === editModal) closeEditModal();
};

document.getElementById("studentForm").addEventListener("click", openModal);
