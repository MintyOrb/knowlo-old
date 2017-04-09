module.exports = function(app, db){
  var model = require('seraph-model');

  var Term = model(db, 'term');
  var Translation = model(db, 'translation');
  Term.compose(Translation, 'terms', 'HAS_TRANSLATION');


  // Term.fields = ['name', 'brewery', 'style']; // props not on the list are stripped

  app.get('/term', function(req, res){
    res.send({mes: 'woah'})
  })

  app.post('/term', function(req, res) {
      Beer.save({
          name: 'Pacific Ale',
          brewery: 'Stone & Wood'
      }, function(err, beer) {
          // saved!
      });
  });
}
