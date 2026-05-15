const Joi = require("joi");
const mysql = require("../mysql");

// Função para validar entradas usando Joi
const validateProfessorInput = (data, schema) => {
  const { error } = schema.validate(data);
  if (error) {
    throw new Error(error.details[0].message);
  }
};

// Schemas de validação
const professorSchema = Joi.object({
  nome: Joi.string().required(),
  materia: Joi.string().required(),
});

const updateProfessorSchema = Joi.object({
  nome: Joi.string().required(),
  materia: Joi.string().required(),
  newNome: Joi.string().required(),
  newMateria: Joi.string().required(),
});

exports.getProfessor = async (req, res) => {
  try {

    const { nome, materia } = req.query;

    if (!nome || !materia) {
      return res.status(400).send({
        mensagem: "Nome e matéria são obrigatórios",
      });
    }

    const professorQuery = `
      SELECT
        id_professor,
        nome,
        materia
      FROM professor
      WHERE nome = ?
      AND materia = ?
    `;

    const professorResult = await mysql.execute(
      professorQuery,
      [nome, materia]
    );

    if (
      !professorResult ||
      professorResult.length === 0
    ) {
      return res.status(404).send({
        mensagem: "Professor não encontrado",
      });
    }

    const professor = professorResult[0];

    const alunosQuery = `
      SELECT
        id_aluno,
        nome,
        idade,
        serie,
        bimestre1,
        bimestre2,
        bimestre3,
        bimestre4,
        media
      FROM aluno
      WHERE id_professor = ?
    `;

    const alunosResult = await mysql.execute(
      alunosQuery,
      [professor.id_professor]
    );

    return res.status(200).send({
      professor,
      alunos: alunosResult,
    });

  } catch (error) {

    console.error(
      "Erro ao buscar professor:",
      error
    );

    return res.status(500).send({
      erro: error.message,
    });
  }
};

exports.postProfessor = async (req, res) => {
  try {
    validateProfessorInput(req.body, professorSchema);

    const checkQuery = `SELECT * FROM professor WHERE nome = ? AND materia = ?`;
    const checkResult = await mysql.execute(checkQuery, [
      req.body.nome,
      req.body.materia,
    ]);

    if (checkResult.length > 0) {
      return res.status(409).send({ mensagem: "Professor já adicionado" });
    }

    const query = `INSERT INTO professor (nome, materia) VALUES (?, ?)`;
    const result = await mysql.execute(query, [
      req.body.nome,
      req.body.materia,
    ]);

    const response = {
      mensagem: "Professor criado com sucesso",
      professor: {
        id_professor: result.insertId,
        nome: req.body.nome,
        materia: req.body.materia,
        request: {
          tipo: "POST",
          descricao: "Adiciona Professor",
        },
      },
    };

    return res.status(201).send(response);
  } catch (error) {
    return res.status(500).send({ erro: error.message });
  }
};

exports.getTodos = async (req, res) => {
  try {
    const results = await mysql.execute("SELECT * FROM professor");

    if (results.length === 0) {
      return res.status(404).send({ mensagem: "Nenhum professor encontrado" });
    }

    const response = {
      professores: results.map((professor) => {
        return {
          id_professor: professor.id_professor,
          nome: professor.nome,
          materia: professor.materia,
        };
      }),
    };

    return res.status(200).send(response);
  } catch (error) {
    return res.status(500).send({ erro: error.message });
  }
};

exports.patchProfessor = async (req, res) => {
  try {
    validateProfessorInput(req.body, updateProfessorSchema);
    const nomeNormalizado = req.body.nome.trim().toLowerCase();
    const materiaNormalizada = req.body.materia.trim().toLowerCase();
    const newNomeNormalizado = req.body.newNome.trim().toLowerCase();
    const newMateriaNormalizada = req.body.newMateria.trim().toLowerCase();

    const query = `
            UPDATE professor 
            SET nome = ?, materia = ? 
            WHERE nome = ? AND materia = ?;
        `;

    const result = await mysql.execute(query, [
      newNomeNormalizado,
      newMateriaNormalizada,
      nomeNormalizado,
      materiaNormalizada,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).send({ mensagem: "Professor não encontrado" });
    }

    const response = {
      mensagem: "Professor atualizado",
      professor: {
        nome: req.body.newNome,
        materia: req.body.newMateria,
        request: {
          tipo: "PATCH",
          descricao: "Atualiza nome e matéria do professor",
        },
      },
    };

    return res.status(200).send(response);
  } catch (error) {
    return res.status(500).send({ erro: error.message });
  }
};

exports.deleteProfessor = async (req, res) => {

  try {

    const { nome, materia } = req.body;

    if (!nome || !materia) {

      return res.status(400).send({
        mensagem:
          "Nome e matéria obrigatórios",
      });
    }

    const [professor] =
      await mysql.execute(
        `
        SELECT id_professor
        FROM professor
        WHERE nome = ?
        AND materia = ?
        `,
        [nome, materia]
      );

    if (
      !professor ||
      professor.length === 0
    ) {

      return res.status(404).send({
        mensagem:
          "Professor não encontrado",
      });
    }

    await mysql.execute(
      `
      DELETE FROM professor
      WHERE nome = ?
      AND materia = ?
      `,
      [nome, materia]
    );

    return res.status(200).send({
      mensagem:
        "Professor excluído com sucesso",
    });

  } catch (error) {

    console.error(
      "Erro ao excluir professor:",
      error
    );

    return res.status(500).send({
      erro:
        "Erro interno do servidor",
    });
  }
};
