var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var BabelNet = require('babelnet');
var db = require("seraph")({
  server: "http://localhost:7474",
  user: 'neo4j',
  pass: 'admin'
});

app.use(bodyParser.json())
app.use(express.static('./'))

require('./CRUD/terms')(app, db);
require('./CRUD/resources')(app, db);

app.listen('8000', function () {
  console.log('listening on port 8000')
})
