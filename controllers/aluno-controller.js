const mysql = require("../mysql");

exports.getAlunos = async (req, res, next) => {
  try {
    const result = await mysql.execute("SELECT * FROM aluno;");
    const response = {
      quantidade: result.length,
      alunos: result.map((aluno) => {
        return {
          id_aluno: aluno.id_aluno,
          nome: aluno.nome,
          bimestre1: aluno.bimestre1,
          bimestre2: aluno.bimestre2,
          bimestre3: aluno.bimestre3,
          bimestre4: aluno.bimestre4,
          media: aluno.media,
          id_professor: aluno.id_professor,
          serie: aluno.serie,
          idade: aluno.idade,
          request: {
            tipo: "GET",
            descricao: "Retorna todos os alunos",
          },
        };
      }),
    };

    return res.status(201).send({ response });
  } catch (error) {
    return res.status(500).send({ error: error });
  }
};

exports.postAluno = async (req, res, next) => {
  try {
    console.log("Dados recebidos no backend:", req.body);

    // Validação dos campos
    const {
      nome,
      bimestre1,
      bimestre2,
      bimestre3,
      bimestre4,
      id_professor,
      serie,
      idade,
    } = req.body;

    let erros = [];
    if (!nome) erros.push('O campo "nome" é obrigatório.');
    if (!serie || serie < 1 || serie > 9)
      erros.push('O campo "serie" deve estar entre 1 e 9.');
    if (isNaN(bimestre1) || bimestre1 < 0 || bimestre1 > 10)
      erros.push('O campo "bimestre1" deve estar entre 0 e 10.');
    if (isNaN(bimestre2) || bimestre2 < 0 || bimestre2 > 10)
      erros.push('O campo "bimestre2" deve estar entre 0 e 10.');
    if (isNaN(bimestre3) || bimestre3 < 0 || bimestre3 > 10)
      erros.push('O campo "bimestre3" deve estar entre 0 e 10.');
    if (isNaN(bimestre4) || bimestre4 < 0 || bimestre4 > 10)
      erros.push('O campo "bimestre4" deve estar entre 0 e 10.');
    if (isNaN(idade) || idade < 1 || idade > 100)
      erros.push('O campo "idade" deve estar entre 1 e 100.');
    if (!id_professor) erros.push('O campo "id_professor" é obrigatório.');

    if (erros.length > 0) {
      return res.status(400).send({ mensagem: "Erros de validação.", erros });
    }

    // Calculando a média
    const media = parseFloat(
      (
        (parseFloat(bimestre1) +
          parseFloat(bimestre2) +
          parseFloat(bimestre3) +
          parseFloat(bimestre4)) /
        4
      ).toFixed(2)
    );

    // Inserção no banco
    const query = `
            INSERT INTO aluno (nome, bimestre1, bimestre2, bimestre3, bimestre4, id_professor, serie, idade, media) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
    const result = await mysql.execute(query, [
      nome,
      bimestre1,
      bimestre2,
      bimestre3,
      bimestre4,
      id_professor,
      serie,
      idade,
      media,
    ]);

    console.log("Aluno inserido com sucesso, ID:", result.insertId);

    // Construção da resposta
    const response = {
      mensagem: "Aluno criado com sucesso",
      alunoCriado: {
        id_aluno: result.insertId,
        nome,
        bimestre1,
        bimestre2,
        bimestre3,
        bimestre4,
        id_professor,
        serie,
        idade,
        media,
        request: {
          tipo: "POST",
          descricao: "Insere um aluno",
        },
      },
    };

    return res.status(201).send(response);
  } catch (error) {
    console.error("Erro ao inserir aluno:", error);
    return res.status(500).send({ error: error.message || error });
  }
};

exports.getUmAluno = async (req, res, next) => {
  try {
    const query = `SELECT * FROM aluno WHERE id_aluno = ?;`;
    const result = await mysql.execute(query, [req.params.id_aluno]);

    if (result.length === 0) {
      return res
        .status(500)
        .send({ mensagem: "Não foi encontrado nenhum Aluno com este ID" });
    }

    const response = {
      produto: {
        id_aluno: result.id_aluno,
        nome: result[0].nome,
        bimestre1: result[0].bimestre1,
        bimestre2: result[0].bimestre2,
        bimestre3: result[0].bimestre3,
        bimestre4: result[0].bimestre4,
        serie: result[0].serie,
        idade: result[0].idade,
        media: result[0].media,
        id_professor: result[0].id_professor,
        resquest: {
          Tipo: "GetUmAluno",
          descricao: "Retorna apenas um Aluno",
        },
      },
    };

    return res.status(201).send(response);
  } catch (error) {
    res.status(500).send({ error: error });
  }
};

exports.patchAluno = async (req, res) => {
  try {
      // Extraímos os dados da URL e do corpo da requisição
      const { id_aluno } = req.params;  // ID do aluno vem da URL
      const { nome, bimestre1, bimestre2, bimestre3, bimestre4, serie, idade } = req.body;

      // Verifica se os dados obrigatórios estão presentes
      if (!id_aluno || !nome || !serie) {
          return res.status(400).send({ mensagem: "Dados incompletos fornecidos." });
      }

      // Calcula a média das notas
      const bimestres = [bimestre1, bimestre2, bimestre3, bimestre4];
      const media = bimestres.reduce((acc, nota) => acc + nota, 0) / bimestres.length;

      // Atualiza o aluno no banco de dados com o ID recebido na URL
      const query = `
          UPDATE aluno 
          SET nome = ?, bimestre1 = ?, bimestre2 = ?, bimestre3 = ?, bimestre4 = ?, media = ?, serie = ?, idade = ? 
          WHERE id_aluno = ?`;

      // Aqui estamos fazendo a execução da consulta SQL com os dados recebidos
      const result = await mysql.execute(query, [
          nome, bimestre1, bimestre2, bimestre3, bimestre4, media, serie, idade, id_aluno
      ]);

      // Verifica se a atualização afetou alguma linha no banco
      if (result.affectedRows === 0) {
          return res.status(404).send({ mensagem: "Nenhum aluno encontrado com o ID fornecido." });
      }

      // Resposta de sucesso, mostrando as informações do aluno atualizado
      const response = {
          mensagem: "Aluno atualizado com sucesso",
          alunoAtualizado: {
              id_aluno,
              nome,
              bimestre1,
              bimestre2,
              bimestre3,
              bimestre4,
              media,
              serie,
              idade,
              request: {
                  tipo: "PATCH",
                  descricao: "Atualiza um aluno",
              },
          },
      };

      return res.status(200).send(response);
  } catch (error) {
      // Log de erro no servidor para ajudar a identificar o que deu errado
      console.error("Erro ao atualizar aluno:", error);

      // Retorna uma mensagem de erro clara para o cliente
      return res.status(500).send({
          mensagem: "Erro no servidor ao tentar atualizar o aluno.",
          error: error.message || error,
      });
  }
};


exports.deleteAluno = async (req, res) => {
  try {
    // Consulta para deletar o aluno, utilizando o id_aluno passado na URL
    const query = "DELETE FROM aluno WHERE id_aluno = ?";
    await mysql.execute(query, [req.params.id_aluno]);

    // Se nenhum aluno for encontrado (affectedRows === 0), a exclusão não ocorreu
    const response = {
      mensagem: "Aluno removido com sucesso.",
    };

    return res.status(200).send(response);
  } catch (error) {
    console.error("Erro ao excluir aluno:", error);
    return res
      .status(500)
      .send({ Erro: error.message || "Erro desconhecido." });
  }
};
