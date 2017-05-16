
module.exports = function(app, db){
var shortid = require('shortid');

app.get('/term/autocomplete/:text', autocomplete);
app.get('/term/most', most);

app.get('/api/term', query);           // query terms based on user details and provided term IDs - /term/query instaed?
app.get('/term/:name/:uid?', read);    // read details of a single term and translation
app.put('/api/term/:uid', updateCore); // update a single resrouces core node data
app.post('/api/term', create);         // create (or update, if present) a term core and single translation node.
app.delete('/api/term', deleteCore);   // delete term core node and relationships....and translations?

app.get('/api/term/:termID/translation/', readTranslation);          // retrieve a translation of a term based on term id and provided langauge code. If language not found, attempt a translation. Also returns term core
app.put('/api/term/:termID/translation/:uid', updateTranslation);    // update single term translation by ID | is /term/:termID superfluous? /termMeta/:uid instead?
app.post('/api/term/:termID/translation/', createTranslation);       // create term translation based on language code and connect to term. Return resrouce core and new translation
app.delete('/api/term/:termID/translation/:uid', deleteTranslation); // delete term translation by id | delete node or just relatinship??

app.get('/api/term/:termID/synonym/', readSynonym);            // retrieve synonyms of a term based on term id and provided langauge code. If language not found, attempt translation? Also returns term core
app.put('/api/term/:termID/synonym/:synID', updateSynonym);    // add term synonym by ID | is /term/:termID superfluous? /termMeta/:uid instead?
// ? don't need? app.post('/api/term/:termID/synonym/', createSynonym);      // create term synonym based on language code and connect to term. Return resrouce core and new synonym
app.delete('/api/term/:termID/synonym/:synID', deleteSynonym); // delete term synonym by id | delete node or just relatinship??

app.get('/api/term/:termID/group/', readGroup);          // retrieve a terms groups of a term based on term id and provided langauge code. If language not found, attempt a group. Also returns term core
app.put('/api/term/:termID/group/:uid', updateGroup);    // update single term group by ID | is /term/:termID superfluous? /termMeta/:uid instead?
// ? app.post('/api/term/:termID/group/', createGroup);     // create term group based on language code and connect to term. Return resrouce core and new group
app.delete('/api/term/:termID/group/:uid', deleteGroup); // delete term group by id | delete node or just relatinship??

/*
████████ ███████ ██████  ███    ███
   ██    ██      ██   ██ ████  ████
   ██    █████   ██████  ██ ████ ██
   ██    ██      ██   ██ ██  ██  ██
   ██    ███████ ██   ██ ██      ██
*/

function query(req, res){


   var cypher = "MATCH (contentNode:resource)-[:TAGGED_WITH]->(searchTerms:term) "
              + "WHERE searchTerms.UUID IN {searchTerms} "
              + "WITH contentNode, COUNT(searchTerms) as count "
              + "WHERE count = {searchTermsCount} "
              + "MATCH (groupNode:termGroup)<-[:IN_GROUP]-(matched:term)<-[:TAGGED_WITH]-contentNode, "
                  + "matched-[:HAS_LANGUAGE {languageCode: {language} }]->(termMeta:termMeta) "
              + "WHERE groupNode.name IN {groups} AND NOT matched.UUID IN {ignoreTerms} "
              + "RETURN DISTINCT count(DISTINCT contentNode) AS connections, termMeta.name AS name, matched.UUID AS UUID "
              + "ORDER BY connections DESC ";
              // + "ORDER BY {orderby} {updown}"
              // + "SKIP {skip} "
              + "LIMIT {limit}";

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
  if(req.params.uid == 'undefined' && req.params.name){
    var uid = req.params.name; // match term on name
    var cypher = "MATCH (term:term)-[r:HAS_TRANSLATION]->(translation:translation) "
               + "WHERE LOWER(translation.name)=LOWER({uid}) "
               + "AND r.languageCode={languageCode} return term, translation"
  } else {
    var uid = req.params.uid; // match term on id
    var cypher ="MATCH (term {uid:{uid}})-[r:HAS_TRANSLATION]->(translation:translation) WHERE r.languageCode={languageCode} return term, translation"
  }
  db.query(cypher, {uid: uid, languageCode: req.query.languageCode || 'en'},function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send() // TODO:term not found...or not found in desired language? get translation and add to db...
    }
  })
}

