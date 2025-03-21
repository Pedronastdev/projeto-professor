const Joi = require('joi');
const mysql = require('../mysql');

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
      validateProfessorInput(req.query, professorSchema);
 
      const professorQuery = `SELECT id_professor, nome, materia FROM professor WHERE nome = ? AND materia = ?`;
      const professorResult = await mysql.execute(professorQuery, [req.query.nome, req.query.materia]);
  
      if (professorResult.length === 0) {
        return res.status(404).send({ 
          mensagem: 'Professor não encontrado', 
          detalhes: `Não foi encontrado nenhum professor com nome '${req.query.nome}' e matéria '${req.query.materia}'.` 
        });
      }
  
      const professor = professorResult[0];
  
      const alunosQuery = `
        SELECT 
            id_aluno, 
            nome, 
            idade, 
            bimestre1, 
            bimestre2, 
            bimestre3, 
            bimestre4, 
            media, 
            serie
        FROM aluno
        WHERE id_professor = ?`;
      
      const alunosResult = await mysql.execute(alunosQuery, [professor.id_professor]);
      
      const response = {
        professor: {
          id_professor: professor.id_professor,
          nome: professor.nome,
          materia: professor.materia
        },
        alunos: alunosResult.map(aluno => ({
          id_aluno: aluno.id_aluno,
          nome: aluno.nome,
          idade: aluno.idade,
          bimestre1: aluno.bimestre1,
          bimestre2: aluno.bimestre2,
          bimestre3: aluno.bimestre3,
          bimestre4: aluno.bimestre4,
          media: aluno.media,
          serie: aluno.serie
        })),
        request: {
          tipo: 'GET',
          descricao: 'Puxar um professor e seus alunos'
        }
      };
  
      return res.status(200).send(response);
  
    } catch (error) {

      console.error("Erro ao buscar professor:", error);
      return res.status(500).send({ 
        erro: error.message || 'Erro interno do servidor' 
      });
    }
  };
  
exports.postProfessor = async (req, res) => {
    try {

        validateProfessorInput(req.body, professorSchema);

        const checkQuery = `SELECT * FROM professor WHERE nome = ? AND materia = ?`;
        const checkResult = await mysql.execute(checkQuery, [req.body.nome, req.body.materia]);

        if (checkResult.length > 0) {
            return res.status(409).send({ mensagem: 'Professor já adicionado' });
        }

        const query = `INSERT INTO professor (nome, materia) VALUES (?, ?)`;
        const result = await mysql.execute(query, [req.body.nome, req.body.materia]);

        const response = {
            mensagem: 'Professor criado com sucesso',
            professor: {
                id_professor: result.insertId,
                nome: req.body.nome,
                materia: req.body.materia,
                request: {
                    tipo: 'POST',
                    descricao: 'Adiciona Professor'
                }
            }
        };

        return res.status(201).send(response);

    } catch (error) {
        return res.status(500).send({ erro: error.message });
    }
};


exports.getTodos = async (req, res) => {
    try {

        const results = await mysql.execute('SELECT * FROM professor');


        if (results.length === 0) {
            return res.status(404).send({ mensagem: 'Nenhum professor encontrado' });
        }


        const response = {
            professores: results.map(professor => {
                return {
                    id_professor: professor.id_professor,
                    nome: professor.nome,
                    materia: professor.materia
                };
            })
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
        
        const result = await mysql.execute(query, [newNomeNormalizado, newMateriaNormalizada, nomeNormalizado, materiaNormalizada]);
        

        if (result.affectedRows === 0) {
            return res.status(404).send({ mensagem: 'Professor não encontrado' });
        }

        const response = {
            mensagem: 'Professor atualizado',
            professor: {
                nome: req.body.newNome,
                materia: req.body.newMateria,
                request: {
                    tipo: 'PATCH',
                    descricao: 'Atualiza nome e matéria do professor'
                }
            }
        };

        return res.status(200).send(response);

    } catch (error) {
        return res.status(500).send({ erro: error.message });
    }
};

// Excluir professor com base em nome e matéria
exports.deleteProfessor = async (req, res) => {
  const { nome, materia } = req.body;

  try {

      const checkQuery = 'SELECT * FROM professor WHERE nome = ? AND materia = ?';
      const [result] = await mysql.execute(checkQuery, [nome, materia]);

      if (result.length === 0) {
          return res.status(404).send({ erro: 'Professor não encontrado' });
      }

      // Realizar a exclusão do professor
      const deleteQuery = 'DELETE FROM professor WHERE nome = ? AND materia = ?';
      await mysql.execute(deleteQuery, [nome, materia]);

      return res.status(200).send({
          mensagem: 'Professor excluído com sucesso',
          request: {
              tipo: 'DELETE',
              descricao: 'Excluir um professor',
          },
      });
  } catch (err) {
      console.error('Erro ao excluir professor:', err);
      return res.status(500).send({ erro: 'Erro ao excluir professor' });
  }
};