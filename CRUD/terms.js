module.exports = function(app, db){

var shortid = require('shortid');

app.get('/term/autocomplete/:text/:exclude?', autocomplete);
app.get('/term/most', most);

// translation
app.get('/set/:setID/translation/', readTranslation);          // retrieve a translation of a set based on term id and provided langauge code. If language not found, attempt a translation. Also returns term core
app.put('/api/set/:setID/translation/:uid', updateTranslation);    // update single set translation by ID | is /set/:setID superfluous? /setMeta/:uid instead?
app.post('/api/set/:setID/translation/', createTranslation);       // create set translation based on language code and connect to set. Return resrouce core and new translation
app.delete('/api/set/:setID/translation/:uid', deleteTranslation); // delete set translation by id | delete node or just relatinship??
// synonym
app.get('/set/:setID/synonym/', readSynonym);                // retrieve synonyms of a set based on set id and provided langauge code. If language not found, attempt translation? Also returns set core
app.put('/api/set/:setID/synonym/:otherID', updateSynonym);    // add set synonym by ID | is /set/:setID - copy any other sets and resource relationships
// ? don't need? app.post('/api/set/:setID/synonym/', createSynonym);      // create set synonym based on language code and connect to set. Return resrouce core and new synonym
app.delete('/api/set/:setID/synonym/:termID', deleteSynonym); // delete term synonym by id | delete node or just relatinship??
// groups
app.get('/set/:setID/group/', readGroup);                 // retrieve a terms groups of a term based on term id and provided langauge code. If language not found, attempt a group. Also returns term core
app.put('/api/set/:setID/group/:groupID', updateGroup);    // update single term group by ID | is /term/:termID superfluous? /termMeta/:uid instead?
// ? app.post('/api/term/:termID/group/', createGroup);     // create term group based on language code and connect to term. Return resrouce core and new group
app.delete('/api/set/:setID/group/:groupID', deleteGroup); // delete term group by id | delete node or just relatinship??
// within
app.get('/set/:setID/within/', within);
app.put('/api/set/:setID/within/:otherID', updateWithin);
app.delete('/api/set/:setID/within/:otherID', deleteWithin);
// contains
app.get('/set/:setID/contains/', contains);
app.put('/api/set/:setID/contains/:otherID', updateContains);
app.delete('/api/set/:setID/contains/:otherID', deleteContains);

// props
app.get('/set/:setID/props/', getProps);

// app.get('/set/:ruid/meta/', getMeta); //
app.put('/api/set/:sID/meta/:mID', tagMeta);
app.get('/set/:setID/meta/', getMeta);

// core
app.get('/set', query);           // query sets based on provided set IDs
app.get('/set/:uid', read);    // read details of a single set and translation
app.get('/api/set', query);           // query sets based on user details and provided set IDs - /set/query instaed?
app.put('/api/term/:uid', updateCore); // update a single resrouces core node data
app.post('/api/set', create);         // create (or update, if present) a term core and single translation node.
app.delete('/api/set/:setID', deleteCore);   // delete term core node and relationships....and translations?

app.put('/god/name/:uid/:name', name);
function name(req, res){
  var cypher = "MATCH (n:translation {uid: {uid}}) set n.name={name}  return n "
   db.query(cypher, { name: req.params.name, uid: req.params.uid },function(err, result) {
     if (err) console.log(err);
     res.send(result)
   })
}
app.put('/god/order/:termID/:order/:setID', order);
function order(req, res){
  var cypher = "MATCH (n:term {uid: {termID}})-[r]-(s:synSet {uid: {setID}}) set r.order={order}  return n "
   db.query(cypher, {
     order: parseInt(req.params.order.trim()),
     termID: req.params.termID,
     setID: req.params.setID
   },function(err, result) {
     if (err) console.log(err);
     res.send(result)
   })
}
/*
████████ ███████ ██████  ███    ███
   ██    ██      ██   ██ ████  ████
   ██    █████   ██████  ██ ████ ██
   ██    ██      ██   ██ ██  ██  ██
   ██    ███████ ██   ██ ██      ██
*/
function query(req, res){

  req.query.exclude = req.query.exclude.concat(req.query.include) // don't return query terms

  //  set by number of related tagged resources
  //  var cypher = "MATCH (contentNode:resource)-[:TAGGED_WITH]->(searchSets:synSet) "
  //             + "WHERE searchSets.uid IN {searchSets} "
  //             + "WITH contentNode, COUNT(searchSets) as count "
  //             // + "WHERE count = {searchTermsCount} " // necessary to match resources with all included sets
  //             + "MATCH (set:synSet)<-[:TAGGED_WITH]-(contentNode), "
  //               + "(set:synSet)-[setR:IN_SET]-(:term)-[:HAS_TRANSLATION {languageCode: {lang} }]->(translation:translation) "
  //             + "WHERE setR.order=1 AND NOT set.uid IN {ignoreTerms} "
  //             + "RETURN distinct count(DISTINCT contentNode) AS connections, translation, set as term, set.uid AS setID "
  //             // + "ORDER BY connections DESC "
  //             // + "ORDER BY {orderby} {updown}"
  //             // + "SKIP {skip} "
  //             + "LIMIT 20";

  // sets and the groups that contain them
   var cypher = "MATCH (contentNode:resource)-[:TAGGED_WITH]->(searchSets:synSet) "
              + "WHERE searchSets.uid IN {searchSets} "
              + "WITH contentNode, COUNT(searchSets) as scount "
              + "WHERE scount = {searchTermsCount} " // necessary to match resources with all included sets
              + "MATCH (set:synSet)<-[:TAGGED_WITH]-(contentNode) " // get all sets tagged to all resources tagged that are with sets in query
              + "WITH distinct set as s1, count(DISTINCT contentNode) AS connections "
              + "MATCH (s1)-[:IN_SET]->(s2), " // get sets 'containing' related sets
                + "(s1)-[s1R:IN_SET]-(:term)-[:HAS_TRANSLATION {languageCode: {lang} }]->(s1translation:translation), " // get translation
                + "(s2)-[s2R:IN_SET]-(:term)-[:HAS_TRANSLATION {languageCode: {lang} }]->(s2translation:translation) " // get translation
              + "WHERE s1R.order=1 AND s2R.order=1 AND NOT s2.uid IN {ignoreTerms} " // only top synonym and don't include search terms
              + "WITH s2, s2translation, collect({term: s1, translation: s1translation, setID:s1.uid, connections:connections}) as contains  "
              + "RETURN COLLECT(distinct{term:s2, translation: s2translation, setID:s2.uid}) AS group, contains, size(contains) as numInGroup  "
              + "ORDER BY numInGroup DESC "
              + "LIMIT 10"
              // + "SKIP {skip} "
              // + "LIMIT {limit}";// necessary?

    var len = 0;
    if(req.query.include && req.query.include !== 'undefined'){
      len = req.query.include.length;
    } else { // maybe just don't send a get you know won't return anything...
      req.query.include =[];
    }
    db.query(cypher, {searchSets: req.query.include, ignoreTerms: req.query.exclude, searchTermsCount: len, lang: 'en' },function(err, result) {
      if (err) console.log(err);
      res.send(result)
    })
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
  // if(req.params.uid == 'undefined' && req.params.name){
  //   var uid = req.params.name; // match term on name
  //   var cypher = "MATCH (term:term)-[r:HAS_TRANSLATION]->(translation:translation) "
  //              + "WHERE LOWER(translation.name)=LOWER({uid}) "
  //              + "AND r.languageCode={languageCode} return term, translation"
  // } else {
    var uid = req.params.uid; // match term on id
    var cypher ="MATCH (set:synSet {uid:{uid}})<-[s:IN_SET]-(term:term)-[r:HAS_TRANSLATION]->(translation:translation) "
               +"WHERE r.languageCode={languageCode} return set as term, translation, set.UID as setID "
               +"ORDER BY s.order"
  // }
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
  // var cypher = "MATCH (member:member {uid: {memberID} }) "
  //            + "MATCH (term:term {uid: {term}.uid }) "
  //            + "OPTIONAL MATCH (term)-[r:HAS_REVISION]->(:edit) "
  //            + "DELETE r "
  //            + "CREATE (member)-[e:EDITED]->(revision:edit)<-[:HAS_REVISION]-(term) " // create or merge here?
  //            + "SET revision = term, e.date=TIMESTAMP() "
  //            + "MERGE (term {term}) "
  //            + "RETURN term"
  // db.query(cypher, {term: req.body.term, memberID: res.locals.user.uid },function(err, result) {
  //   if (err) console.log(err);
  //   console.log(result)
  //   if(result){
  //     res.send(result[0])
  //   } else {
  //     res.send()
  //   }
  // })
}

/**
* creates a new synSet and primary term with translation - (or updates existing - match based on provided string across all languages?)
* language code passed via member as "member.languageCode" on body, default to english
* @param {String} languageCode
* @param {String} term
* @return {Object}
*/
function create(req, res){
  var newTermID = shortid.generate()
  var newSetID = shortid.generate()
  var newTransID = shortid.generate()

  req.body.term.lower = req.body.translation.name.toLowerCase()
  var cypher = "MATCH (member:member {uid:{mid}}) "
              + "MERGE (set:synSet {lower: {set}.lower } ) "
                + "ON CREATE SET set={term}, set.created=TIMESTAMP(), set.uid={setID} "
                + "ON MATCH SET set={term}, set.updated=TIMESTAMP() "
             + "MERGE (term:term {lower: {term}.lower } ) "
               + "ON CREATE SET term={term}, term.created=TIMESTAMP(), term.uid={termID} "
               + "ON MATCH SET term={term}, term.updated=TIMESTAMP() "
             + "CREATE (translation:translation {name: {translation}.name}) "
             + "MERGE (term)-[in:IN_SET]->(set)<-[:ADDED {date:TIMESTAMP()} ]-(member)-[:ADDED {date:TIMESTAMP()} ]->(term)-[r:HAS_TRANSLATION {languageCode: {translation}.languageCode }]->(translation)<-[:ADDED {date:TIMESTAMP()} ]-(member) "
             + "ON CREATE SET in.order = 1 "
             + "RETURN term, translation, set.uid as setID"

  db.query(cypher, {
      set: req.body.term,
      setID: newSetID,
      term: req.body.term,
      termID: newTermID,
      translation: req.body.translation,
      transID: newTransID,
      mid: res.locals.user.uid
    },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}

function deleteCore(req, res){
  //TODO: check permissions
  //TODO: for production, re-lable rather than delete?
  var cypher = "MATCH (set:synSet {uid: {uid}}) "
              +"OPTIONAL MATCH (set)-[sr:IN_SET]-(terms:term)-[r:HAS_TRANSLATION]-(ttr:translation) "
              +"OPTIONAL MATCH (set)-[Ppr:HAS_PROPERTY]-(props:prop)-[ppr:HAS_TRANSLATION]-(ptr:translation) "
              + "DETACH DELETE set,terms,props,ttr,ptr "
   db.query(cypher, {uid: req.params.setID },function(err, result) {
     if (err) console.log(err);
     res.send(result)
   })
}

/*
████████ ██████   █████  ███    ██ ███████ ██       █████  ████████ ██  ██████  ███    ██
   ██    ██   ██ ██   ██ ████   ██ ██      ██      ██   ██    ██    ██ ██    ██ ████   ██
   ██    ██████  ███████ ██ ██  ██ ███████ ██      ███████    ██    ██ ██    ██ ██ ██  ██
   ██    ██   ██ ██   ██ ██  ██ ██      ██ ██      ██   ██    ██    ██ ██    ██ ██  ██ ██
   ██    ██   ██ ██   ██ ██   ████ ███████ ███████ ██   ██    ██    ██  ██████  ██   ████
*/
function readTranslation(req, res){
  var cypher = "MATCH (n:synSet {uid: {uid}})-[sr:IN_SET]-(term:term)-[r:HAS_TRANSLATION]-(translation:translation) "
             + "WHERE sr.order=1 "
             + "RETURN term, translation, n.uid as setID "
   db.query(cypher, {uid: req.params.setID },function(err, result) {
     if (err) console.log(err);
     res.send(result)
   })
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
  var cypher = "MATCH (set:synSet {uid: {set} })<-[r:IN_SET]-(syn:term)-[lang:HAS_TRANSLATION]->(translation:translation) "
             + "WHERE "
                 + "lang.languageCode IN [ {language} , 'en' ] "
                  + "RETURN DISTINCT set.uid as setID, syn as term, translation , r.order as order "
                  + "ORDER BY order"

  db.query(cypher, {set: req.params.setID, language: req.query.languageCode },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result)
    } else {
      res.send()
    }
  })
}

