module.exports = function(app, db){
  var model = require('seraph-model');

  var Term = model(db, 'term');
  var Translation = model(db, 'translation');
  Term.compose(Translation, 'translations', 'HAS_TRANSLATION');

  Term.fields = ['url', 'english', 'dateAdded', 'MID', 'languageAddedIn']; // props not on the list are stripped
  Term.setUniqueKey('english', true); // using this feels hacky...the field was only meant to be added as a convinience when using the neo4j browser
  Term.useTimestamps(); // tracks created and updated

  Translation.fields = ['name', 'definition', 'languageCode', 'dateAdded', "_rel"]; // props not on the list are stripped
  Translation.useTimestamps() // tracks created and updated

  app.get('/term', query);          // query terms based on user details and provided term IDs - /term/query instaed?
  app.get('/term/:id', readCore);   // read details of a single term core
  app.put('/term/:id', updateCore); // update a single resrouces core node data
  app.post('/term', createCore);    // create (or update, if present) a term core node.
  app.delete('/term', deleteCore);  // delete term core node and relationships....and translations?

  app.get('/term/:teid/translation/', readTranslation);         // retrieve a translation of a term based on term id and provided langauge code. If language not found, attempt a translation. Also returns term core
  app.put('/term/:teid/translation/:id', updateTranslation);    // update single term translation by ID | is /term/:teid superfluous? /termMeta/:id instead?
  app.post('/term/:teid/translation/', createTranslation);      // create term translation based on language code and connect to term. Return resrouce core and new translation
  app.delete('/term/:teid/translation/:id', deleteTranslation); // delete term translation by id | delete node or just relatinship??

  function query(req, res){
  }

  function readCore(req, res){
    /**
    * reads term core node and translation
    * language code passed via member as "member.languageCode" on body, default to english
    * @param {String} languageCode
    * @param {String} id will try to match on translation name of language provided and retrieve term id
    * @param {Number} id
    * @return {Object} resource
    */
    if(isNaN(parseInt(req.params.id))){
      var id = req.params.id; // match term on name
      var cypher = "MATCH (term:term)-[r:HAS_TRANSLATION]->(translation:translation) "
                 + "WHERE LOWER(translation.name)=LOWER({id}) "
                 + "AND r.languageCode={languageCode} return term, translation"
    } else {
      var id = parseInt(req.params.id); // match term on id
      var cypher ="START term=NODE({id}) MATCH (term)-[r:HAS_TRANSLATION]->(translation:translation) WHERE r.languageCode={languageCode} return term, translation"
    }
    db.query(cypher, {id: id, languageCode: req.query.languageCode || 'en'},function(err, result) {
      if (err) console.log(err);
      console.log(result)
      if(result){
        res.send(result[0])
      } else {
        res.send() // resource not found...or not found in desired language? get translation and add to db...
      }
    })
  }

  function updateCore(req, res){
  }

  function createCore(req, res){
    /**
    * creates a new term core - first looks for existing?
    * language code passed via member as "member.languageCode" on body, default to english
    * @param {String} languageCode
    * @param {Number} id
    * @return {Object} resource
    */

  }

  function deleteCore(req, res){
  }

  function readTranslation(req, res){
  }

  function updateTranslation(req, res){
  }

  function createTranslation(req, res){
  }

  function deleteTranslation(req, res){
  }

  app.put('/term/:id', function(req, res) {
    // update core - icon url
    //update relationships- translations? synonyms? groups?

    // var term = {
    //     url: req.body.url,
    //     translations: [
    //        { name: 'Columbus', languageCode:, _rel: { languageCode:  } },
    //     ]
    //   };
    // // ...for translation in req.body term.translations.push
    // Term.update(term, function(err, saved) {
    //   if (err) console.log(err);
    //   console.log(saved);
    //   res.send()// blah.
    // })
  });

  // get most commonly tagged terms
  // TODO: skip/limit - language - disregard/include synonyms? - Terms most tagged to other terms?
  app.get('/term/most', function(req,res){
    var cypher = "MATCH (term:term)<-[:TAGGED_WITH]-(resource:resource) "
               + "RETURN term.english, COUNT(resource) AS score "
               + "ORDER BY score DESC "
    db.query(cypher, {id: id, languageCode: req.query.languageCode || 'en'},function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result[0])
      } else {
        res.send() // resource not found
      }
    })
  })

  app.get('/term/autocomplete/:text', function(req,res){

    var properties = {
      code: 'en',
      match: '(?i).*' + req.params.text + '.*'
    };

    var query = [
        "MATCH (core:term)-[r:HAS_TRANSLATION {languageCode:{code}}]-(langNode) ",
        "WHERE langNode.name =~ {match} ",
        "RETURN langNode.name as name, core.url as url, ID(core) as id  LIMIT 8" // order by....?
    ].join('\n');

    db.query(query, properties, function (err, matches) {
        if (err) {console.log("error in db query: " + err);}
        res.send(matches);
    });

  })
}
