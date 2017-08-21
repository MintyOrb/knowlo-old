module.exports = function(app, db){
  var shortid = require('shortid');

  // resource routes
  app.get('/resource', query);              // generic public query resources based on provided term IDs
  app.get('/api/resource', query);          // query resources based on user details and provided term IDs
  //?app.get('/resource/:uid', readCore);   // read details of a single resource core

  app.get('/resource/:uid/full', readFull);   // read full details of a single resource (tagged terms and translation by language code)
  app.put('/api/resource/:uid/full', updateFull); // update full details of a single resource (tagged terms and translation by language code)
  app.post('/api/resource/:uid/full', createFull); // create full details of a single resource (tagged terms and translation by language code)

  app.get('/resource/:uid', readCore);       // read details of a single resource core
  app.put('/api/resource/:uid', updateCore); // update a single resource core node data
  app.post('/resource', createCore);     // create (or update, if present) a resource core node.
  app.delete('/api/resource', deleteCore);   // delete resource core node and relationships....and translations?

  app.get('/resource/:ruid/translation/', readTranslation);         // retrieve a translation of a resource based on resource id and provided langauge code. If language not found, attempt a translation. Also returns resource core
  app.put('/api/resource/:ruid/translation/:uid', updateTranslation);    // update single resoruce translation by ID | is /resource/:ruid superfluous? /resourceMeta/:uid instead?
  app.post('/api/resource/:ruid/translation/', createTranslation);      // create resource translation based on language code and connect to resource. Return resrouce core and new translation
  app.delete('/api/resource/:ruid/translation/:uid', deleteTranslation); // delete resource translation by id | delete node or just relatinship??

  app.get('/resource/:rUID/set/', readSets);               // retrieve a resources tagged sets
  app.put('/api/resource/:rUID/set/', updateSets);         // batch add sets to resource (with ids) - adds provided tags, doesn't remove relationships
  app.post('/api/resource/:rUID/set/', batchSetSets);      // batch set sets to resource (with ids) - delete all tags relationships and create for  tags provided
  app.put('/api/resource/:rUID/set/:sUID', updateSet);         // add a single set to a resources by id
  app.delete('/api/resource/:rUID/set/:sUID', deleteSet);   // remove a single set relationship from a resources | DELETE /term/:uid to delete term node itself


  function query(req, res){
    /**
    * searches for resources based on provide term IDs
    * language code passed in as "languageCode" by query, default to english
    * @param {Array} query // terms with status (include/exclude)
    * @param {Array} excludedSets //uid
    * @param {String} languageCode
    * @return {Object} resource
    */
    var cypher = "MATCH (re:resource)-[:TAGGED_WITH]->(synSet:synSet) "
           + "WHERE synSet.uid IN {includedSets} "
              //  + "NOT synSet.uid IN {excludedSets} "
           + "WITH re, count(*) AS connected "
           + "MATCH (rlangNode:translation)<-[rlang:HAS_TRANSLATION]-(re)-[:TAGGED_WITH]->(synSet:synSet)<-[topSynR:IN_SET]-(topSyn:term)-[tlang:HAS_TRANSLATION]->(tlangNode:translation) "
           + "WHERE "
              //  + "topSynR.order=1 "
               + "connected = {numberOfIncluded} "
               + "AND tlang.languageCode IN [ {language} , 'en' ] "
               + "AND rlang.languageCode IN [ {language} , 'en' ] "
           + "RETURN DISTINCT  collect( {term: synSet.uid, url: synSet.url, translation: {name: tlangNode.name, languageCode: tlang.languageCode } } ) AS terms, re as resource, rlangNode as translation "
           // + "ORDER BY {orderby} {updown}"
           // + "SKIP {skip} "
           + "LIMIT {limit}";
         if (typeof req.query.include === "undefined") {
             req.query.include = [];
         }
         if (typeof req.query.exclude === "undefined") {
             req.query.exclude = [];
         }
         console.log(req.query)
        db.query(cypher, {
            includedSets: req.query.include || [],
            excludedSets: req.query.exclude || [],
            numberOfIncluded: req.query.include.length,
            orderby: req.orderby,
            updown: req.updown,
            skip:0,
            limit: 50, // TODO: change for mobile
            language: 'en'
        }, function(err, result) {
      if (err) {console.log(err);res.status(500).send()};
          console.log(result.length)
          res.send(result)
      })
  }

  function readCore(req, res){
  }
  function updateCore(req,res){
  }
  function createCore(req, res){
    req.body.resource.core. uid = shortid.generate();
    // added vs added by....
     var cypher = "CREATE (resource:resource:tester {core}) "
                + "WITH resource, {detail} AS detail, keys({detail}) AS keys "
                + "FOREACH (index IN range(0, size(keys)-1) | "
                  + "MERGE (resource)-[r:HAS_PROPERTY {order: 1, type: keys[index] }]->(prop:prop:tester {type: keys[index] })-[tr:HAS_TRANSLATION]->(langNode:tester:translation {value: detail[keys[index]] } ) "
                + ") "
                + "RETURN resource"

    db.query(cypher, {
        url: req.body.resource.url,
        core: req.body.resource.core,
        detail: req.body.resource.detail
      },function(err, resource) {
      if (err) {console.log(err); res.status(500).send()};
      res.send()

    })
  }

  function deleteCore(req,res){
  }
  function readTranslation(req,res){
  }
  function updateTranslation(req,res){
  }
  function createTranslation(req,res){
  }
  function deleteTranslation(req,res){
  }
  function readSets(req,res){
  }
  function updateSets(req,res){
  }
  function batchSetSets(req,res){
  }
  function updateSet(req,res){
    // TODO:check for member authorization...
    var cypher = "MATCH (resource:resource {uid:{resource}}) , (set:synSet {uid:{set}}) "
               + "MERGE (resource)-[r:TAGGED_WITH]->(set) "
               + "SET r.connectedBy = {member}, r.dateConnected = TIMESTAMP() "
               + "RETURN resource, set"

    db.query(cypher, {resource: req.params.rUID, set: req.params.sUID, member: res.locals.user.uid },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }
  function deleteSet(req,res){
    console.log('in delete')
    console.log(req.params)
    // TODO:check for member authorization...
    var cypher = "MATCH (resource:resource {uid:{resource}})-[r:TAGGED_WITH]->(set:synSet {uid:{set}}) "
               + "DELETE r "
               + "RETURN resource, set "

    db.query(cypher, {resource: req.params.rUID, set: req.params.sUID, member: res.locals.user.uid },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }

  function readFull(req, res){
    /**
    * fetches and return resource core, meta (in selected language), and tagged terms based on ID.
    * language code passed in as "languageCode" by query, default to english
    * @param {Number} id
    * @param {String} languageCode
    * @return {Object} resource
    */

    var cypher ="MATCH (resource:resource {uid:{uid}})-[TAGGED_WITH]->(set:synSet)<-[setR:IN_SET]-(t:term)-[r:HAS_TRANSLATION]->(tr:translation) "
               +"WHERE r.languageCode = {languageCode} AND setR.order=1 "
               +"WITH resource, COLLECT(DISTINCT {setID: set.uid, term: t, translation: tr}) as terms "
               +"RETURN resource, terms"

    db.query(cypher, {uid: req.params.uid, languageCode: req.query.languageCode || 'en'},function(err, resource) {
      if (err) {console.log(err); res.status(500).send()};
      if(resource){
        res.send(resource[0])
      } else {
        res.status(404).send() // resource not found
      }
    })
  }

  function updateFull(req, res){
  }
  function createFull(req, res){
  }

}
