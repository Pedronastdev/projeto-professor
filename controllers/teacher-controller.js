const mysql = require("../mysql");

exports.getProfessor = async (req, res) => {
  try {
    const { nome, materia } = req.query;

    if (!nome || !materia) {
      return res.status(400).send({ error: 'Nome e matéria são obrigatórios' });
    }

    const query = 'SELECT * FROM professor WHERE nome = ? AND materia = ?';
    const [result]  = await mysql.execute(query, [nome, materia]);

    if (result.length === 0) {
      return res.status(404).send({ error: 'Professor não encontrado' });
    }

    const response = {
      professores: result.map(professor => ({
        nome: professor.nome,
        materia: professor.materia,
      })),
    };

    return res.status(200).send(response);

  } catch (error) {
    console.error('Erro ao buscar professor:', error);
    return res.status(500).send({ error: 'Erro interno do servidor' });
  }
};

  
exports.postProfessor = async (req, res) => {
  try {
    if (!req.body.nome || !req.body.materia) {
      return res.status(400).send("Nome e matéria são obrigatórios");
    }

    const checkQuery = "SELECT * FROM professor WHERE nome = ? AND materia = ?";
    const checkResult = await mysql.execute(checkQuery, [
      req.body.nome,
      req.body.materia,
    ]);

    if (checkResult.length > 0) {
      return res.status(409).send("Professor já adicionado");
    }

    const query = "INSERT INTO professor (nome, materia) VALUES (?, ?)";
    const result = await mysql.execute(query, [
      req.body.nome,
      req.body.materia,
    ]);

    const response = {
      mensagem: "Professor Criado com Sucesso",
      professor: {
        id_professor: result.insertId,
        nome: req.body.nome,
        materia: req.body.materia,
        request: {
          tipo: "POST",
          descricao: "Adiciona Professor"
        },
      },
    };

    return res.status(201).send(response);
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

exports.patchProfessor = async (req, res) => {
    try {
      const { nome, materia, newNome, newMateria } = req.body;
  
      // Verifica se todos os campos necessários foram fornecidos
      if (!nome || !materia || !newNome || !newMateria) {
        return res.status(400).send({
          message: "Por favor, forneça todos os campos necessários: nome, materia, newNome, newMateria.",
        });
      }
  
      // Atualiza os dados do professor no banco de dados
      const query = 'UPDATE professor SET nome = ?, materia = ? WHERE nome = ? AND materia = ?;';
      const [result] = await mysql.execute(query, [newNome, newMateria, nome, materia]);
  
      // Verifica se o professor foi encontrado e atualizado
      if (result.affectedRows === 0) {
        return res.status(404).send({ message: "Professor não encontrado" });
      }
  
      // Monta a resposta de sucesso
      const response = {
        mensagem: "Professor atualizado com sucesso",
        professor: {
          nome: newNome,
          materia: newMateria,
          request: {
            tipo: "PATCH",
            descricao: "Atualiza nome e matéria do professor",
          },
        },
      };
  
      return res.status(200).send(response);
      
    } catch (error) {
      // Lida com erros internos e retorna uma resposta apropriada
      return res.status(500).send({ error: error.message });
    }
  };
  
  exports.deleteProfessor = async (req, res) => {
    try {
      const { nome, materia } = req.body;
      if (!nome || !materia) {
        return res.status(400).send({ Erro: "Nome e matéria são obrigatórios" });
      }
    
      const query = `DELETE FROM professor WHERE nome = ? AND materia = ?`;
      const result = await mysql.execute(query, [nome, materia]);
    
      if (result.affectedRows === 0) {
        return res.status(404).send({ error: "Professor não encontrado" });
      }
    
      const response = {
        mensagem: "Professor removido com sucesso",
          request: {
            tipo: "DELETE",
            descricao: "Deletar um professor"
          },
        };
    
      return res.status(200).send(response);

    } catch (error) {
      return res.status(500).send({ Erro: error.message });
    }

  };