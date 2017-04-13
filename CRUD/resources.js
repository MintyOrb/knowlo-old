module.exports = function(app, db){
  var model = require('seraph-model');

  var Resource = model(db, 'resource');
  Resource.schema = {
  // name: { type: String, required: true },
  // email: { type: String, match: emailRegex, required: true },
  // age: { type: Number, min: 16, max: 85 },
  // expiry: Date
}
  var Term = model(db, "term");
//   Term.schema = {
//   name: { type: String, required: true },
//   email: { type: String, match: emailRegex, required: true },
//   age: { type: Number, min: 16, max: 85 },
//   expiry: Date
// }
  Resource.compose(Term, 'terms', 'TAGGED_WITH');

  // Resource.fields = ['name', 'brewery', 'style']; // props not on the list are stripped
  app.get('/work/', function(req, res){
    // var cypher = "match (n:term)-[q:HAS_TRANSLATION]->(p:translation) set q.languageCode = p.languageCode";
          //  + "RETURN count(n) ";
    db.query(cypher, function(err, result) {
      if (err) console.log(err);
      console.log(result)
      res.send(result)
    })
  })

  // return resource core, meta, and tagged terms based on ID.
  // language code passed in as "languageCode" by query, default to english
  app.get('/resource/:id', function(req, res){
    var cypher ="START resource=NODE({id}) MATCH (resource:resource)-[TAGGED_WITH]->(:term)-[r:HAS_TRANSLATION]->(tr:translation) where r.languageCode = {languageCode} with resource, collect(distinct tr) as terms return resource, terms"

    db.query(cypher, {id: parseInt(req.params.id), languageCode: req.query.languageCode || 'en'},function(err, result) {
      if (err) {console.log(err); res.status(500).send()};
      if(result){
        console.log(result[0])
        res.send(result[0])
      } else {
        res.status(404).send() // resource not found
      }
    })
  })
  app.put('/resource/:id', function(req, res){

  })
  app.post('/resource', function(req, res) {
    console.log(req.body)
      Beer.save({
          name: 'Pacific Ale',
          brewery: 'Stone & Wood'
      }, function(err, beer) {
          // saved!
      });

      res.send({
          message: 'Movie Added'
      });
  });
}
