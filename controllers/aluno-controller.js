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
                        descricao: 'Retorna todos os alunos'
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
        console.log("Dados recebidos no backend:", req.body);

        // Validação dos campos
        const { nome, bimestre1, bimestre2, bimestre3, bimestre4, id_professor, serie, idade } = req.body;

        let erros = [];
        if (!nome) erros.push('O campo "nome" é obrigatório.');
        if (!serie || serie < 1 || serie > 9) erros.push('O campo "serie" deve estar entre 1 e 9.');
        if (isNaN(bimestre1) || bimestre1 < 0 || bimestre1 > 10) erros.push('O campo "bimestre1" deve estar entre 0 e 10.');
        if (isNaN(bimestre2) || bimestre2 < 0 || bimestre2 > 10) erros.push('O campo "bimestre2" deve estar entre 0 e 10.');
        if (isNaN(bimestre3) || bimestre3 < 0 || bimestre3 > 10) erros.push('O campo "bimestre3" deve estar entre 0 e 10.');
        if (isNaN(bimestre4) || bimestre4 < 0 || bimestre4 > 10) erros.push('O campo "bimestre4" deve estar entre 0 e 10.');
        if (isNaN(idade) || idade < 1 || idade > 100) erros.push('O campo "idade" deve estar entre 1 e 100.');
        if (!id_professor) erros.push('O campo "id_professor" é obrigatório.');

        if (erros.length > 0) {
            return res.status(400).send({ mensagem: 'Erros de validação.', erros });
        }

        // Calculando a média
        const media = parseFloat(
            ((parseFloat(bimestre1) + parseFloat(bimestre2) + parseFloat(bimestre3) + parseFloat(bimestre4)) / 4).toFixed(2)
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
            media
        ]);

        console.log('Aluno inserido com sucesso, ID:', result.insertId);

        // Construção da resposta
        const response = {
            mensagem: 'Aluno criado com sucesso',
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
                    tipo: 'POST',
                    descricao: 'Insere um aluno'
                }
            }
        };

        return res.status(201).send(response);

    } catch (error) {
        console.error('Erro ao inserir aluno:', error);
        return res.status(500).send({ error: error.message || error });
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