function updateSynonym(req, res){
  // TODO:check for member authorization...
  var cypher = "MATCH (main:synSet {uid: {setID}}), (sub:synSet {uid: {otherID}}) "
             + "SET sub:merged REMOVE sub:synSet "
             + "WITH  main, sub "
             + "MATCH (sub)<-[r:IN_SET]-(t:term) " // copy in terms
             + "WITH main, sub, t, COLLECT(r) as rels "
             + "FOREACH (rel in rels | "
                   + "MERGE (main)<-[new:IN_SET]-(t) "
                   + " SET new = rel "
              + ") "
              + "WITH main, sub "
              + "MATCH (sub)<-[r:TAGGED_WITH]-(res:resource) "// copy in resources
              + "WITH main, sub, res, COLLECT(r) as rels "
              + "FOREACH (rel in rels | "
                    + "MERGE (main)<-[new:TAGGED_WITH]-(res) "
                    + " SET new = rel "
               + ") "
               + "WITH main, sub "
               + "MATCH (sub)-[r:IN_GROUP]-(g:GROUP) "// copy in groups
               // does this work both ways?
               + "WITH main, sub, g, COLLECT(r) as rels "
               + "FOREACH (rel in rels | "
                     + "MERGE (main)-[new:IN_GROUP]-(g) "
                     + " SET new = rel "
                + ") "
                // copy props too?
                // make MERGED_WITH rel between sets?
              + "return main "

// member: res.locals.user.uid // :ADDED
  db.query(cypher, {setID: req.params.setID, otherID: req.params.otherID },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}

function deleteSynonym(req, res){
  // TODO:check for member authorization...

  // delete vs remove...
  // for remove- will need to create (or re-create) synset node?
  var cypher = "MATCH (syn:term {uid:{term}})-[r:IN_SET]->(set:synSet {uid:{set}}) "
             + "DELETE r "
             + "RETURN set, syn "

  db.query(cypher, {term: req.params.termID, set: req.params.setID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
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
  var cypher = "MATCH (trans:translation)<-[tr:HAS_TRANSLATION]-(term:term)-[r:IN_SET]->(groups:group)<-[:IN_GROUP]-(set:synSet {uid: {set} }) "
          + "WHERE "
              + "r.order=1 and tr.languageCode IN [ {language} , 'en' ] "
               + "RETURN DISTINCT groups.uid as setID, trans as translation, term"
              //  + "RETURN groups, translation,set.uid as setID"
  db.query(cypher, {set: req.params.setID, language: req.query.languageCode },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result)
    } else {
      res.send()
    }
  })
}

