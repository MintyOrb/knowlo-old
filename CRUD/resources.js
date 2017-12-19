module.exports = function(app, db){
  var shortid = require('shortid');
  var async = require('async');

  // resource routes
  app.get('/resource', query);                         // generic public query resources based on provided term IDs
  app.get('/api/resource', memberQuery);               // query resources based on user details and provided term IDs
  app.get('/resource/count', count);                   // query number of resources related to terms
  app.get('/api/resource/count', memberCount);         // query number of resources related to terms; return number seen by member;  based on user details and provided term IDs

  app.get('/resource/random', random);                 // send back id for random resource, tagged with provided tokens
  // app.get('/api/resource/random', memberRandom);             // send back id for random resource, tagged with provided tokens. Option for only unseen.

  app.get('/resource/:uid/full', readFull);            // read full details of a single resource (tagged terms and translation by language code)
  app.put('/api/resource/:uid/full', updateFull);      // update full details of a single resource (tagged terms and translation by language code)
  app.post('/api/resource/:uid/full', createFull);     // create full details of a single resource (tagged terms and translation by language code)

  app.get('/resource/:uid', readCore);                 // read details of a single resource core
  app.put('/api/resource/:uid', updateCore);           // update a single resource core node data
  app.post('/api/resource', createCore);               // create (or update, if present) a resource core node.
  app.delete('/api/resource/:uid/full', deleteFull);   // delete resource core node and relationships....and translations?

  app.get('/resource/:ruid/translation/', readTranslation);         // retrieve a translation of a resource based on resource id and provided langauge code. If language not found, attempt a translation. Also returns resource core
  app.put('/api/resource/:ruid/translation/:uid', updateTranslation);    // update single resoruce translation by ID | is /resource/:ruid superfluous? /resourceMeta/:uid instead?
  app.post('/api/resource/:ruid/translation/', createTranslation);      // create resource translation based on language code and connect to resource. Return resrouce core and new translation
  app.delete('/api/resource/:ruid/translation/:uid', deleteTranslation); // delete resource translation by id | delete node or just relatinship??

  app.get('/resource/:rUID/set/', readSets);               // retrieve a resources tagged sets
  app.put('/api/resource/:rUID/set/', updateSets);         // batch add sets to resource (with ids) - adds provided tags, doesn't remove relationships
  app.post('/api/resource/:rUID/set/', batchSetSets);      // batch set sets to resource (with ids) - delete all tags relationships and create for  tags provided
  app.put('/api/resource/:rUID/set/:sUID', addSet);         // add a single set to a resources by id
  app.delete('/api/resource/:rUID/set/:sUID', deleteSet);   // remove a single set relationship from a resources | DELETE /term/:uid to delete term node itself

  app.get('/resource/:ruid/discussion/', getDiscussion); // rename to meta???? add term/:tuid/meta
  app.put('/api/resource/:rUID/discussion/:dUID', tagDiscussion);

  app.put('/api/resource/:rID/vote', castVote);
  app.put('/api/resource/:rUID/termSuggest', suggestedTerms);

  app.get('/resource/:rUID/related/', getRelated);

  app.put('/api/resource/:rUID/viewed', viewed);




  function query(req, res){
    /**
    * searches for resources based on provide term IDs
    * language code passed in as "languageCode" by query, default to english
    * @param {Array} query // terms with status (include/exclude)
    * @param {Array} excludedSets //uid
    * @param {String} languageCode
    * @return {Object} resource
    */
    if(req.query.limit > 50){
      req.query.limit = 50;
    }
    var cypher = "MATCH (re:resource)-[:TAGGED_WITH]->(b:synSet)-[:IN_SET*0..3]->(synSet:synSet) "
           + "WITH distinct re, collect(synSet.uid) AS parentTags "
           + "WHERE all(tag IN {includedSets} WHERE tag IN parentTags) "              //  + "NOT synSet.uid IN {excludedSets} " // this doesn't work...
           + "MATCH (re)-[:TAGGED_WITH]->(synSet:synSet)<-[synR:IN_SET]-(syn:term)-[tlang:HAS_TRANSLATION]->(tlangNode:translation) "
           + "WHERE "
               + "synR.order=1 "
               + "AND tlang.languageCode IN [ {language} , 'en' ] "
           + "WITH synSet, tlangNode, tlang, re "//collect(distinct synSet.setID) AS blah, filter(x IN re)"//filter(x IN collect(distinct{re:re,synSets:sets}) WHERE x.re.setID NOT IN {excludedSets}) as ree "
           + "OPTIONAL MATCH (:member)-[gVote:CAST_VOTE]->(re) " // get global rankings
             + "WITH synSet, tlangNode, tlang, re, AVG(gVote.quality) AS gq, AVG(gVote.complexity) AS gc, COUNT(gVote) AS votes "
           + "OPTIONAL MATCH (re)-[p:HAS_PROPERTY]->(prop:prop)-[plang:HAS_TRANSLATION ]->(ptrans:translation) "
           + "WHERE p.order=1 AND plang.languageCode IN [ {language} , 'en' ] "
           + "RETURN "
             + "collect(DISTINCT {term: synSet.uid, url: synSet.url, translation: {name: tlangNode.name, languageCode: tlang.languageCode } } ) AS terms, "
             + "collect(DISTINCT {type: prop.type, value: ptrans.value}) AS properties, "
             + "collect(DISTINCT synSet.uid) AS termIDs, " // for filtering into suggestion group...no longer used?
             + "{quality: gq , complexity: gc } AS globalVote, "
             + "votes, "
             + "re AS resource "
           // + "ORDER BY {orderby} {updown}"
           if(parseInt(req.query.skip) > 0){
             cypher += "SKIP {skip} ";
           }
           cypher += "LIMIT {limit}";
           
         if (typeof req.query.include === "undefined") {
             req.query.include = [];
         }
         if (typeof req.query.exclude === "undefined") {
             req.query.exclude = [];
         }
        db.query(cypher, {
            includedSets: req.query.include || [],
            excludedSets: req.query.exclude || [],
            orderby: req.orderby,
            updown: req.updown,
            skip: parseInt(req.query.skip),
            limit: parseInt(req.query.limit), // TODO: change for mobile...based on display setting
            language: 'en'
        }, function(err, result) {
      if (err) {console.log(err);res.status(500).send()};
        // massage result for front end (collapse props onto core)...there's probably an alternative to iterating through all resources. Different schemea? Different query?
        for(rindex in result){
          for(pindex in result[rindex].properties){
            result[rindex].resource[result[rindex].properties[pindex].type] = result[rindex].properties[pindex].value;
          }
          delete result[rindex].properties // no need to send redundant data
        }
        res.send(result)
      })
  }

  function memberQuery(req, res){
    /**
    * searches for resources based on provide term IDs
    * language code passed in as "languageCode" by query, default to english
    * @param {Array} query // terms with status (include/exclude)
    * @param {Array} excludedSets //uid
    * @param {String} languageCode
    * @return {Object} resource
    */
    if(req.query.limit > 50){
      req.query.limit = 50;
    }
    var cypher = "MATCH (re:resource)-[:TAGGED_WITH]->(b:synSet)-[:IN_SET*0..3]->(synSet:synSet) "
           + "WITH distinct re, collect(synSet.uid) AS parentTags "
           +"WHERE all(tag IN {includedSets} WHERE tag IN parentTags) "
          //  + " AND NOT synSet.uid IN {excludedSets} " // this doesn't work...
           if(req.query.showViewed === 'false'){
             cypher += "AND NOT ((:member {uid:{mID}})-[:VIEWED]->(re)) "
           }
           cypher += "MATCH (re)-[:TAGGED_WITH]->(synSet:synSet)<-[synR:IN_SET]-(syn:term)-[tlang:HAS_TRANSLATION]->(tlangNode:translation) "
           + "WHERE "
               + "synR.order=1 "
               + "AND tlang.languageCode IN [ {language} , 'en' ] "
               + "AND NOT synSet.uid IN {excludedSets} "
             + "WITH synSet, tlangNode, tlang, re "//collect(distinct synSet.setID) AS blah, filter(x IN re)"//filter(x IN collect(distinct{re:re,synSets:sets}) WHERE x.re.setID NOT IN {excludedSets}) as ree "
           + "OPTIONAL MATCH (mem:member {uid:{mID}})-[mVote:CAST_VOTE]->(re) " // get member rankings
             + "WITH mVote, synSet, tlangNode, tlang, re "
           + "OPTIONAL MATCH (:member)-[gVote:CAST_VOTE]->(re) " // get global rankings
             + "WITH mVote, synSet, tlangNode, tlang, re, AVG(gVote.quality) AS gq, AVG(gVote.complexity) AS gc, COUNT(gVote) AS votes "
           + "OPTIONAL MATCH (re)-[p:HAS_PROPERTY]->(prop:prop)-[plang:HAS_TRANSLATION ]->(ptrans:translation) "
           + "WHERE p.order=1 AND plang.languageCode IN [ {language} , 'en' ] "
           + "RETURN "
             + "collect(DISTINCT {term: synSet.uid, url: synSet.url, translation: {name: tlangNode.name, languageCode: tlang.languageCode } } ) AS terms, "
             + "collect(DISTINCT {type: prop.type, value: ptrans.value}) AS properties, "
             + "collect(DISTINCT synSet.uid) AS termIDs, " // for filtering into suggestion group...no longer used?
             + "{quality: mVote.quality, complexity: mVote.complexity} AS memberVote, "
             + "{quality: gq , complexity: gc } AS globalVote, "
             + "votes, "
            + "re AS resource "
            // + "ORDER BY globalVote.quality IS NOT NULL DESC, globalVote.quality DESC  "
            + "ORDER BY COALESCE(globalVote.quality, -1) DESC ";//IS NOT NULL DESC, globalVote.quality DESC  "
           // order by can't be parameterized...have to resort to string building
           //TODO support order by options:
          //  # votes
          //  global quality
          //  global complexity
          //  date created
            // discussion size?
         if(parseInt(req.query.skip) > 0){
           cypher += "SKIP {skip} ";
         }
           cypher += "LIMIT {limit}";
         if (typeof req.query.include === "undefined") {
             req.query.include = [];
         }
         if (typeof req.query.exclude === "undefined") {
             req.query.exclude = [];
         }
        db.query(cypher, {
            mID: res.locals.user.uid,
            includedSets: req.query.include,
            excludedSets: req.query.exclude,
            orderby: req.orderby,
            updown: req.updown,
            skip: parseInt(req.query.skip),
            limit: parseInt(req.query.limit), // TODO: change for mobile...based on display setting
            language: 'en'
        }, function(err, result) {
      if (err) {console.log(err);res.status(500).send()};
        // massage result for front end (collapse props onto core)...there's probably an alternative to iterating through all resources. Different schemea? Different query?
        for(rindex in result){
          for(pindex in result[rindex].properties){
            result[rindex].resource[result[rindex].properties[pindex].type] = result[rindex].properties[pindex].value;
          }
          delete result[rindex].properties // no need to send redundant data
        }
        res.send(result)
      })
  }

  function memberCount(req, res){

    var cypher = "MATCH (re:resource)-[:TAGGED_WITH]->(b:synSet)-[:IN_SET*0..3]->(synSet:synSet) "
           + "WITH distinct re, collect(synSet.uid) AS parentTags "
           + "WHERE all(tag IN {includedSets} WHERE tag IN parentTags) "
           + "WITH collect(re.uid) as ids, count(re) as relatedResources  "
           + "OPTIONAL MATCH (:member {uid:{mID}})-[v:VIEWED]->(re) "
           + "WHERE re.uid in ids "
           + "RETURN relatedResources, count(v) as viewedResources "

         if (typeof req.query.include === "undefined") {
             req.query.include = [];
         }

        db.query(cypher, {
            mID: res.locals.user.uid,
            includedSets: req.query.include,
        }, function(err, result) {
      if (err) {console.log(err);res.status(500).send()};
        res.send(result[0])
      })
  }

  function count(req, res){
    var cypher = "MATCH (re:resource)-[:TAGGED_WITH]->(b:synSet)-[:IN_SET*0..3]->(synSet:synSet) "
           + "WITH distinct re, collect(synSet.uid) AS parentTags "
           + "WHERE all(tag IN {includedSets} WHERE tag IN parentTags) "
           + "RETURN count(re) as relatedResources"

         if (typeof req.query.include === "undefined") {
             req.query.include = [];
         }

        db.query(cypher, {
            includedSets: req.query.include,
        }, function(err, result) {
      if (err) {console.log(err);res.status(500).send()};
        res.send(result[0])
      })
  }

  function readCore(req, res){
  }
  function updateCore(req,res){
  }
  function createCore(req, res){
    req.body.resource.core.uid = shortid.generate();
    req.body.resource.viewCount = 0;

    // remove blank props
    for (thing in req.body.resource.detail) {
      if(req.body.resource.detail[thing].length == 0){
        delete req.body.resource.detail[thing]
      }
    }
    var detailIDs = [];
    for (var i = 0; i < Object.keys(req.body.resource.detail).length; i++) {
      detailIDs.push(shortid.generate());
    }

     var cypher = "CREATE (resource:resource:tester {core}) SET resource.dateAdded = TIMESTAMP() "
                + "WITH resource "
                + "MATCH (mem:member {uid:{muid}}) "
                + "MERGE (resource)<-[:ADDED {date: TIMESTAMP()}]-(mem) "
                + "WITH resource, {detail} AS detail, {detailIDs} as dIDs, keys({detail}) AS keys "
                + "FOREACH (index IN range(0, size(keys)-1) | "
                  + "MERGE (resource)-[r:HAS_PROPERTY {order: 1, type: keys[index] }]->(prop:prop:tester {type: keys[index], uid: dIDs[index] })-[tr:HAS_TRANSLATION {languageCode: 'en'}]->(langNode:tester:translation {value: detail[keys[index]] } ) "
                + ") "
                + "RETURN resource"
    //TODO add languagecode for real.
    db.query(cypher, {
        url: req.body.resource.url,
        core: req.body.resource.core,
        detail: req.body.resource.detail,
        detailIDs: detailIDs,
        muid: res.locals.user.uid
      },function(err, resource) {
      if (err) {console.log(err); res.status(500).send()};
      res.send(resource[0])

    })
  }

  function deleteFull(req,res){
    // just remove label instead?
    // delete votes?
    var cypher = "MATCH (re:resource {uid:{uid}})  "
      + "OPTIONAL MATCH (re)-[:HAS_PROPERTY]-(p:prop)-[:HAS_TRANSLATION]-(t:translation) "
      + "DETACH DELETE re, p, t "

   db.query(cypher, {
      uid: req.params.uid
    },function(err, result) {
     if (err) {console.log(err); res.status(500).send()};
     res.send(result)
   })
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
  function addSet(req,res){
    // TODO:check for member authorization...
    var cypher = "MATCH (resource:resource {uid:{resource}}) , (set:synSet {uid:{set}}) "
               + "MERGE (resource)-[r:TAGGED_WITH]->(set) "
               + "SET r.connectedBy = {member}, r.dateConnected = TIMESTAMP() "
               + "WITH set "
               + "MATCH (set)-[sr:IN_SET]-(term:term)-[lang:HAS_TRANSLATION]-(translation:translation)"
               + "WHERE sr.order=1 AND lang.languageCode IN [ 'en' ] " // TODO: need to take user language
               + "RETURN set as term, translation, set.uid as setID "

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

    var cypher = "MATCH (resource:resource {uid:{uid}}) "
               + "WITH resource "
               + "OPTIONAL MATCH (resource)-[TAGGED_WITH]->(set:synSet)<-[setR:IN_SET]-(t:term)-[r:HAS_TRANSLATION]->(tr:translation) "
               + "WHERE r.languageCode = {languageCode} AND setR.order=1 "
               + "OPTIONAL MATCH (resource)-[p:HAS_PROPERTY]->(prop:prop)-[plang:HAS_TRANSLATION ]->(ptrans:translation) "
               + "WHERE p.order=1 AND plang.languageCode IN [ {languageCode} , 'en' ] "
               + "WITH resource, "
               + "COLLECT(DISTINCT { setID: set.uid, term: set, translation: tr}) as terms, "
               + "COLLECT(DISTINCT {type: prop.type, value: ptrans.value}) AS properties "
               + "RETURN resource, terms, properties"

    db.query(cypher, {uid: req.params.uid, languageCode: req.query.languageCode || 'en'},function(err, result) {
      if (err) {console.log(err); res.status(500).send()};
      if(result){
        result = result[0]
        // massage result for front end (put props  on resource core)
        if(result && result.properties){
          for(pindex in result.properties){
            result.resource[result.properties[pindex].type] = result.properties[pindex].value;
          }
          delete result.properties // no need to send redundant data
        }
        res.send(result)
      } else {
        res.status(404).send() // resource not found
      }
    })
  }

  function updateFull(req, res){
  }
  function createFull(req, res){
  }

  /*
                         888
                         888
                         888
  88888b.d88b.   .d88b.  888888  8888b.
  888 "888 "88b d8P  Y8b 888        "88b
  888  888  888 88888888 888    .d888888
  888  888  888 Y8b.     Y88b.  888  888
  888  888  888  "Y8888   "Y888 "Y888888
  */

  function getDiscussion(req, res){
    var cypher = "MATCH (re:resource {uid:{uid}}) "
               + "OPTIONAL MATCH (re)-[TAGGED_WITH]->(discussion:resource)-[p:HAS_PROPERTY]->(prop:prop)-[plang:HAS_TRANSLATION ]->(ptrans:translation) "
               + "WHERE p.order=1 AND plang.languageCode IN [ {languageCode} , 'en' ] "
               + "WITH discussion, collect(DISTINCT {type: prop.type, value: ptrans.value}) AS properties "
               + "OPTIONAL MATCH (discussion)-[:TAGGED_WITH]->(set:synSet) " // get sets for discussion filter
               + "RETURN discussion as resource, "
               + "collect(DISTINCT set.uid) AS setIDs, "
               + "properties "
               // + "ORDER BY {orderby} {updown}"
              //  + "SKIP {skip} "
              //  + "LIMIT {limit}";

    db.query(cypher, {uid: req.params.ruid, languageCode: req.query.languageCode || 'en'},function(err, result) {
      if (err) {console.log(err); res.status(500).send()};
      if(result[0] && result[0].resource!=null){
        // massage result for front end (put props  on resource core)
        for(rindex in result){
          for(pindex in result[rindex].properties){
            result[rindex].resource[result[rindex].properties[pindex].type] = result[rindex].properties[pindex].value;
          }
          delete result[rindex].properties // no need to send redundant data
        }
        res.send(result)
      } else {
        res.send() // resource not found
      }
    })
  }
  function tagDiscussion(req,res){
    var cypher = "MATCH (resource:resource {uid:{resource}}) , (discussion:resource {uid:{dis}}) "
               + "MERGE (resource)-[r:TAGGED_WITH]->(discussion) "
               + "SET r.connectedBy = {member}, r.dateConnected = TIMESTAMP() "
               + "RETURN resource, discussion"

    db.query(cypher, {resource: req.params.rUID, dis: req.params.dUID, member: res.locals.user.uid },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }

  function getRelated(req,res){
    var cypher = "MATCH (main:resource {uid:{resource}})-[:TAGGED_WITH]->(mainSets:synSet) "
        + "WITH main.uid as mainID, collect(distinct mainSets.uid) as mainSetIDs "
        + "MATCH (other:resource)-[:TAGGED_WITH]->(otherSet:synSet) "
          + "WHERE otherSet.uid IN mainSetIDs AND NOT other.uid = mainID "
        + "WITH other, count(*) AS connected "
        + "OPTIONAL MATCH (:member)-[gVote:CAST_VOTE]->(other) " // get global rankings
          + "WITH connected, other, AVG(gVote.quality) AS gq, AVG(gVote.complexity) AS gc, COUNT(distinct gVote) AS votes "
        + "OPTIONAL MATCH (other)-[p:HAS_PROPERTY]->(prop:prop)-[plang:HAS_TRANSLATION ]->(ptrans:translation) "
        + "WHERE p.order=1 AND plang.languageCode IN [ {language} , 'en' ] "
        + "RETURN "
          // + "collect(DISTINCT {term: synSet.uid, url: synSet.url, translation: {name: tlangNode.name, languageCode: tlang.languageCode } } ) AS terms, " //will need to do the optional match if terms needed...
          + "collect(DISTINCT {type: prop.type, value: ptrans.value}) AS properties, "
          + "{quality: gq , complexity: gc } AS globalVote, "
          + "votes, "
          + "other AS resource, connected "
        + "ORDER BY connected DESC "
        + "LIMIT 10" // should do param...
    db.query(cypher, {resource: req.params.rUID, language: 'en' },function(err, result) {
      if (err) console.log(err);
      for(rindex in result){
        for(pindex in result[rindex].properties){
          result[rindex].resource[result[rindex].properties[pindex].type] = result[rindex].properties[pindex].value;
        }
        delete result[rindex].properties // no need to send redundant data
      }
      if(result){
        res.send(result)
      } else {
        res.send()
      }
    })
  }

  /*
                    888
                    888
                    888
  888  888  .d88b.  888888 .d88b.
  888  888 d88""88b 888   d8P  Y8b
  Y88  88P 888  888 888   88888888
   Y8bd8P  Y88..88P Y88b. Y8b.
    Y88P    "Y88P"   "Y888 "Y8888
  */
  function castVote(req,res){
    var cypher = "MATCH (re:resource {uid:{rID}}) , (mem:member {uid:{mID}}) "
               + "MERGE (mem)-[r:CAST_VOTE]->(re) "
               + "SET "
                 + "r.quality={quality}, "
                 + "r.complexity={complexity} "
               + "WITH re "
               + "OPTIONAL MATCH (:member)-[gVote:CAST_VOTE]->(re) " // get global rankings
                 + "WITH  AVG(gVote.quality) AS gq, AVG(gVote.complexity) AS gc, COUNT(gVote) AS votes "
               + "RETURN {quality: gq , complexity: gc } AS globalVote, votes "

    // TODO: should probably have some prop validation for vote (val between 0->1)
    db.query(cypher, {
      rID: req.params.rID,
      quality: req.body.vote.quality,
      complexity: req.body.vote.complexity,
      mID: res.locals.user.uid
    },function(err, result) {
      if (err) console.log(err);
      if(result){
        res.send(result[0])
      } else {
        res.send()
      }
    })
  }

  function suggestedTerms(req, res){ // finds and tags terms to resource based on provided text - returns terms tagged
    var blob = req.body.text;
      var tokens =[]
      var nospecial = blob.replace(/[^a-zA-Z0-9 ]/g, "");
      var split = nospecial.split(' ')
      var stop = ["undefined","a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the"];
      var split = split.filter(function(word){
        return stop.indexOf(word) == -1
      })

      for (var i = 0; i < split.length; i++) { // create one and two word tokens from text
        tokens.push(split[i].toLowerCase().trim())
        tokens.push((split[i]+" "+split[i + 1]).toLowerCase().trim())
      }
      let uniqueTokens = Array.from(new Set(tokens)); // remove duplicates
      async.concat(uniqueTokens, function(token, callback) {
        tagResource(req.params.rUID, token, function(err, result){
            if(err){console.log(err)}
            callback(null,result)
        })
      }, function(err, taggedTerms) {
        if(err){console.log(err)}
        res.send(taggedTerms)
      });

  }
  function tagResource(uid, snip, callback){
    var cypher = "MATCH (t:term)-[:IN_SET]->(set:synSet), (res:resource {uid:{ruid}}) "
               + "WHERE t.lower = {snip} "
               + "WITH set,res "
               + "MATCH (translation:translation)<-[lang:HAS_TRANSLATION]-(term:term)-[r:IN_SET]->(set) "
               + "WHERE lang.languageCode IN [ {language} , 'en' ] AND r.order=1 "
               + "WITH set, res, translation "
               + "MERGE (set)<-[rel:TAGGED_WITH]-(res) "
               + "RETURN DISTINCT set.uid as setID, set as term, translation "
    //
    db.query(cypher, {ruid: uid, snip: snip, language: 'en' },function(err, result) {
      if (err) console.log(err);
      callback(null,result)
    })
  }


  function viewed(req, res){
    var cypher = "MATCH (m:member {uid:{mUID}}), (res:resource {uid:{rUID}}) "
               + "SET res.viewCount = res.viewCount + 1 "
               + "MERGE (m)-[v:VIEWED]->(res) "
               + "ON CREATE SET v.firstViewed=TIMESTAMP(), v.lastViewed=TIMESTAMP(), v.viewCount=1 " // add first/last viwed date, set viewcount=0
               + "ON MATCH SET v.lastViewed=TIMESTAMP(), v.viewCount=v.viewCount+1 "  // update last viwed, viewcount = vc+1
               + "RETURN v "

    db.query(cypher, {rUID: req.params.rUID, mUID: res.locals.user.uid },function(err, result) {
      if (err) console.log(err);
      res.send(result)
    })
  }

  function random(req, res){
    var cypher = "MATCH (re:resource)-[:TAGGED_WITH]->(:synSet) "
               + "RETURN re.uid as uid, rand() as r "
               + "ORDER BY r "
               + "limit 1"

    db.query(cypher, {},function(err, result) {
      if (err) console.log(err);
      res.send(result[0])
    })
  }

} // end module
