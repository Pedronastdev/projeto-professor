const mysql = require('../mysql')

exports.getAlunos = async (req, res, next) => {
    try {
        const result = await mysql.execute("SELECT * FROM aluno;")
        const response = {
            quantidade: result.length,
            alunos: result.map(aluno => {
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
                        tipo: 'GET',
                        descricao: 'Retorna todos todos os alunos'
                    }
                };
            })
        };

        return res.status(201).send({ response });

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};


exports.postAluno = async (req, res, next) => {
    try {
        const query = `INSERT INTO aluno (nome, bimestre1, bimestre2, bimestre3, bimestre4, id_professor, serie, idade) VALUES (?,?,?,?,?,?,?,?)`;
        const result = await mysql.execute(query, [
            req.body.nome,
            req.body.bimestre1,
            req.body.bimestre2,
            req.body.bimestre3,
            req.body.bimestre4,
            req.body.id_professor,
            req.body.serie,
            req.body.idade
        ]);
          


        const response = {
            mensagem: 'Aluno criado com sucesso',

            alunoCriado: {
                id_aluno: result.insertId,
                nome: req.body.nome,
                bimestre1: req.body.bimestre1,
                bimestre2: req.body.bimestre2,
                bimestre3: req.body.bimestre3,
                bimestre4: req.body.bimestre4,
                id_professor: req.body.id_professor, 
                serie: req.body.serie,
                idade: req.body.idade,
                request: {
                    tipo: 'POST',
                    descricao: 'Insere um aluno'
                }
            }
        };

        return res.status(201).send(response);

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};


exports.getUmAluno = async(req, res, next) => {
    try {
        const query = `SELECT * FROM aluno WHERE id_aluno = ?;`
        const result = await mysql.execute(query, [req.params.id_aluno])

        if( result.length === 0){
            return res.status(500).send({ mensagem: 'Não foi encontrado nenhum Aluno com este ID'})

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
                    Tipo: 'GetUmAluno',
                    descricao: 'Retorna apenas um Aluno'
                }
            }
        }

        return res.status(201).send(response)
    } catch (error) {
        res.status(500).send({error : error})
    }
}


exports.patchAluno = async (req, res, next) => {
    try {
        const query = `
            UPDATE aluno 
            SET nome = ?, bimestre1 = ?, bimestre2 = ?, bimestre3 = ?, bimestre4 = ?, id_professor = ?, serie = ?, idade = ? 
            WHERE id_aluno = ?`;


        await mysql.execute(query, [
            req.body.nome,
            req.body.bimestre1,
            req.body.bimestre2,
            req.body.bimestre3,
            req.body.bimestre4,
            req.body.id_professor,
            req.body.serie,
            req.body.idade,
            req.body.id_aluno 
        ]);

        const response = {
            mensagem: 'Aluno atualizado com sucesso',
            alunoAtualizado: {
                id_aluno: req.body.id_aluno,
                nome: req.body.nome,
                bimestre1: req.body.bimestre1,
                bimestre2: req.body.bimestre2,
                bimestre3: req.body.bimestre3,
                bimestre4: req.body.bimestre4,
                id_professor: req.body.id_professor, 
                serie: req.body.serie,
                idade: req.body.idade,
                request: {
                    tipo: 'PATCH',
                    descricao: 'Atualiza um aluno'
                }
            }
        };

        return res.status(201).send(response);

    } catch (error) {
        return res.status(500).send({ error: error });
    }
};



exports.deleteAluno = async (req, res) => {
    try {
        const query = `DELETE FROM aluno WHERE id_aluno = ?;`;
        const result = await mysql.execute(query, [req.params.id_aluno]);

        if (result.length === 0) {
            return res.status(404).send({ mensagem: 'Não foi encontrado nenhum aluno com este ID' });
        }

        const response = {
            mensagem: 'Aluno removido com sucesso',
            request: {
                tipo: 'DELETE',
                descricao: 'Remover um aluno',
                body: {
                    nome: 'String',
                    serie: 'Number',
                    idade: 'Number',
                    bimestre1: 'Number',
                    bimestre2: 'Number',
                    bimestre3: 'Number',
                    bimestre4: 'Number',
                    media: 'Number'
                }
            }
        };

        return res.status(201).send(response);
    } catch (error) {
        return res.status(500).send({ error: error.message || error });
    }
};
