module.exports = function(app, db) {
    var shortid = require('shortid');
    var async = require('async');
    const util = require('util')


    // the functions to run (uncomment)
    // addVideosToDB()
    // fixWeirdTerms();
    putTermsInSets();

    function putTermsInSets(){

    }

    function fixWeirdTerms(){
      require('./modify.js')
      var del =0
      async.eachSeries(modterm['data'], function(term, callback) {
        console.log(term.row[1])
        // i r rr s
        if(term.action ==="i"){
          del++
          console.log(term.row[0])
          var name = term.row[0].substr(0, term.row[0].indexOf('(')).trim();
          var second = term.row[0].substr(term.row[0].indexOf('(')+1,term.row[0].length).trim();
          second =second.substr(0,second.length-1)
          console.log(name)
          console.log(second)
          // callback();
          var cypher ="MATCH (r:resrouce)-[tw:TAGGED_WITH]-(t1:term {uid:{uid}}) " //"-[r1:IN_GROUP]-(tr1:term) "
                    +"MATCH (t2:term) where t2.lower =lower({name}) "
                    // +"set tr1.name={name} ,t1.english={name}, t2.lower=lower({name}) "
                      //  +"CREATE (r)-[:TAGGED_WITH]->(t2) "
                      //  +"detach DELETE tw, t1, r1, tr1 "
                       +"return t2";

          // var cypher ="MATCH (t1:term {uid:{uid}})-[r1:HAS_TRANSLATION]-(tr1:translation) "
          // // +"MATCH (t2:term) where t2.lower =lower({name}) "
          // +"MATCH (G:term) where G.lower=lower({second}) "
          // +"CREATE (t1)-[:IN_GROUP]->(G) "
          // +"set tr1.name={name} ,t1.english={name} "
          // +"return tr1 "

          // +"CREATE (r)-[:TAGGED_WITH]->(t2) "
          db.query(cypher, {uid:term.row[1] ,name:name,second:second},function(err, resource) {
            if (err) {console.log(err);}
              console.log(resource)
              callback()
            })
          } else {
              callback()
          }

      })
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
