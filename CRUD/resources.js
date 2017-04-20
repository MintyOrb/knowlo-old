module.exports = function(app, db){
  var model = require('seraph-model');

  // set up resource and resourceMeta models and schema
  var Resource = model(db, 'resource');
  Resource.fields = ['thumb','URL','displayType','source','timeToView','insight','difficulty','created', 'updated', 'viewCount']; // props not on the list are stripped
  // Resource.schema = {
  //   'thumb': {type: String, required: true},
  //   'URL': {type: String, required: true},
  //   'displayType': {type: String, required: true},
  //   'source': {type: String, required: true},
  //   'timeToView': {type: String, required: true},
  //   'insight': {type: String, required: true},
  //   'difficulty': {type: String, required: true},
  //   'created': Date,
  //   'updated': Date,
  //   'viewCount': {type: String, required: true};
  // name: { type: String, required: true },
  // email: { type: String, match: emailRegex, required: true },
  // age: { type: Number, min: 16, max: 85 },
  // expiry: Date
// }
  // Resource.setUniqueKey('UUID', true);
  Resource.useTimestamps();

  var ResourceTranslation = model(db, 'resourceTranslation');
  ResourceTranslation.fields = ['text','title','subtitle','description','value','languageCode', '_rel']; // props not on the list are stripped
  // ResourceTranslation.schema = {
  // name: { type: String, required: true },
  // email: { type: String, match: emailRegex, required: true },
  // age: { type: Number, min: 16, max: 85 },
  // expiry: Date
  // }

  Resource.compose(ResourceTranslation, 'translations', 'HAS_TRANSLATION');
  ResourceTranslation.useTimestamps();

  // resource routes
  app.get('/resource', query);          // query resources based on user details and provided term IDs - /resource/query instaed?
  app.get('/resource/:id', readCore);   // read details of a single resource core
  app.put('/resource/:id', updateCore); // update a single resource core node data
  app.post('/resource', createCore);    // create (or update, if present) a resource core node.
  app.delete('/resource', deleteCore);  // delete resource core node and relationships....and translations?

  app.get('/resource/:rid/translation/', readTranslation);         // retrieve a translation of a resource based on resource id and provided langauge code. If language not found, attempt a translation. Also returns resource core
  app.put('/resource/:rid/translation/:id', updateTranslation);    // update single resoruce translation by ID | is /resource/:rid superfluous? /resourceMeta/:id instead?
  app.post('/resource/:rid/translation/', createTranslation);      // create resource translation based on language code and connect to resource. Return resrouce core and new translation
  app.delete('/resource/:rid/translation/:id', deleteTranslation); // delete resource translation by id | delete node or just relatinship??

  app.get('/resource/:rid/term/', readTerms);          // retrieve a resources tagged terms
  app.put('/resource/:rid/term/', updateTerms);        // batch add terms to resource (with ids) - adds provided tags, doesn't remove relationships
  app.post('/resource/:rid/term/', batchSetTerms);     // batch set terms to resource (with ids) - delete all tags relationships and create for  tags provided
  app.put('/resource/:rid/term/:id', setTerm);         // add a single term to a resources by id
  app.delete('/resource/:rid/term/:id', deleteTerm);   // remove a single term relationship from a resources | DELETE /term/:id to delete term node itself

  app.get('/resource/:id/full', readFull);   // read full details of a single resource (tagged terms and translation by language code)
  app.put('/resource/:id/full', updateFull); // update full details of a single resource (tagged terms and translation by language code)
  app.post('/resource/:id/full', createFull); // create full details of a single resource (tagged terms and translation by language code)


  function query(req, res){
    /**
    * searches for resources based on provide term IDs
    * language code passed in as "languageCode" by query, default to english
    * @param {Array} terms
    * @param {String} languageCode
    * @return {Object} resource
    */

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
               +"WHERE resource.URL={url} " // OR tr.text={text} ? don't want to match on empty strings....
               +"WITH resource, COLLECT(DISTINCT tr) as terms "
               +"RETURN resource, terms"
    console.log(req.body.resource)
    // try to find existing resource based on URL and text
    db.query(cypher, {url: req.body.resource.URL, text: req.body.resource.translations.text},function(err, resource) {
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
  function setTerm(req,res){
  }
  function deleteTerm(req,res){
  }

  function readFull(req, res){
    /**
    * fetches and return resource core, meta (in selected language), and tagged terms based on ID.
    * language code passed in as "languageCode" by query, default to english
    * @param {Number} id
    * @param {String} languageCode
    * @return {Object} resource
    */
    var cypher ="START resource=NODE({id}) "
               +"MATCH (resource:resource)-[TAGGED_WITH]->(:term)-[r:HAS_TRANSLATION]->(tr:translation) "
               +"WHERE r.languageCode = {languageCode} "
               +"WITH resource, COLLECT(DISTINCT tr) as terms "
               +"RETURN resource, terms"

    db.query(cypher, {id: parseInt(req.params.id), languageCode: req.query.languageCode || 'en'},function(err, resource) {
      if (err) {console.log(err); res.status(500).send()};
      if(resource){
        console.log(resource[0])
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
