var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var BabelNet = require('babelnet');
var admin = require('firebase-admin')
var serviceAccount = require("./knowlo-952cc-firebase-adminsdk-xglpa-f461a5d2be.json");
var firebaseMiddleware = require('express-firebase-middleware');
var db = require("seraph")({
  server: "http://localhost:7474",
  user: 'neo4j',
  pass: 'admin'
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://knowlo-952cc.firebaseio.com/"
});

app.use('/', firebaseMiddleware.auth);
app.use(bodyParser.json())
app.use(express.static('./'))

require('./CRUD/terms')(app, db);
require('./CRUD/resources')(app, db);
require('./CRUD/members')(app, db);

app.listen('8000', function () {
  console.log('listening on port 8000')
})
