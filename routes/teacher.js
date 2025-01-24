const express = require('express');
const router = express.Router();

const TeacherController = require('../controllers/teacher-controller');


router.get('/', TeacherController.getProfessor);  

router.get('/todos', (req, res) => {
    console.log('Rota /professor/todos foi chamada');
    TeacherController.getTodos(req, res);
});

router.post('/', TeacherController.postProfessor);

router.patch('/', TeacherController.patchProfessor);

router.delete('/', TeacherController.deleteProfessor);

module.exports = router;