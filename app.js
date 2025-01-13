const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');

const app = express();


global.__basedir = __dirname;


app.use(morgan('dev'));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));


const rotaAluno = require('./routes/aluno');
const rotaTeacher = require('./routes/teacher');


app.use('/aluno', rotaAluno);
app.use('/professor', rotaTeacher);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Página de cadastro de professor
app.get('/pagina-professor.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'pagina-professor.html'));
});

module.exports = app;
