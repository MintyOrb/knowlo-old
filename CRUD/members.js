module.exports = function(app, db){

  // member routes
  app.get('/member/:id', readCore);   // read details of a single member core
  app.put('/api/member/:id', updateCore); // update a single members core node data
  app.post('/api/member', createCore);    // create (or update, if present) a member core node.
  app.delete('/api/member', deleteCore);  // delete member core node and relationships....and translations?

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
    var member = {
      name: res.locals.user.name,
      email: res.locals.user.email,
      picture: res.locals.user.picture,
      uid: res.locals.user.uid
    }

    var cypher = "MERGE (member:member {uid:{map}.uid}) "
               + "ON CREATE SET member={map}, member.created=TIMESTAMP()"
               + "ON MATCH SET member={map}, member.lastLogin=TIMESTAMP()"

    db.query(cypher, {map: member },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }

  function deleteCore(req, res){
  }
}
