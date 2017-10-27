module.exports = function(app, db){

  // member routes
  app.get('/member/:muid', publicReadFull);       // read details of a single member page
  app.get('/member/:muid/set/top', readTopSets);       // read member sets in group
  app.get('/member/:muid/set/:guid', readGroups);       // read member sets in group
  app.get('/api/member/:muid', memberReadFull);   // read details of a single member page
  app.put('/api/member/:muid', updateCore); // update a single members core node data
  app.post('/api/member', createCore);    // create (or update, if present) a member core node.
  app.delete('/api/member', deleteCore);  // delete member core node and relationships....and translations?

  // app.get('/member/:rid/term/', readTerms);          // retrieve a members tagged terms
  // app.put('/member/:rid/term/', updateTerms);        // batch add terms to member (with ids) - adds provided tags, doesn't remove relationships
  // app.post('/member/:rid/term/', batchSetTerms);     // batch set terms to member (with ids) - delete all tags relationships and create for  tags provided
  // app.put('/member/:rid/term/:id', setTerm);         // add a single term to a members by id
  // app.delete('/member/:rid/term/:id', deleteTerm);   // remove a single term relationship from a members | DELETE /term/:id to delete term node itself

  function publicReadFull(req, res){
    console.log(req.params)
    // history of first viewed resources
    var cypher = "MATCH (mem:member {uid:{muid}}) "
               + "OPTIONAL MATCH (mem)-[v:VIEWED]->(re:resource) "//"-[:TAGGED_WITH]-(sets:synSets) "
               + "WITH re,v "
               + "MATCH (mem)-[gVote:CAST_VOTE]->(re) " // get global rankings
                 + "WITH re, v, AVG(gVote.quality) AS gq, AVG(gVote.complexity) AS gc, COUNT(distinct gVote) AS votes "
               + "OPTIONAL MATCH (re)-[p:HAS_PROPERTY]->(prop:prop)-[plang:HAS_TRANSLATION ]->(ptrans:translation) "
               + "WHERE p.order=1 AND plang.languageCode IN [ {language} , 'en' ] "
               + "RETURN  "
               + "collect(DISTINCT {type: prop.type, value: ptrans.value}) AS properties, "
               + "{quality: gq , complexity: gc } AS globalVote, "
               + "votes, "
               + "v, re as resource "
               + "ORDER BY v.firstViewed "
               + "LIMIT 10 "

    db.query(cypher, { muid: req.params.muid, groupUID: req.params.guid, language: 'en' },function(err, result) {
      if (err) console.log(err);
      if(result){
        for(rindex in result){
          for(pindex in result[rindex].properties){
            result[rindex].resource[result[rindex].properties[pindex].type] = result[rindex].properties[pindex].value;
          }
          delete result[rindex].properties // no need to send redundant data
        }
        res.send(result)
      } else {
        res.send()
      }
    })
  }
  function readTopSets(req, res){
    console.log('in read top')
    var cypher = "MATCH (mem:member {uid:{muid}}) "
               + "MATCH (mem)-[v:VIEWED]->(re:resource)-[:TAGGED_WITH]->(sets:synSet) "
               + "WITH sets, count(*) as count "
               + "OPTIONAL MATCH (sets)-[setR:IN_SET]-(:term)-[:HAS_TRANSLATION {languageCode: {language} }]->(translation:translation) "
               + "WHERE setR.order=1 "
               + "RETURN translation, sets as term, sets.uid AS setID, "
               + " count  "
               + "ORDER BY  count desc LIMIT 10 "

    db.query(cypher, { muid: req.params.muid, language: 'en' },function(err, result) {
      if (err) console.log(err);
      console.log('back from fetch top...')
      if(result){
        console.log(result)
        res.send(result)
      } else {
        res.send()
      }
    })
  }

  function readGroups(req, res){

    var cypher = "MATCH (mem:member {uid:{muid}}) "
               + "MATCH (mem)-[v:VIEWED]->(re:resource)-[:TAGGED_WITH]->(sets:synSet)-[gOrder:IN_SET]->(group:synSet) "
               + "WHERE group.uid = {groupUID} "
               + "WITH sets, gOrder, count(*) as count "
               + "OPTIONAL MATCH (sets)-[setR:IN_SET]-(:term)-[:HAS_TRANSLATION {languageCode: {language} }]->(translation:translation) "
               + "WHERE setR.order=1 "
               + "RETURN translation, sets as term, sets.uid AS setID, "
               + "gOrder.order as order, count  "
               + "ORDER BY  order "

    db.query(cypher, { muid: req.params.muid, groupUID: req.params.guid, language: 'en' },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result)
      } else {
        res.send()
      }
    })
  }

  function memberReadFull(req, res){
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
               + "ON CREATE SET {map}.joined=TIMESTAMP(), {map}.lastLogin=TIMESTAMP(), member={map} "
               + "ON MATCH SET member={map}, member.lastLogin=TIMESTAMP() "
               + "RETURN member"

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
