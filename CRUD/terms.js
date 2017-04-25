module.exports = function(app, db){
  var model = require('seraph-model');

  var Term = model(db, 'term');
  var Translation = model(db, 'translation');
  Term.compose(Translation, 'translations', 'HAS_TRANSLATION');

  Term.fields = ['url', 'origin', 'MID']; // props not on the list are stripped
  Term.setUniqueKey('origin');
  Term.useTimestamps(); // tracks created and updated

  Translation.fields = ['name', 'definition', 'languageCode', 'dateAdded', "_rel"]; // props not on the list are stripped
  Translation.useTimestamps() // tracks created and updated

  app.get('/api/term', query);          // query terms based on user details and provided term IDs - /term/query instaed?
  app.get('/term/:id', read);       // read details of a single term and translation
  app.put('/api/term/:id', updateCore); // update a single resrouces core node data
  app.post('/api/term', create);        // create (or update, if present) a term core and single translation node.
  app.delete('/api/term', deleteCore);  // delete term core node and relationships....and translations?

  app.get('/api/term/:teid/translation/', readTranslation);         // retrieve a translation of a term based on term id and provided langauge code. If language not found, attempt a translation. Also returns term core
  app.put('/api/term/:teid/translation/:id', updateTranslation);    // update single term translation by ID | is /term/:teid superfluous? /termMeta/:id instead?
  app.post('/api/term/:teid/translation/', createTranslation);      // create term translation based on language code and connect to term. Return resrouce core and new translation
  app.delete('/api/term/:teid/translation/:id', deleteTranslation); // delete term translation by id | delete node or just relatinship??

  app.get('/api/term/:teid/alias/', readAlias);         // retrieve a alias of a term based on term id and provided langauge code. If language not found, attempt a alias. Also returns term core
  app.put('/api/term/:teid/alias/:id', updateAlias);    // update single term alias by ID | is /term/:teid superfluous? /termMeta/:id instead?
  app.post('/api/term/:teid/alias/', createAlias);      // create term alias based on language code and connect to term. Return resrouce core and new alias
  app.delete('/api/term/:teid/alias/:id', deleteAlias); // delete term alias by id | delete node or just relatinship??
  //
  app.get('/api/term/:teid/group/', readGroup);         // retrieve a group of a term based on term id and provided langauge code. If language not found, attempt a group. Also returns term core
  app.put('/api/term/:teid/group/:id', updateGroup);    // update single term group by ID | is /term/:teid superfluous? /termMeta/:id instead?
  app.post('/api/term/:teid/group/', createGroup);      // create term group based on language code and connect to term. Return resrouce core and new group
  app.delete('/api/term/:teid/group/:id', deleteGroup); // delete term group by id | delete node or just relatinship??

  /*
  ████████ ███████ ██████  ███    ███
     ██    ██      ██   ██ ████  ████
     ██    █████   ██████  ██ ████ ██
     ██    ██      ██   ██ ██  ██  ██
     ██    ███████ ██   ██ ██      ██
  */

  function query(req, res){
  }

  /**
  * reads term core node and translation
  * language code passed via member as "member.languageCode" on body, default to english
  * @param {String} languageCode
  * @param {String} id will try to match on translation name of language provided and retrieve term id
  * @param {Number} id
  * @return {Object} resource
  */
  function read(req, res){

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
    // pass in term ID ot be updated
    // pass in updated term deets

    // copy term to revision node BEFORE updating
    // track time of modification

    var cypher = "MATCH (member:member) WHERE member.id={memberid} "
               + "MATCH (term:term) WHERE term.id={termid} "
               + "OPTIONAL MATCH (term)-[r:HAS_REVISION]->(:edit) "
               + "DELETE r "
               + "CREATE (member)-[:EDITED]->(revision:edit)<-[:HAS_REVISION]-(term) "
               + "SET revision = term "
              //  + "SET term = {updatedTerm}" vs "MERGE (term {updatedTerm})"
               + "RETURN term"
    // match term by ID?
    db.query(cypher, {term: req.body.term, member: res.locals.user },function(err, result) {
      if (err) console.log(err);
      console.log(result)
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }

  /**
  * creates a new term core - (or updates existing - match based on provided string across all languages?)
  * language code passed via member as "member.languageCode" on body, default to english
  * @param {String} languageCode
  * @param {String} term
  * @return {Object}
  */
  function create(req, res){
    // check if exists...
      // if so-> add coreid req.body -> update(req,res)
    // else create

    // add create date to nodes add updated in update function...
    console.log(req.body)
    var cypher = "MERGE (member:member {member}) MERGE (term:term {term}) MERGE (translation:translation {translation}) "
               + "MERGE (member)-[:ADDED]->(term)-[r:HAS_TRANSLATION]->(translation)<-[:ADDED]-(member) "
               + "SET r.languageCode = {translation.languageCode} "
               + "RETURN term, translation"
// 'Parameter maps cannot be used in MERGE patterns (use a literal map instead, eg. "{id: {param}.id}")
    db.query(cypher, {term: req.body.term, translation: req.body.translation, member: res.locals.user },function(err, result) {
      if (err) console.log(err);
      console.log(result)
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }

  function deleteCore(req, res){
  }

  /*
  ████████ ██████   █████  ███    ██ ███████ ██       █████  ████████ ██  ██████  ███    ██
     ██    ██   ██ ██   ██ ████   ██ ██      ██      ██   ██    ██    ██ ██    ██ ████   ██
     ██    ██████  ███████ ██ ██  ██ ███████ ██      ███████    ██    ██ ██    ██ ██ ██  ██
     ██    ██   ██ ██   ██ ██  ██ ██      ██ ██      ██   ██    ██    ██ ██    ██ ██  ██ ██
     ██    ██   ██ ██   ██ ██   ████ ███████ ███████ ██   ██    ██    ██  ██████  ██   ████
  */
  function readTranslation(req, res){
  }

  function updateTranslation(req, res){
  }

  function createTranslation(req, res){
  }

  function deleteTranslation(req, res){
  }

  /*
   █████  ██      ██  █████  ███████
  ██   ██ ██      ██ ██   ██ ██
  ███████ ██      ██ ███████ ███████
  ██   ██ ██      ██ ██   ██      ██
  ██   ██ ███████ ██ ██   ██ ███████
  */

  function readAlias(req, res){
  }

  function updateAlias(req, res){
  }

  function createAlias(req, res){
  }

  function deleteAlias(req, res){
  }

  /*
   ██████  ██████   ██████  ██    ██ ██████
  ██       ██   ██ ██    ██ ██    ██ ██   ██
  ██   ███ ██████  ██    ██ ██    ██ ██████
  ██    ██ ██   ██ ██    ██ ██    ██ ██
   ██████  ██   ██  ██████   ██████  ██
  */

  function readGroup(req, res){
  }

  function updateGroup(req, res){
  }

  function createGroup(req, res){
  }

  function deleteGroup(req, res){
  }


  /*
   █████  ██    ██ ████████  ██████   ██████  ██████  ███    ███ ██████  ██      ███████ ████████ ███████
  ██   ██ ██    ██    ██    ██    ██ ██      ██    ██ ████  ████ ██   ██ ██      ██         ██    ██
  ███████ ██    ██    ██    ██    ██ ██      ██    ██ ██ ████ ██ ██████  ██      █████      ██    █████
  ██   ██ ██    ██    ██    ██    ██ ██      ██    ██ ██  ██  ██ ██      ██      ██         ██    ██
  ██   ██  ██████     ██     ██████   ██████  ██████  ██      ██ ██      ███████ ███████    ██    ███████
  */


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
}
