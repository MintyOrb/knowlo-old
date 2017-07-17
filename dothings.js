module.exports = function(app, db) {
    var shortid = require('shortid');
    var async = require('async');
    const util = require('util')


    // the functions to run (uncomment)
    // addVideosToDB()
    // fixWeirdTerms();
    // putTermsInSets();

    function putTermsInSets(){
      // create synstes in db based on quering existing terms

      var wordNet = require( 'wordnet-magic' );
      const util = require('util')
      var wn = wordNet("./wordnet.db", false);
      var db = require("seraph")({
        server: "http://localhost:7474",
        user: 'neo4j',
        pass: 'admin'
      });
      var shortid = require('shortid');
      var async = require('async')
      require('./terms')

      async.eachSeries(terms['data'], function(term, callback) {
        var set = new wn.Word(term['row'][0]['lower']);

        // look for set based on term
        set.getSynsets( function( err, synset ) {
          if(err){console.log(err)};

        	if(synset.length>0){ // if set found
            // look for existing set, add if not found
            findOrAddSet(synset[0], function(setUID){
              console.log('set should exist with all terms')
              // console.log('termid: ',termUID)
              console.log('setid: ',setUID)
              console.log('termid: ',term['row'][0]['uid'])

              // now set exists and has all syns in it
              // add term's tagged resources to set
                var cypher = "MATCH (set:termSet {uid: {setID} }) MATCH (term:term {uid: {termID} })<-[:TAGGED_WITH]-(resource:resource) "
                           + "MERGE (set)<-[:TAGGED_WITH]-(resource) "
                           + "return set"
                db.query(cypher, {setID: setUID, termID: term['row'][0]['uid'] },function(err, result) {
                  if (err) console.log(err);
                  console.log("back from merge term resources - set  ")
                  // console.log(result)
                  callback()
                })
            });

          }else{ // will have to find and add to a set manually...
              console.log('will have to find and add to a set manually... ', term)
              callback()
          }

        });

      }, function(err) {
          // if any of the file processing produced an error, err would equal that error
          if( err ) {
            // One of the iterations produced an error.
            // All processing will now stop.
            console.log('A term failed to process');
          } else {
            console.log('All terms have been processed successfully');
          }
      });

      // return uid if found, false otherwise
      function findOrAddSet(set, callback) {
        console.log(set['synsetid'])
        var cypher = "MATCH (set:termSet {synsetid:{setID}}) return set.uid as uid"
        db.query(cypher, {setID: set['synsetid'] },function(err, result) {
      		if (err) console.log(err);
          console.log(result)
      		if(result.length>0){
            console.log('truth - found set: ',result[0].uid)
            callback(result[0].uid)
      		} else {
            console.log('resut falsy')
            createSet(set, function(uid){
              console.log('uid: ',uid)
              addTermsToSet(set['words'],uid,callback)
            })
      		}
      	})
      }

      function createSet(set, callback){
        var props = {
          synsetid: set.synsetid,
          pos: set.pos,
          lexdomain: set.lexdomain,
          uid: shortid.generate(),
          english: set['words'][0]['lemma']
        }
        var def = set.definition;
        console.log('in createSet')

        // should these be rel or prop values? putting on both for now...
        // may need to go back and delete words and def from set...
        var cypher = "CREATE (set:termSet {set}) "
                   + "CREATE (set)-[pr:HAS_PROPERTY {type:'definition', order:'1'}]->(p:prop {type:'definition', order:'1'})-[tr:HAS_TRANSLATION {languageCode: 'en'}]->(t:translation { text: {def} , languageCode: 'en' })"
                   + " return set.uid as uid"
        db.query(cypher, {set: props, def: def },function(err, id) {
      		if (err) console.log(err);
          console.log('created set: ',id[0].uid)
          callback(id[0].uid)
      	})
      }
      function addTermsToSet(terms,setID, callback){ // locate or add term, add to set
        console.log('terms:')
        console.log(terms)
        async.eachSeries(terms, function(termFromNet, callback) {
          console.log("net term: ",termFromNet)
          var term ={
            uid: shortid.generate(),
            english: termFromNet.lemma,
            lower: termFromNet.lemma.toLowerCase()
          }

        	var translation = {
            uid: shortid.generate(),
            name: termFromNet.lemma,
            languageCode: 'en'
          }

        	var cypher = "MATCH (set:termSet {uid: {setid} }) "
                       + "MERGE (term:term {lower: {term}.lower }) "
        							 + "ON CREATE SET term={term}, term.created=TIMESTAMP(), term.lower=LOWER({term}.english) "
        							//  + "ON MATCH SET term.updated=TIMESTAMP() "
        						 + "MERGE (translation:translation {name: {translation}.name}) "
        							 + "ON CREATE SET translation={translation}, translation.created=TIMESTAMP() "
        							//  + "ON MATCH SET translation={translation}, translation.updated=TIMESTAMP() "
                      +"MERGE (term)-[r:HAS_TRANSLATION {languageCode: {translation}.languageCode }]->(translation) "
        						 + "MERGE (set)<-[:IN_SET]-(term) "
        						 + "RETURN distinct term.uid as term, set.uid as set"

        	db.query(cypher, {term: term, translation: translation, setid: setID },function(err, result) {
        		if (err) console.log(err);
            console.log('back from merge/add term to set')
            console.log(result)
            callback()
        	})

        }, function(err) {
            // if any of the file processing produced an error, err would equal that error
            if( err ) {
              // One of the iterations produced an error.
              // All processing will now stop.
              console.log('A term failed to process....but not really');
              console.log(err);
              // callback(result[0].term,result[0].set)
            } else {
              console.log('All terms have been processed successfully ',setID);
              callback(setID)
            }
        });

      }
    }

    function addVideosToDB() {
        require('./knowloyoutubecombined')
        async.eachSeries(cvideos, function(video, vidcallback) { // for each new video

            async.waterfall([
                function(w1callback) { // add resource

                    // generate id
                    // set url
                    // set embed type....(and the other stuff)
                    // add to db

                    var core = {
                        "uid": shortid.generate(), //	r19-o6NyW
                        "displayType": "embed", //	image
                        // "fileSystemID": "",           //	272e3c40-a6c0-11e3-851c-df6ab425dbd1
                        // "webURL": "",           //	(empty)
                        // "savedAs": "",            //	_en_272e3c40-a6c0-11e3-851c-df6ab425dbd1.jpg
                        // "id": "",           //	35320
                        // "UUID": "",           //	2e78bf08-a34a-449c-9843-5fdcfa8d2945
                        // "embedSrc": "",           //	(empty)
                        "dateAdded": Date.now(), //	time in ms since.... // 2014-03-08T12:57:10.031Z
                        "languageAddedIn": "en", //	en
                        // fileds from youtube....
                        // "dates": [],
                        // "tags": [],
                        // "size": ["atoms", "molecules"],
                        // "time": ["New Chemical Elements"],
                        // "teaches": ["chemical bonds","atomic structure","energy","covalent bonds","ionic bonds","periodic table", "hydrogen bonds", "electronegativity"],
                        // "is": ["video","Cassiopeia Project"],
                        // "discipline": ["Chemistry"],
                        "username": video.username, // "cassiopeiaproject",
                        "rating": video.rating, // 4.86246395111,
                        "viewcount": video.viewcount, // 96761,
                        "author": video.author, // "cassiopeiaproject",
                        "url": video.url, // "https://www.youtube.com/watch?v=hEFeLYWTKX0",
                        "dislikes": video.dislikes, // 12,
                        "bigthumb": video.bigthumb, // "",
                        "videoid": video.videoid, // "hEFeLYWTKX0",
                        "length": video.length, // 438,
                        "likes": video.likes, // 337,
                        "duration": video.duration, // "00:07:18",
                        "thumb": video.thumb, // "http://i.ytimg.com/vi/hEFeLYWTKX0/default.jpg"
                    };
                    var translation = {
                        "uid": shortid.generate(),
                        "description": video.description, // "Find out more about Chemical Bonds!",
                        "title": video.title, // "Chemical Bonds",
                        "languageCode": 'en',
                        // "keywords": video.keywords, // ["Chemistry", "chemical", "bond", "periodic", "table", "element", "atom", "molecule", "electron", "proton", "polar", "covalent", "orbital", "energy", "electronegat"],
                    }
                    var cypher = "CREATE (n:resource {core})-[:HAS_TRANSLATION {languageCode:'en'}]->(tr:translation {translation}) RETURN n.uid";
                    db.query(cypher, {
                        core: core,
                        translation: translation
                    }, function(err, results) {
                        if (err) {
                            console.log(util.inspect(err, null, 4));
                        }
                        console.log('back from video add')
                        w1callback(null, results);
                    });

                },
                function(passed, w2callback) { // add/merge terms and tag to resource
                    var videoID = passed[0]["n.uid"]
                    console.log("videoId :", videoID)

                    // passed should have resource uid
                    // add channel as term (if not already)
                    // add customs terms (if any)   // add keys for hand processed vids? (content.js ) - match on title

                    //combine keywords into one object
                    var combinedKeys = video.keywords.concat(video.author, video.size, video.time, video.teaches, video.is, video.discipline, video.tags);

                    async.eachSeries(combinedKeys, function(word, tcallback) { // for each potentail term
                        // check for term in synset?
                        // just add all? (can remove later..

                        // add all.

                        // don't add undefined...
                        if (typeof word === "undefined") {
                            console.log('undefined')
                            tcallback()
                        } else {
                            async.waterfall([
                                function(w3callback) { // add/merge term

                                    var term = {
                                        uid: shortid.generate(),
                                        english: word,
                                        lower: word.toLowerCase()
                                    }
                                    var translation = {
                                        uid: shortid.generate(),
                                        name: word,
                                        lower: word.toLowerCase(),
                                        languageCode: 'en'
                                    }


                                    var cypher = "MERGE (term:term {lower: {term}.lower }) " +
                                        "ON CREATE SET term={term}, term.created=TIMESTAMP() " +
                                        // "ON MATCH term.updated=TIMESTAMP() " +
                                        "MERGE (translation:translation {lower: {translation}.lower}) " +
                                        "ON CREATE SET translation={translation}, translation.created=TIMESTAMP() " +
                                        // "ON MATCH  translation.updated=TIMESTAMP() " +
                                        "MERGE (term)-[r:HAS_TRANSLATION {languageCode: {translation}.languageCode }]->(translation) " +
                                        "RETURN term, translation"

                                    db.query(cypher, {
                                        term: term,
                                        translation: translation
                                    }, function(err, result) {
                                        if (err) console.log(err);
                                        console.log('done add/merge')
                                        w3callback(null, result)
                                    })
                                },
                                function(term, w4callback) { // tag to resource
                                    // termID, videoid

                                    var termID = term[0]['term']['uid'];
                                    // tag video with term
                                    var cypher = "MATCH (n:term {uid: {term}}) , (p:resource {uid: {resource}}) " +
                                        "CREATE (n)<-[:TAGGED_WITH]-(p)"
                                    db.query(cypher, {
                                        term: termID,
                                        resource: videoID
                                    }, function(err, result) {
                                        if (err) console.log(err);

                                        w4callback(null, result)
                                    })
                                }
                            ], function(err, result) {
                                console.log("tagged term!")
                                tcallback(null); // call back waterfall2
                            })
                        }
                    }, function(err) {
                        // if any of the file processing produced an error, err would equal that error
                        if (err) {
                            // One of the iterations produced an error.
                            // All processing will now stop.
                            console.log('A term failed to process');
                        } else {
                            console.log('All terms have been processed successfully');
                            w2callback() //call back term series
                        }
                    })

                }
            ], function(err, result) {
                console.log('done with video!: ', result)
                // result now equals 'done'
                console.log('is this about to call back the video series?')
                // callback() //waterfall 1
                vidcallback() //each video series callback
            }); //end waterfall
        }, function(err) {
            // if any of the file processing produced an error, err would equal that error
            if (err) {
                // One of the iterations produced an error.
                // All processing will now stop.
                console.log('A video failed to process');
            } else {
                console.log('All videos have been processed successfully');
            }
        }) // end each
    } // end addVideosToDB fn


} // end module
