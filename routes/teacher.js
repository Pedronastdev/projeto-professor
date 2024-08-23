const express = require ('express');
const router = express.Router();

const TeacherController = require ('../controllers/teacher-controller');


router.get('/',TeacherController.getProfessor);

router.post('/',TeacherController.postProfessor);

router.patch('/',TeacherController.patchProfessor);

router.delete('/',TeacherController.deleteProfessor);


module.exports = router;