const express = require ("express")
const bodyParser = require('body-parser');
const app = express();
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());

app.get('/', (req,res, next) =>{

  res.sendFile(__dirname + '/index.html')

})

module.exports = app; 