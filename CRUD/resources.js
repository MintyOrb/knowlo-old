module.exports = function(app, db){
  var model = require('seraph-model');

  var Resource = model(db, 'resource');
  var Term = model(db, "term");
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

  app.get('/resource/:id', function(req, res){
    console.log(req.params.id)
    var cypher ="START resource=NODE({id}) MATCH (resource)-[TAGGED_WITH]-(:term)-[r:HAS_TRANSLATION]-(tr:translation) where r.languageCode ='en' with resource, collect(tr) as terms return resource, terms"
    // Resource.read(req.params.id, function(err, model){
    //   if(err){console.log(err)};
    //   res.send(model)
    // })
    db.query(cypher, {id: parseInt(req.params.id)},function(err, result) {
      if (err) console.log(err);
      console.log(result)
      if(result){
          res.send(result[0])
      } else {
        res.send() // resource not found
      }
    })
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
