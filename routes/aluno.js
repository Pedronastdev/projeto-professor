const express = require('express');
const router = express.Router();

const AlunoController = require('../controllers/aluno-controller');


router.get('/', AlunoController.getAlunos);
router.get('/:id_aluno', AlunoController.getUmAluno);
router.post('/', AlunoController.postAluno);
router.patch('/:id_aluno', AlunoController.patchAluno);
router.delete('/:id_aluno', AlunoController.deleteAluno);

module.exports = router;

