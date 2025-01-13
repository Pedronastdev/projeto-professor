const express = require('express');
const router = express.Router();

const TeacherController = require('../controllers/teacher-controller');

// Rota para buscar um único professor
router.get('/', TeacherController.getProfessor);  // Para buscar um professor pelo nome e matéria

// Rota para buscar todos os professores
router.get('/todos', (req, res) => {
    console.log('Rota /professor/todos foi chamada');
    TeacherController.getTodos(req, res);
});


// Rota para adicionar um professor
router.post('/', TeacherController.postProfessor);

// Rota para atualizar um professor
router.patch('/', TeacherController.patchProfessor);

// Rota para excluir um professor
router.delete('/', TeacherController.deleteProfessor);

module.exports = router;