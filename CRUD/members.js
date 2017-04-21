module.exports = function(app, db){
  var model = require('seraph-model');

  var Member = model(db, 'member');

  Member.fields = ['languageCode', 'name', 'fireBaseID'];

  // Member.setUniqueKey('name?', true);
  Member.useTimestamps();

  // member routes
  app.get('/member/:id', readCore);   // read details of a single member core
  app.put('/member/:id', updateCore); // update a single members core node data
  app.post('/member', createCore);    // create (or update, if present) a member core node.
  app.delete('/member', deleteCore);  // delete member core node and relationships....and translations?

  // app.get('/member/:rid/term/', readTerms);          // retrieve a members tagged terms
  // app.put('/member/:rid/term/', updateTerms);        // batch add terms to member (with ids) - adds provided tags, doesn't remove relationships
  // app.post('/member/:rid/term/', batchSetTerms);     // batch set terms to member (with ids) - delete all tags relationships and create for  tags provided
  // app.put('/member/:rid/term/:id', setTerm);         // add a single term to a members by id
  // app.delete('/member/:rid/term/:id', deleteTerm);   // remove a single term relationship from a members | DELETE /term/:id to delete term node itself

  function readCore(req, res){
  }

  function updateCore(req, res){
  }

  function createCore(req, res){
  }

  function deleteCore(req, res){
  }
}
