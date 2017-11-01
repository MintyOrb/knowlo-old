var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var admin = require('firebase-admin');
var firebaseMiddleware = require('express-firebase-middleware');

if(process.env.GRAPHENEDB_URL){
  url = require('url').parse(process.env.GRAPHENEDB_URL);
  var db = require("seraph")({
    server: url.protocol + '//' + url.host,
    user: url.auth.split(':')[0],
    pass: url.auth.split(':')[1]
  });
} else {
  var db = require("seraph")({
    server: "http://localhost:7474",
    user: 'neo4j',
    pass: 'admin'
  });
}


admin.initializeApp({
  credential: admin.credential.cert({
     "project_id": "knowlo-952cc",
    "private_key": process.env.FIREBASE_PRIVATE_KEY,
   "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: "https://knowlo-952cc.firebaseio.com/"
});

app.use('/api', firebaseMiddleware.auth);
app.use(bodyParser.json())
app.use(express.static('./'))

require('./initDB')(app, db);
require('./CRUD/terms')(app, db);
require('./CRUD/resources')(app, db);
require('./CRUD/members')(app, db);

// task scripts
// require('./dothings')(app, db);

app.listen( process.env.PORT || '8000', function () {
  console.log('listening...')
})