function updateGroup(req, res){
  // TODO:check for member authorization...
  var cypher = "MATCH (base:synSet {uid:{set}}), (g:synSet {uid:{group}}) "
             + "MERGE (base)-[r:IN_GROUP]->(g) "
             + "SET g:group, r.connectedBy = {member}, r.dateConnected = TIMESTAMP() "
             + "RETURN base.uid"

  db.query(cypher, {set: req.params.setID, group: req.params.groupID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}

function createGroup(req, res){
}

function deleteGroup(req, res){
  // TODO:check for member authorization...
  var cypher = "MATCH (set:synSet {uid:{set}})-[r:IN_GROUP]->(group:group {uid:{group}}) "
             + "DELETE r "
             + "RETURN set, group"

  db.query(cypher, {set: req.params.setID, group: req.params.groupID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}
/*
██     ██ ██ ████████ ██   ██ ██ ███    ██
██     ██ ██    ██    ██   ██ ██ ████   ██
██  █  ██ ██    ██    ███████ ██ ██ ██  ██
██ ███ ██ ██    ██    ██   ██ ██ ██  ██ ██
 ███ ███  ██    ██    ██   ██ ██ ██   ████
*/

function within(req, res){
  var cypher = "MATCH (set:synSet {uid: {set} })-[IN_SET]->(syn:synSet)<-[r:IN_SET]-(t:term)-[lang:HAS_TRANSLATION]->(translation:translation) "
             + "WHERE lang.languageCode IN [ {language} , 'en' ] AND r.order=1  "
             + "RETURN DISTINCT syn.uid as setID, syn as term, translation , r "
             + "ORDER BY  r.order"

  db.query(cypher, {set: req.params.setID, language: req.query.languageCode },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result)
    } else {
      res.send()
    }
  })
}
function updateWithin(req, res){
  // TODO:check for member authorization...
  var cypher = "MATCH (base:synSet {uid:{baseID}}) , (other:synSet {uid:{otherID}}) "
             + "MERGE (base)-[r:IN_SET]->(other) "
             + "SET r.connectedBy = {member}, r.dateConnected = TIMESTAMP() "
             + "RETURN base, other"

  db.query(cypher, {baseID: req.params.setID, otherID: req.params.otherID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}
function deleteWithin(req, res){
  // TODO:check for member authorization...
  var cypher = "MATCH (base:synSet {uid:{setID}})-[r:IN_SET]->(other:synSet {uid:{otherID}}) "
             + "DELETE r "
             + "RETURN base, other"

  db.query(cypher, {setID: req.params.setID, otherID: req.params.otherID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}
/*
 ██████  ██████  ███    ██ ████████  █████  ██ ███    ██ ███████
██      ██    ██ ████   ██    ██    ██   ██ ██ ████   ██ ██
██      ██    ██ ██ ██  ██    ██    ███████ ██ ██ ██  ██ ███████
██      ██    ██ ██  ██ ██    ██    ██   ██ ██ ██  ██ ██      ██
 ██████  ██████  ██   ████    ██    ██   ██ ██ ██   ████ ███████
*/


function contains(req, res){
  var cypher = "MATCH (set:synSet {uid: {set} })<-[:IN_SET]-(syn:synSet), "
                 + "(syn)<-[r:IN_SET]-(t:term)-[lang:HAS_TRANSLATION]->(translation:translation) "
                 + "WHERE r.order=1 AND lang.languageCode IN [ {language} , 'en' ] "
                 + "RETURN DISTINCT syn as term, syn.uid as setID, translation , r "
                 + "ORDER BY  r.order"

  db.query(cypher, {set: req.params.setID, language: req.query.languageCode },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result)
    } else {
      res.send()
    }
  })
}
function updateContains(req, res){
  // TODO:check for member authorization...
  var cypher = "MATCH (base:synSet {uid:{baseID}}) , (other:synSet {uid:{otherID}}) "
             + "MERGE (base)<-[r:IN_SET]-(other) "
             + "SET r.connectedBy = {member}, r.dateConnected = TIMESTAMP() "
             + "RETURN base as term, base.uid as setID, other"

  db.query(cypher, {baseID: req.params.setID, otherID: req.params.otherID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);

    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
}
function deleteContains(req, res){
  // TODO:check for member authorization..
  var cypher = "MATCH (base:synSet {uid:{setID}})<-[r:IN_SET]-(other:synSet {uid:{otherID}}) "
             + "DELETE r "
             + "RETURN base, other"

  db.query(cypher, {setID: req.params.setID, otherID: req.params.otherID, member: res.locals.user.uid },function(err, result) {
    if (err) console.log(err);
    if(result){
      res.send(result[0])
    } else {
      res.send()
    }
  })
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
    match: '(?i).*' + req.params.text + '.*',
    exclude: req.params.exclude || "",
  };

  var query = [
      "MATCH (set:synSet)<-[:IN_SET]-(core:term)-[r:HAS_TRANSLATION {languageCode:{code}}]->(langNode) ",
      "WHERE langNode.name =~ {match} AND NOT set.uid IN [{exclude}] ",
      // "with langNode, collect(set) as term "
      "RETURN DISTINCT set.uid AS setID, core.url AS url, set AS term, langNode AS translation LIMIT 8" // order by....?
  ].join('\n');
  //TODO:order by...
  //TODO: only return top set if query matches mutiple terms in set
  db.query(query, properties, function (err, matches) {
      if (err) {console.log(err);}
      res.send(matches);
  });

}



// get most commonly tagged terms
// TODO: skip/limit - language - disregard/include synonyms? - Terms most tagged to other terms?
function most(req,res){
  var cypher = "MATCH (term:term)<-[:TAGGED_WITH]-(resource:resource) "
             + "RETURN term.english, COUNT(resource) AS score "
             + "ORDER BY score DESC limit 10"
  db.query(cypher, {languageCode: req.query.languageCode || 'en'},function(err, result) {
    if (err) console.log(err);
      res.send(result) // resource not found
    })
  }


/*

88888b.  888d888 .d88b.  88888b.  .d8888b
888 "88b 888P"  d88""88b 888 "88b 88K
888  888 888    888  888 888  888 "Y8888b.
888 d88P 888    Y88..88P 888 d88P      X88
88888P"  888     "Y88P"  88888P"   88888P'
888                      888
888                      888
888                      888
*/
  function getProps(req,res){ // TODO: re-write... getIcon getDefinition
    var cypher = "MATCH (s:synSet {uid: {setID} })-[sr:HAS_PROPERTY]->(p:prop)-[tr:HAS_TRANSLATION]->(t:translation) "
               + "WHERE tr.languageCode = {languageCode} "
               + "RETURN sr.type AS type, p AS property, t AS translation "
               + "ORDER BY sr.order "
    db.query(cypher, {setID: req.params.setID, languageCode: req.query.languageCode || 'en'},function(err, result) {
      if (err) console.log(err);
      res.send(result)
    })
  }
   function getMeta(req,res){
      // var cypher = "MATCH (s:synSet {uid: {setID} })-[sr:HAS_PROPERTY]->(p:prop)-[tr:HAS_TRANSLATION]->(t:translation) "
      //            + "WHERE tr.languageCode = {languageCode} "
      //            + "RETURN sr.type AS type, p AS property, t AS translation "
      //            + "ORDER BY sr.order "
      var cypher= "MATCH (s:synSet {uid: {setID} })-[mr:HAS_META {type:{rtype}}]-(re:resource) "
      + "OPTIONAL MATCH (re)-[p:HAS_PROPERTY]->(prop:prop)-[plang:HAS_TRANSLATION ]->(ptrans:translation) "
      + "WHERE p.order=1 AND plang.languageCode IN [ {languageCode} , 'en' ] "
      + "RETURN re AS resource, mr.order AS order, "
        + "collect(DISTINCT {type: prop.type, value: ptrans.value}) AS properties "
      + "ORDER BY order "
      db.query(cypher, {setID: req.params.setID, rtype:req.query.type, languageCode: req.query.languageCode || 'en'},function(err, result) {
        if (err) console.log(err);
        // massage result for front end (collapse props onto core)...there's probably an alternative to iterating through all resources. Different schemea? Different query?
        for(rindex in result){
          for(pindex in result[rindex].properties){
            result[rindex].resource[result[rindex].properties[pindex].type] = result[rindex].properties[pindex].value;
          }
          delete result[rindex].properties // no need to send redundant data
          delete result[rindex].order
        }

        res.send(result)
      })
    }

  function tagMeta(req,res){ //NOTE: untested.

    var cypher = "MATCH (set:synSet {uid:{set}}) , (meta:resource {uid:{meta}}) "
               + "MERGE (set)-[r:HAS_META {type:{type}}]->(meta) "
               + "SET r.connectedBy = {member}, r.dateConnected = TIMESTAMP(), r.order=0 "
               + "RETURN set, meta"

    db.query(cypher, {set: req.params.sID, type: req.body.type, meta: req.params.mID, member: res.locals.user.uid },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }

} // end module
