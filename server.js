var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var BabelNet = require('babelnet');

// BabelNet.getSynsetIds({
//   word: 'apple',
//   language: 'EN'
// }, function(err, results) {
//   if (err) {
//     throw(err);
//   }
//   console.log(JSON.stringify(results));
// });

// BabelNet.getSynset({
//   synsetId: 'bn:00289737n',
// }, function(err, results) {
//   if (err) {
//     throw(err);
//   }
//   console.log('synset:')
//   console.log(JSON.stringify(results));
// })
//
// BabelNet.getSenses({
//   word: 'apple',
//   language: 'EN'
// }, function(err, results) {
//   if (err) {
//     throw(err);
//   }
//   console.log('senses:')
//   console.log(JSON.stringify(results));
// })
//
// BabelNet.getEdges({
//   synsetId: 'bn:00289737n',
// }, function(err, results) {
//   if (err) {
//     throw(err);
//   }
//   console.log('edges:')
//   console.log(JSON.stringify(results));
// })

var db = require("seraph")({
  server: "http://localhost:7474",
  user: 'neo4j',
  pass: 'admin'
});

app.use(bodyParser.json())

app.use(express.static('./'))

app.listen('8000', function () {
  console.log('listening on port 8000')
})


app.post('/something/', function(req, res){
  console.log(req.body)
  var query = [
     "MATCH (contentNode:content {UUID: {id} }) ",
     "OPTIONAL MATCH (meta:contentMeta)-[r:HAS_META]-(contentNode)",
     'WHERE r.languageCode = {language}',
     'RETURN contentNode.displayType AS displayType, contentNode.savedAs AS savedAs, contentNode.webURL AS webURL, contentNode.embedSrc AS embedSrc '
 ].join('\n');

 var properties = {
     id: req.body.id,
     language: req.query.language || 'en',
 };
 db.query(query, properties, function (err, content) {
     if (err) {console.log("error in db query: ",  err);}
     if(content === undefined){
         res.send({ message : 'content not found' });
     } else {
         res.send(content);
     }
 });

})