function updateCore(req, res){
  // pass in term ID ot be updated
  // pass in updated term deets

  // copy term to revision node BEFORE updating
  // track time of modification

  // NEED TO VALIDATE THIS
  var cypher = "MATCH (member:member {uid: {memberID} }) "
             + "MATCH (term:term {uid: {term}.uid }) "
             + "OPTIONAL MATCH (term)-[r:HAS_REVISION]->(:edit) "
             + "DELETE r "
             + "CREATE (member)-[e:EDITED]->(revision:edit)<-[:HAS_REVISION]-(term) " // create or merge here?
             + "SET revision = term, e.date=TIMESTAMP() "
             + "MERGE (term {term}) "
             + "RETURN term"
  db.query(cypher, {term: req.body.term, memberID: res.locals.user.uid },function(err, result) {
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
* creates a new term core and primary translation - (or updates existing - match based on provided string across all languages?)
* language code passed via member as "member.languageCode" on body, default to english
* @param {String} languageCode
* @param {String} term
* @return {Object}
*/
function create(req, res){
  req.body.term.uid=shortid.generate()
  req.body.translation.uid=shortid.generate()

  var cypher = "MATCH (member:member {uid:{mid}}) "
             + "MERGE (term:term {english: {term}.english }) "
               + "ON CREATE SET term={term}, term.created=TIMESTAMP() "
               + "ON MATCH SET term={term}, term.updated=TIMESTAMP() "
             + "MERGE (translation:translation {name: {translation}.name}) "
               + "ON CREATE SET translation={translation}, translation.created=TIMESTAMP() "
               + "ON MATCH SET translation={translation}, translation.updated=TIMESTAMP() "
             + "MERGE (member)-[:ADDED]->(term)-[r:HAS_TRANSLATION {languageCode: {translation}.languageCode }]->(translation)<-[:ADDED]-(member) "
             + "RETURN term, translation"

  db.query(cypher, {term: req.body.term, translation: req.body.translation, mid: res.locals.user.uid },function(err, result) {
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
███████ ██    ██ ███    ██  ██████  ███    ██ ██    ██ ███    ███
██       ██  ██  ████   ██ ██    ██ ████   ██  ██  ██  ████  ████
███████   ████   ██ ██  ██ ██    ██ ██ ██  ██   ████   ██ ████ ██
     ██    ██    ██  ██ ██ ██    ██ ██  ██ ██    ██    ██  ██  ██
███████    ██    ██   ████  ██████  ██   ████    ██    ██      ██
*/
function readSynonym(req, res){
}

function updateSynonym(req, res){

  // TODO:check for member authorization...
  var cypher = "MATCH (base:term {uid:{term}}) , (syn:term {uid:{syn}}) "
             + "MERGE (base)-[r:HAS_SYNONYM]->(syn)"
             + "SET r.connectedBy = {member}, r.dateConnected = TIMESTAMP() "
             + "RETURN base, syn"

  db.query(cypher, {term: req.params.termID, syn: req.params.synID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      console.log(result)
      res.send(result[0])
    } else {
      res.send()
    }
  })
}

function deleteSynonym(req, res){
  // TODO:check for member authorization...
  var cypher = "MATCH (base:term {uid:{term}})-[r:HAS_SYNONYM]->(syn:term {uid:{syn}}) "
             + "DELETE r"
             + "RETURN base, syn"

  db.query(cypher, {term: req.params.termID, syn: req.params.synID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      console.log(result)
      res.send(result[0])
    } else {
      res.send()
    }
  })
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


function autocomplete(req,res){

  var properties = {
    code: 'en',
    match: '(?i).*' + req.params.text + '.*'
  };

  var query = [
      "MATCH (core:term)-[r:HAS_TRANSLATION {languageCode:{code}}]->(langNode) ",
      "WHERE langNode.name =~ {match} ",
      "RETURN DISTINCT core as term, langNode as translation  LIMIT 8" // order by....?
  ].join('\n');

  db.query(query, properties, function (err, matches) {
      if (err) {console.log("error in db query: " + err);}
      res.send(matches);
  });

}



// get most commonly tagged terms
// TODO: skip/limit - language - disregard/include synonyms? - Terms most tagged to other terms?
function most(req,res){
    console.log('in most')
  var cypher = "MATCH (term:term)<-[:TAGGED_WITH]-(resource:resource) "
             + "RETURN term.english, COUNT(resource) AS score "
             + "ORDER BY score DESC skip 30 limit 10"
  db.query(cypher, {languageCode: req.query.languageCode || 'en'},function(err, result) {
    if (err) console.log(err);
    console.log(result)

      res.send(result) // resource not found
    })
  }
}
