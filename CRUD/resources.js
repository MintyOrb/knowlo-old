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
  app.post('/api/resource', createCore);     // create (or update, if present) a resource core node.
  app.delete('/api/resource', deleteCore);   // delete resource core node and relationships....and translations?

  app.get('/resource/:ruid/translation/', readTranslation);         // retrieve a translation of a resource based on resource id and provided langauge code. If language not found, attempt a translation. Also returns resource core
  app.put('/api/resource/:ruid/translation/:uid', updateTranslation);    // update single resoruce translation by ID | is /resource/:ruid superfluous? /resourceMeta/:uid instead?
  app.post('/api/resource/:ruid/translation/', createTranslation);      // create resource translation based on language code and connect to resource. Return resrouce core and new translation
  app.delete('/api/resource/:ruid/translation/:uid', deleteTranslation); // delete resource translation by id | delete node or just relatinship??

  app.get('/resource/:rUID/term/', readTerms);               // retrieve a resources tagged terms
  app.put('/api/resource/:rUID/term/', updateTerms);         // batch add terms to resource (with ids) - adds provided tags, doesn't remove relationships
  app.post('/api/resource/:rUID/term/', batchSetTerms);      // batch set terms to resource (with ids) - delete all tags relationships and create for  tags provided
  app.put('/api/resource/:rUID/term/:tUID', updateTerm);         // add a single term to a resources by id
  app.delete('/api/resource/:rUID/term/:tUID', deleteTerm);   // remove a single term relationship from a resources | DELETE /term/:uid to delete term node itself


  function query(req, res){
    /**
    * searches for resources based on provide term IDs
    * language code passed in as "languageCode" by query, default to english
    * @param {Array} query // terms with status (include/exclude)
    * @param {Array} excludedTerms //uid
    * @param {String} languageCode
    * @return {Object} resource
    */
    var cypher = "MATCH (re:resource)-[:TAGGED_WITH]->(termNode:term) " // -:HAS_SYNONYM-()?
           + "WHERE "
               + "termNode.uid IN {includedTerms} "
               + "AND NOT termNode.uid IN {excludedTerms} "
          //  + " MATCH (re2:resource)-[:TAGGED_WITH]->(syn:term)-[:HAS_SYNONYM]-(termNode) "
          //  + "WHERE "
          //      + "termNode.uid IN {includedTerms} "
          //      + "AND NOT termNode.uid IN {excludedTerms} "
           + "WITH re, count(*) AS connected "
           + "MATCH (rlangNode:translation)<-[rlang:HAS_TRANSLATION]-(re)-[:TAGGED_WITH]->(termNode:term)-[tlang:HAS_TRANSLATION]->(tlangNode:translation) "
           + "WHERE "
               + "connected = {numberOfIncluded} "
               + "AND tlang.languageCode IN [ {language} , 'en' ] "
               + "AND rlang.languageCode IN [ {language} , 'en' ] "
           + "RETURN DISTINCT  collect( {term: termNode.uid, url: termNode.url, translation: {name: tlangNode.name, languageCode: tlang.languageCode } } ) AS terms, re as resource, rlangNode as translation "
           // + "ORDER BY {orderby} {updown}"
           // + "SKIP {skip} "
           + "LIMIT {limit}";
         if (typeof req.query.include === "undefined") {
             req.query.include = 0;
         }
        db.query(cypher, {
            includedTerms: req.query.include || [],
            excludedTerms: req.query.exclude || [],
            numberOfIncluded: req.query.include.length,
            orderby: req.orderby,
            updown: req.updown,
            skip:0,
            limit: 50, // TODO: change for mobile
            language: 'en'
        }, function(err, result) {
      if (err) {console.log(err);res.status(500).send()};
          res.send(result)
      })
  }

  function readCore(req, res){
  }
  function updateCore(req,res){
  }
  function createCore(req, res){
    /**
    * creates or updates resource core node
    * language code passed via member as "member.languageCode" on body, default to english
    * @param {Object} resource
    * @return {Object} resource
    */
    console.log('create resource here:')
    var cypher ="MATCH (resource:resource)-[r:HAS_TRANSLATION]->(tr:resourceTranslation) "
               +"WHERE resource.url={url} " // OR tr.text={text} ? don't want to match on empty strings....
               +"WITH resource, COLLECT(DISTINCT tr) as terms "
               +"RETURN resource, terms"
    console.log(req.body.resource)
    // try to find existing resource based on url and text
    db.query(cypher, {url: req.body.resource.url, text: req.body.resource.translations.text},function(err, resource) {
      if (err) {console.log(err); res.status(500).send()};
      if(resource){
        console.log('FOUND RESOURCE')
        console.log(resource[0])
        req.body.resource.id=resource[0].resource.id // put returned id on the sent create object
        update(req,res) // translations are duplicated unless accompanied by id
      } else {
        // generate thumb, save, add to obj
        console.log('NONE FOUND - SAVING AS NEW')
        Resource.save(req.body.resource, function(err, resource) {
            if (err) {console.log(err); res.status(500).send()};
            console.log('saved resource')
            // connect to member....
            res.send(resource);
        });
      }
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
  function readTerms(req,res){
  }
  function updateTerms(req,res){
  }
  function batchSetTerms(req,res){
  }
  function updateTerm(req,res){
    console.log('in update')
    // TODO:check for member authorization...
    console.log(req.params)
    var cypher = "MATCH (resource:resource {uid:{resource}}) , (term:term {uid:{term}}) "
               + "MERGE (resource)-[r:TAGGED_WITH]->(term) "
               + "SET r.connectedBy = {member}, r.dateConnected = TIMESTAMP() "
               + "RETURN resource, term"

    db.query(cypher, {resource: req.params.rUID, term: req.params.tUID, member: res.locals.user.uid },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }
  function deleteTerm(req,res){
    console.log('in delete')
    console.log(req.params)
    // TODO:check for member authorization...
    var cypher = "MATCH (resource:resource {uid:{resource}})-[r:TAGGED_WITH]->(term:term {uid:{term}}) "
               + "DELETE r "
               + "RETURN resource, term "

    db.query(cypher, {resource: req.params.rUID, term: req.params.tUID, member: res.locals.user.uid },function(err, result) {
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
    var cypher ="MATCH (resource:resource {uid:{uid}})-[TAGGED_WITH]->(t:term)-[r:HAS_TRANSLATION]->(tr:translation) "
               +"WHERE r.languageCode = {languageCode} "
               +"WITH resource, {term: t, translation: tr} as term "
               +"RETURN resource, COLLECT(DISTINCT term) AS terms"

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
    /**
    * updates resource core node and set of terms based on provided resource ID - translations?
    * @param {Object} resource
    * @return {Object} resource
    */
    console.log('update here')
    console.log(req.body.resource)
    Resource.update(req.body.resource, function(err, resource) {
        if (err) {console.log(err); res.status(500).send()};
        console.log('updated resource')
        console.log(resource)
        // connect to member
        res.send(resource);
    });
  }
  function createFull(req, res){
  }

}
