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
        aluno.nome = document.getElementById('nome').value;
        aluno.serie = (document.getElementById('serie').value);
        aluno.bi1 = Number(document.getElementById('bi1').value);
        aluno.bi2 = Number(document.getElementById('bi2').value);
        aluno.bi3 = Number(document.getElementById('bi3').value);
        aluno.bi4 = Number(document.getElementById('bi4').value);
        aluno.idade = Number(document.getElementById('idade').value);
    
        aluno.media = ((aluno.bi1 + aluno.bi2 + aluno.bi3 + aluno.bi4) / 4).toFixed(2);
    
        return aluno;

    }

    validaCampos(aluno) {
        let msg = '';

        if (aluno.nome == '') {
            msg += '- Informe o nome do aluno \n';
        }
        if (aluno.serie == '') {
            msg += '- Informe a série do aluno \n';
        }
        if (isNaN(aluno.bi1) || aluno.bi1 < 0 || aluno.bi1 > 10) {
            msg += '- Informe uma nota válida para B1 (0-10) \n';
        }
        if (isNaN(aluno.bi2) || aluno.bi2 < 0 || aluno.bi2 > 10) {
            msg += '- Informe uma nota válida para B2 (0-10) \n';
        }
        if (isNaN(aluno.bi3) || aluno.bi3 < 0 || aluno.bi3 > 10) {
            msg += '- Informe uma nota válida para B3 (0-10) \n';
        }
        if (isNaN(aluno.bi4) || aluno.bi4 < 0 || aluno.bi4 > 10) {
            msg += '- Informe uma nota válida para B4 (0-10) \n';
        }
        if (aluno.idade == '') {
            msg += '- Informe a idade do aluno \n';
        }
        if (msg != '') {
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

        this.arrayAlunos.forEach(aluno => {
            const { nome, serie,idade, bi1, bi2, bi3, bi4, media, id } = aluno;

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

            const [btnEdit, btnDelete] = tr.querySelectorAll('.btn');

            btnEdit.addEventListener('click', () => this.editarAluno(aluno, tr));
            btnDelete.addEventListener('click', () => this.deletarAluno(id));
        });
    }
    
    cancelar() {
        const elementosParaLimpar = ['nome', 'serie', 'bi1', 'bi2', 'bi3', 'bi4', 'idade'];

        elementosParaLimpar.forEach(id => {
            document.getElementById(id).value = '';
        });
    }

    editarAluno(aluno, linha) {
        document.getElementById('editNome').value = aluno.nome;
        document.getElementById('editBi1').value = aluno.bi1;
        document.getElementById('editBi2').value = aluno.bi2;
        document.getElementById('editBi3').value = aluno.bi3;
        document.getElementById('editBi4').value = aluno.bi4;

        openEditModal();

        const editForm = document.getElementById('editForm');
        editForm.onsubmit = (event) => {
            event.preventDefault();
            aluno.nome = document.getElementById('editNome').value;
            aluno.bi1 = Number(document.getElementById('editBi1').value);
            aluno.bi2 = Number(document.getElementById('editBi2').value);
            aluno.bi3 = Number(document.getElementById('editBi3').value);
            aluno.bi4 = Number(document.getElementById('editBi4').value);

            aluno.media = ((aluno.bi1 + aluno.bi2 + aluno.bi3 + aluno.bi4) / 4).toFixed(2);

            linha.querySelector('.nome').innerText = aluno.nome;
            linha.querySelector('.bi1').innerText = aluno.bi1;
            linha.querySelector('.bi2').innerText = aluno.bi2;
            linha.querySelector('.bi3').innerText = aluno.bi3;
            linha.querySelector('.bi4').innerText = aluno.bi4;
            linha.querySelector('.media').innerText = aluno.media;

            closeEditModal();
        };
    }

    deletarAluno(id) {
        this.arrayAlunos = this.arrayAlunos.filter(aluno => aluno.id !== id);
        this.listaTabela();
    }
}

var aluno = new Aluno();

document.getElementById('studentForm').addEventListener('submit', function (event) {
    aluno.salvarAluno();
    event.preventDefault();
});

function openModal() {
    const modal = document.getElementById('myModal').style.display ='block';
    modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('myModal').style.display = 'none';
    modal.classList.remove('active');
}

// Fechar o modal ao clicar fora do conteúdo do modal
document.getElementById('myModal').addEventListener('click', (event) => {
    const modalContent = document.querySelector('#myModal .modal-content');
    if (!modalContent.contains(event.target)) {
        closeModal();
    }
});

function openEditModal() {
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}
