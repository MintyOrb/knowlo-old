// module.exports = function(app, db) {
{
    var shortid = require('shortid');
    var async = require('async');
    const util = require('util')
    var db = require("seraph")({
      server: "http://localhost:7474",
      user: 'neo4j',
      pass: 'admin'
    });


    // the functions to run (uncomment)
    // addVideosToDB();
    // putTermsInSets();
    // addID();
    // fixDateFormat();
    // updateResourceSchema();
    // addOldMeta();
    // parseReddit(); //; add gathered link resources -- do reddit separate?
    // getIconUrls();
    // addTagsInTitle() // parse len 1 and 2 tokens from title, add as tags if in db
    // addImgResources() //
    simplifyTranslationSchema(){
      require('./tempData/oldResources')
      var cypher = "MATCH (t:translation )<-[:HAS_TRANSLATION]-() where ID(t)={id} "

      //
      db.query(cypher, {uid:  },function(err, result) {
        if (err) console.log(err);

        console.log(result)
        callback()
      })
      // async.eachSeries(oldResources['data'], function(node, callback) {
      //   console.log(node['row'][1])
      //   var details = node['row'][0]
      //   var detailIDs = [];
      //   for (var i = 0; i < Object.keys(details).length; i++) {
      //     detailIDs.push(shortid.generate());
      //   }
      //
      //   var cypher = "MATCH (resource:resource {uid:{uid}}) "
      //              + "WITH resource, {detail} AS detail, {detailIDs} as dIDs, keys({detail}) AS keys "
      //              + "FOREACH (index IN range(0, size(keys)-1) | "
      //                + "MERGE (resource)-[r:HAS_PROPERTY {order: 1, type: keys[index] }]->(prop:prop:tester {type: keys[index], uid: dIDs[index] })-[tr:HAS_TRANSLATION {languageCode: 'en'}]->(langNode:tester:translation {value: detail[keys[index]] } ) "
      //              + ") "
      //              + "RETURN resource"
      //   //
      //   db.query(cypher, {uid: node['row'][1], detail: details, detailIDs: detailIDs },function(err, result) {
      //     if (err) console.log(err);
      //
      //     console.log(result)
      //     callback()
      //   })
      //   }, function(err) {
      //       if( err ) {
      //         console.log('A resource failed to process');
      //       } else {
      //         console.log('All resources have been processed successfully');
      //       }
      //   });
    }


    /*
    888                                    d8b               888    d8b 888    888
    888                                    Y8P               888    Y8P 888    888
    888                                                      888        888    888
    888888  8888b.   .d88b.  .d8888b       888 88888b.       888888 888 888888 888  .d88b.  .d8888b
    888        "88b d88P"88b 88K           888 888 "88b      888    888 888    888 d8P  Y8b 88K
    888    .d888888 888  888 "Y8888b.      888 888  888      888    888 888    888 88888888 "Y8888b.
    Y88b.  888  888 Y88b 888      X88      888 888  888      Y88b.  888 Y88b.  888 Y8b.          X88
     "Y888 "Y888888  "Y88888  88888P'      888 888  888       "Y888 888  "Y888 888  "Y8888   88888P'
                         888
                    Y8b d88P
                     "Y88P"
    */

    function addTagsInTitle(){
      require('./tempData/titleTags')
      async.eachSeries(titleTags['data'], function(node, callback) {
        console.log(node.row[0])
        console.log(node.row[1])
        var tokens =[]
        var nospecial = node.row[1].replace(/[^a-zA-Z0-9 ]/g, "");
        var split = nospecial.split(' ')
        var stop = ["undefined","a", "about", "above", "above", "across", "after", "afterwards", "again", "against", "all", "almost", "alone", "along", "already", "also","although","always","am","among", "amongst", "amoungst", "amount",  "an", "and", "another", "any","anyhow","anyone","anything","anyway", "anywhere", "are", "around", "as",  "at", "back","be","became", "because","become","becomes", "becoming", "been", "before", "beforehand", "behind", "being", "below", "beside", "besides", "between", "beyond", "bill", "both", "bottom","but", "by", "call", "can", "cannot", "cant", "co", "con", "could", "couldnt", "cry", "de", "describe", "detail", "do", "done", "down", "due", "during", "each", "eg", "eight", "either", "eleven","else", "elsewhere", "empty", "enough", "etc", "even", "ever", "every", "everyone", "everything", "everywhere", "except", "few", "fifteen", "fify", "fill", "find", "fire", "first", "five", "for", "former", "formerly", "forty", "found", "four", "from", "front", "full", "further", "get", "give", "go", "had", "has", "hasnt", "have", "he", "hence", "her", "here", "hereafter", "hereby", "herein", "hereupon", "hers", "herself", "him", "himself", "his", "how", "however", "hundred", "ie", "if", "in", "inc", "indeed", "interest", "into", "is", "it", "its", "itself", "keep", "last", "latter", "latterly", "least", "less", "ltd", "made", "many", "may", "me", "meanwhile", "might", "mill", "mine", "more", "moreover", "most", "mostly", "move", "much", "must", "my", "myself", "name", "namely", "neither", "never", "nevertheless", "next", "nine", "no", "nobody", "none", "noone", "nor", "not", "nothing", "now", "nowhere", "of", "off", "often", "on", "once", "one", "only", "onto", "or", "other", "others", "otherwise", "our", "ours", "ourselves", "out", "over", "own","part", "per", "perhaps", "please", "put", "rather", "re", "same", "see", "seem", "seemed", "seeming", "seems", "serious", "several", "she", "should", "show", "side", "since", "sincere", "six", "sixty", "so", "some", "somehow", "someone", "something", "sometime", "sometimes", "somewhere", "still", "such", "system", "take", "ten", "than", "that", "the", "their", "them", "themselves", "then", "thence", "there", "thereafter", "thereby", "therefore", "therein", "thereupon", "these", "they", "thickv", "thin", "third", "this", "those", "though", "three", "through", "throughout", "thru", "thus", "to", "together", "too", "top", "toward", "towards", "twelve", "twenty", "two", "un", "under", "until", "up", "upon", "us", "very", "via", "was", "we", "well", "were", "what", "whatever", "when", "whence", "whenever", "where", "whereafter", "whereas", "whereby", "wherein", "whereupon", "wherever", "whether", "which", "while", "whither", "who", "whoever", "whole", "whom", "whose", "why", "will", "with", "within", "without", "would", "yet", "you", "your", "yours", "yourself", "yourselves", "the"];
        var split = split.filter(function(word){
          return stop.indexOf(word) == -1
        })

        for (var i = 0; i < split.length; i++) {
          // console.log(split[i]+" "+split[i + 1])
          tokens.push(split[i].toLowerCase())
          tokens.push((split[i]+" "+split[i + 1]).toLowerCase())
        }
        // console.log(tokens)
            async.eachSeries(tokens, function(token, callback) {
              console.log(token)

              tagResource(node.row[0], token, function(err, result){
                  if(err){console.log(err)}
                  console.log('back from tagging: ')
                  console.log(result)
                  callback()
              })

            }, function(err) {
                if( err ) {

                  console.log('A token failed to process');
                } else {
                  callback()
                  console.log('All tokens have been processed successfully');
                }
            });
      }, function(err) {
          if( err ) {
            console.log('A resource failed to process: ',err);
          } else {

            console.log('All resources have been processed successfully');
          }
      });
    }
    function tagResource(uid, snip, callback){


      console.log('in do query')
      // callback('hi')

      var cypher = "MATCH (t:term)-[:IN_SET]->(set:synSet), (r:resource {uid:{ruid}}) "
                 + "WHERE t.lower = {snip} "
                 + "WITH set, r "
                 + "MERGE (set)<-[rel:TAGGED_WITH]-(r) "
                 + "RETURN set,r "
      //
      db.query(cypher, {ruid: uid, snip: snip },function(err, result) {
        if (err) console.log(err);
        console.log(err)
        // console.log('back :')
        // console.log(result)
        callback(result)
      })
    }
    /*
    d8b                                                 888
    Y8P                                                 888
                                                        888
    888  .d8888b .d88b.  88888b.       888  888 888d888 888 .d8888b
    888 d88P"   d88""88b 888 "88b      888  888 888P"   888 88K
    888 888     888  888 888  888      888  888 888     888 "Y8888b.
    888 Y88b.   Y88..88P 888  888      Y88b 888 888     888      X88
    888  "Y8888P "Y88P"  888  888       "Y88888 888     888  88888P'
    */


    function getIconUrls() {

      require('./tempData/icon4Terms')

      const GoogleImages = require('google-images');
      const client = new GoogleImages('011351806300959179866:tq_4msn-ueo', 'AIzaSyBTN9vyCTPA8jSiP2hgd8ccw4Lew3Fzap8');


      async.eachSeries(icon4Terms['data'], function(node, callback) {

        client.search(node.row[1] + " icon")
          .then(images => {
            // console.log(images)

            var urls=[]
            for (var i = 0; i < 3; i++) {
              if(images[i].thumbnail){
                  urls.push({
                  order: i + 1,
                  value:images[i].thumbnail.url,
                  url:images[i].thumbnail.url,
                  source: images[i].parentPage,
                  detail: images[i].description,
                  uid: shortid.generate()
                })
              }

            }
            console.log(urls)
            async.eachSeries(urls, function(prop, callback) {
              console.log('in second asyc')
              console.log(node.row[0])
              console.log(prop)
              img(node.row[0], prop, function(err, result){
                console.log('done an icon')
                console.log(err)
                console.log(result)

                callback();
              })

            }, function(err) {
                if( err ) {
                  console.log('A term failed to process');
                } else {
                  console.log('All terms have been processed successfully');
                  callback()
                }

            });
          })
        }, function(err) {
            if( err ) {
              console.log('A term failed to process');
            } else {
              console.log('All terms have been processed successfully');
            }
        });


    }
    function img(uid, props, callback){


      console.log('in do query')
      // callback('hi')

      var cypher = "MATCH (set:synSet {uid:{uid}}) "
                 + "WITH set, {detail} AS detail "
                 + "MERGE (set)-[r:HAS_PROPERTY {order: {detail}.order, type: 'url' }]->(prop:prop:termUrlTest {type: 'url', uid: {detail}.uid })-[tr:HAS_TRANSLATION {languageCode: 'en'}]->(langNode:termUrlTest:translation ) "
                 + "SET langNode =  {detail} "
                 + "RETURN set, langNode "
      //
      db.query(cypher, {uid: uid, detail: props },function(err, result) {
        if (err) console.log(err);
        console.log(err)
        console.log('back :')
        console.log(result)
        callback(result)
      })
    }

    /*
                                                                          888      888 d8b 888
                                                                          888      888 Y8P 888
                                                                          888      888     888
    88888b.   8888b.  888d888 .d8888b   .d88b.       888d888 .d88b.   .d88888  .d88888 888 888888
    888 "88b     "88b 888P"   88K      d8P  Y8b      888P"  d8P  Y8b d88" 888 d88" 888 888 888
    888  888 .d888888 888     "Y8888b. 88888888      888    88888888 888  888 888  888 888 888
    888 d88P 888  888 888          X88 Y8b.          888    Y8b.     Y88b 888 Y88b 888 888 Y88b.
    88888P"  "Y888888 888      88888P'  "Y8888       888     "Y8888   "Y88888  "Y88888 888  "Y888
    888
    888
    888
    */
    function parseReddit() {
      require('./tempData/redditResources')
      var scraperjs = require('scraperjs');
      var noImg=[];

      async.eachSeries(redditResources, function(link, callback) {
        console.log(link)
        scraperjs.StaticScraper.create(link)
            .scrape(function($) {
              return $(".title a").map(function() {
                // console.log($(this).text())
                // console.log($(this)[0].attribs.href)
                return {title:$(this).text(),
                        url: $(this)[0].attribs.href}
              }).get();
            }).then(function(scrape) {

              var core = {
                  mThumb:scrape[0].url,
                  url: scrape[0].url,
                  source: link,
                  uid: shortid.generate()
              }
              var details = {
                title: scrape[0].title,
              }

              console.log(core)
              if(scrape[0].url.indexOf("http")>-1){
                console.log('do all the stuff')
                // callback()
                var detailIDs = [];
                for (var i = 0; i < Object.keys(details).length; i++) {
                  detailIDs.push(shortid.generate());
                }

                var cypher = "CREATE (resource:resource) "
                           + "SET resource={core}, resource.dateAdded=TIMESTAMP() "
                           + "WITH resource, {detail} AS detail, {detailIDs} as dIDs, keys({detail}) AS keys "
                           + "FOREACH (index IN range(0, size(keys)-1) | "
                             + "MERGE (resource)-[r:HAS_PROPERTY {order: 1, type: keys[index] }]->(prop:prop:tester {type: keys[index], uid: dIDs[index] })-[tr:HAS_TRANSLATION {languageCode: 'en'}]->(langNode:tester:translation {value: detail[keys[index]] } ) "
                           + ") "
                           + "RETURN resource"
                //
                db.query(cypher, {core: core, detail: details, detailIDs: detailIDs },function(err, result) {
                  if (err) console.log(err);

                  console.log(result)
                  callback()
                })
              } else {
                console.log('no url :|')
                noImg.push(link)
                callback()
              }

          	})

      }, function(err) {
          if( err ) {
            console.log('A link failed to process');
            console.log(noImg)
          } else {
            console.log('All links have been processed successfully');
            console.log(noImg)
          }
      });


    }
    /*
                  888      888               888      888                             888
                  888      888               888      888                             888
                  888      888               888      888                             888
     8888b.   .d88888  .d88888       .d88b.  888  .d88888      88888b.d88b.   .d88b.  888888  8888b.
        "88b d88" 888 d88" 888      d88""88b 888 d88" 888      888 "888 "88b d8P  Y8b 888        "88b
    .d888888 888  888 888  888      888  888 888 888  888      888  888  888 88888888 888    .d888888
    888  888 Y88b 888 Y88b 888      Y88..88P 888 Y88b 888      888  888  888 Y8b.     Y88b.  888  888
    "Y888888  "Y88888  "Y88888       "Y88P"  888  "Y88888      888  888  888  "Y8888   "Y888 "Y888888
    */
    function addOldMeta() {
      require('./tempData/oldResources')

      async.eachSeries(oldResources['data'], function(node, callback) {
        console.log(node['row'][1])
        var details = node['row'][0]
        var detailIDs = [];
        for (var i = 0; i < Object.keys(details).length; i++) {
          detailIDs.push(shortid.generate());
        }

        var cypher = "MATCH (resource:resource {uid:{uid}}) "
                   + "WITH resource, {detail} AS detail, {detailIDs} as dIDs, keys({detail}) AS keys "
                   + "FOREACH (index IN range(0, size(keys)-1) | "
                     + "MERGE (resource)-[r:HAS_PROPERTY {order: 1, type: keys[index] }]->(prop:prop:tester {type: keys[index], uid: dIDs[index] })-[tr:HAS_TRANSLATION {languageCode: 'en'}]->(langNode:tester:translation {value: detail[keys[index]] } ) "
                   + ") "
                   + "RETURN resource"
        //
        db.query(cypher, {uid: node['row'][1], detail: details, detailIDs: detailIDs },function(err, result) {
          if (err) console.log(err);

          console.log(result)
          callback()
        })
        }, function(err) {
            if( err ) {
              console.log('A resource failed to process');
            } else {
              console.log('All resources have been processed successfully');
            }
        });
      }


    /*
                       888          888            8888888b.                                                             .d8888b.           888
                       888          888            888   Y88b                                                           d88P  Y88b          888
                       888          888            888    888                                                           Y88b.               888
888  888 88888b.   .d88888  8888b.  888888 .d88b.  888   d88P .d88b.  .d8888b   .d88b.  888  888 888d888 .d8888b .d88b.  "Y888b.    .d8888b 88888b.   .d88b.  88888b.d88b.   8888b.
888  888 888 "88b d88" 888     "88b 888   d8P  Y8b 8888888P" d8P  Y8b 88K      d88""88b 888  888 888P"  d88P"   d8P  Y8b    "Y88b. d88P"    888 "88b d8P  Y8b 888 "888 "88b     "88b
888  888 888  888 888  888 .d888888 888   88888888 888 T88b  88888888 "Y8888b. 888  888 888  888 888    888     88888888      "888 888      888  888 88888888 888  888  888 .d888888
Y88b 888 888 d88P Y88b 888 888  888 Y88b. Y8b.     888  T88b Y8b.          X88 Y88..88P Y88b 888 888    Y88b.   Y8b.    Y88b  d88P Y88b.    888  888 Y8b.     888  888  888 888  888
 "Y88888 88888P"   "Y88888 "Y888888  "Y888 "Y8888  888   T88b "Y8888   88888P'  "Y88P"   "Y88888 888     "Y8888P "Y8888  "Y8888P"   "Y8888P 888  888  "Y8888  888  888  888 "Y888888
         888
         888
         888
*/


    function updateResourceSchema(){
      require('./tempData/updateResources1')
      var YouTube = require('youtube-node');
      var youTube = new YouTube();
      const url = require('url');

      youTube.setKey('AIzaSyB1OOSpTREs85WUMvIgJvLTZKye4BVsoFU'); //key provided by package

      async.eachSeries(updateResources1['data'], function(node, callback) {
        var details = {}
        var core = node['row'][0]
        var notProcessed = []
        var count =0

        if(node['row'][0].webURL && node['row'][0].savedAs && node['row'][0].displayType != 'embed'){ // if image with source URL
          console.log("image and source")
          core.source = node['row'][0].savedAs
          core.url = 'http://s3.amazonaws.com/submitted_images/' + node['row'][0].savedAs
          core.mThumb = 'http://s3.amazonaws.com/submitted_images/' + node['row'][0].savedAs
          doQuery(core, details, function(err, result){
            console.log('done with image and source')
            console.log(err)
            console.log(result)

            callback();
          })
        } else if(!node['row'][0].webURL && node['row'][0].savedAs && node['row'][0].displayType == 'image'){ //if image without source
          console.log("image without source")
          core.url = 'http://s3.amazonaws.com/submitted_images/' + node['row'][0].savedAs;
          core.mThumb = 'http://s3.amazonaws.com/submitted_images/' + node['row'][0].savedAs;
          doQuery(core, details, function(err, result){
            console.log('done with image without source')
            console.log(err)
            console.log(result)

            callback();
          })
        } else if(node['row'][0].videoid || node['row'][0].webURL && node['row'][0].webURL.indexOf('youtube.com') > -1){
          console.log(node['row'][0].uid)
          processYoutube(node['row'][0].videoid || url.parse(node['row'][0].webURL, true).query.v, core, youTube, function(d, c,err){
            console.log('after process yt')
            console.log(err)
            console.log(c)
            console.log(d)
            detail = d;// empty before yt processing
            core = c;// passed in and then out

            doQuery(core, detail, function(err, result){
              console.log(err)
              console.log('out')
              callback();
            })

          })
        } else {
          console.log('none of the above?')
          console.log(node['row'][0].uid)
          notProcessed.push(node['row'][0].uid);
          console.log(notProcessed)
          count+=1
          console.log(count)
          callback()
        }


      }, function(err) {
          if( err ) {
            console.log('A resource failed to process');
          } else {
            console.log('All resources have been processed successfully');
          }
      });
    }
    function processYoutube(id, core, youTube, callback) {
      console.log('in process yt')
      youTube.getById(id, function(error, result) {
        if (error) {
          console.log(error);
        }
        else {
          // console.log(result)
          // console.log(result.items[0].snippet.title)
          // console.log(result.items[0].snippet.thumbnails.standard.url)
          var deets = {
            title:result.items[0].snippet.title,
            description:result.items[0].snippet.description,
            subtitle: result.items[0].snippet.channelTitle
          }
          if(core.duration){
            core.viewTime = core.duration;
          } else {
            core.viewTime = result.items[0].contentDetails.duration; // will need to convert these....
            core.duration = result.items[0].contentDetails.duration;
          }
          core.sThumb = result.items[0].snippet.thumbnails.default.url;
          core.mThumb = result.items[0].snippet.thumbnails.medium.url;
          core.lThumb = result.items[0].snippet.thumbnails.high.url;
          if(core.xlThumb = result.items[0].snippet.thumbnails.standard){
            core.xlThumb = result.items[0].snippet.thumbnails.standard.url;
          }
            // viewTime:
          if(!core.url){
            core.url=core.webURL
          }
            // console.log(core)
            // console.log(deets)
          // console.log(JSON.stringify(result, null, 2));
          callback(deets, core)
        }
      });
    }
    function doQuery(cor, det, callback){

      var detailIDs = [];
      for (var i = 0; i < Object.keys(det).length; i++) {
        detailIDs.push(shortid.generate());
      }
      console.log('in do query')
      // callback('hi')

      var cypher = "MERGE (resource:resource {uid:{core}.uid}) "
                 + "ON MATCH SET resource={core} "
                 + "WITH resource, {detail} AS detail, {detailIDs} as dIDs, keys({detail}) AS keys "
                 + "FOREACH (index IN range(0, size(keys)-1) | "
                   + "MERGE (resource)-[r:HAS_PROPERTY {order: 1, type: keys[index] }]->(prop:prop:tester {type: keys[index], uid: dIDs[index] })-[tr:HAS_TRANSLATION {languageCode: 'en'}]->(langNode:tester:translation {value: detail[keys[index]] } ) "
                 + ") "
                 + "RETURN resource"
      //
      db.query(cypher, {core: cor, detail: det, detailIDs: detailIDs },function(err, result) {
        if (err) console.log(err);
        console.log('baaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaack')
        console.log(err)
        console.log(result)
        callback(result)
      })
    }


    /*
 .d888 d8b          8888888b.           888            8888888888                                      888
d88P"  Y8P          888  "Y88b          888            888                                             888
888                 888    888          888            888                                             888
888888 888 888  888 888    888  8888b.  888888 .d88b.  8888888  .d88b.  888d888 88888b.d88b.   8888b.  888888
888    888 `Y8bd8P' 888    888     "88b 888   d8P  Y8b 888     d88""88b 888P"   888 "888 "88b     "88b 888
888    888   X88K   888    888 .d888888 888   88888888 888     888  888 888     888  888  888 .d888888 888
888    888 .d8""8b. 888  .d88P 888  888 Y88b. Y8b.     888     Y88..88P 888     888  888  888 888  888 Y88b.
888    888 888  888 8888888P"  "Y888888  "Y888 "Y8888  888      "Y88P"  888     888  888  888 "Y888888  "Y888
*/


    function fixDateFormat(){
      require('./tempData/fixDate2')

      async.eachSeries(fixDate2['data'], function(node, callback) {
        var cypher = "MATCH (s) WHERE s.uid = {uid} SET s.dateAdded={date} RETURN s.dateAdded "
        console.log(node['row'][0].uid)
        console.log(Date.parse(node['row'][0].dateAdded))
        var date = Date.parse(node['row'][0].dateAdded);
        // callback()
        db.query(cypher, {date: date, uid: node['row'][0].uid },function(err, result) {
          if (err) console.log(err);
          console.log(result)
          callback()
        })
      }, function(err) {
          if( err ) {
            console.log('A term failed to process');
          } else {
            console.log('All terms have been processed successfully');
          }
      });
    }
    /*
              888      888 8888888 8888888b.
              888      888   888   888  "Y88b
              888      888   888   888    888
 8888b.   .d88888  .d88888   888   888    888
    "88b d88" 888 d88" 888   888   888    888
.d888888 888  888 888  888   888   888    888
888  888 Y88b 888 Y88b 888   888   888  .d88P
"Y888888  "Y88888  "Y88888 8888888 8888888P"
*/


    function addID(){

      require('./tempData/noUIDs')
      console.log(noUIDs['data'][0]['meta'][0]['id'])
      async.eachSeries(noUIDs['data'], function(term, callback) {
        var uid=shortid.generate();
        var cypher = "MATCH (s) WHERE ID(s) = {tid} SET s.uid={id} "
        console.log(term['meta'][0]['id'])

        // callback()
        db.query(cypher, {id: uid, tid: term['meta'][0]['id'] },function(err, result) {
          if (err) console.log(err);
          callback()
        })
      }, function(err) {
          if( err ) {
            console.log('A term failed to process');
          } else {
            console.log('All terms have been processed successfully');
          }
      });

    }
    /*
                  888  88888888888                                      8888888           .d8888b.           888
                  888      888                                            888            d88P  Y88b          888
                  888      888                                            888            Y88b.               888
88888b.  888  888 888888   888   .d88b.  888d888 88888b.d88b.  .d8888b    888   88888b.   "Y888b.    .d88b.  888888 .d8888b
888 "88b 888  888 888      888  d8P  Y8b 888P"   888 "888 "88b 88K        888   888 "88b     "Y88b. d8P  Y8b 888    88K
888  888 888  888 888      888  88888888 888     888  888  888 "Y8888b.   888   888  888       "888 88888888 888    "Y8888b.
888 d88P Y88b 888 Y88b.    888  Y8b.     888     888  888  888      X88   888   888  888 Y88b  d88P Y8b.     Y88b.       X88
88888P"   "Y88888  "Y888   888   "Y8888  888     888  888  888  88888P' 8888888 888  888  "Y8888P"   "Y8888   "Y888  88888P'
888
888
888
*/


    function putTermsInSets(){
      // create synstes in db based on quering existing terms

      var wordNet = require( 'wordnet-magic' );
      const util = require('util')
      var wn = wordNet("./wordnet.db", false);
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
                  callback()
                })
            });

          }else{ // will have to find and add to a set manually...
              console.log('will have to find and add to a set manually... ', term)
              callback()
          }

        });

      }, function(err) {
          if( err ) {
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
            if( err ) {
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
    /*
              888      888 888     888 d8b      888                        88888888888       8888888b.  888888b.
              888      888 888     888 Y8P      888                            888           888  "Y88b 888  "88b
              888      888 888     888          888                            888           888    888 888  .88P
 8888b.   .d88888  .d88888 Y88b   d88P 888  .d88888  .d88b.   .d88b.  .d8888b  888   .d88b.  888    888 8888888K.
    "88b d88" 888 d88" 888  Y88b d88P  888 d88" 888 d8P  Y8b d88""88b 88K      888  d88""88b 888    888 888  "Y88b
.d888888 888  888 888  888   Y88o88P   888 888  888 88888888 888  888 "Y8888b. 888  888  888 888    888 888    888
888  888 Y88b 888 Y88b 888    Y888P    888 Y88b 888 Y8b.     Y88..88P      X88 888  Y88..88P 888  .d88P 888   d88P
"Y888888  "Y88888  "Y88888     Y8P     888  "Y88888  "Y8888   "Y88P"   88888P' 888   "Y88P"  8888888P"  8888888P"
*/


    function addVideosToDB() {
        require('./scripts/know3results')
        async.eachSeries(know3, function(video, vidcallback) { // for each new video

            async.waterfall([
                function(w1callback) { // add resource
                    console.log(Date.now())
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

                                    // tag all
                                    // var cypher = "MERGE (term:term {lower: {term}.lower }) " +
                                    //     "ON CREATE SET term={term}, term.created=TIMESTAMP() " +
                                    //     // "ON MATCH term.updated=TIMESTAMP() " +
                                    //     "MERGE (translation:translation {lower: {translation}.lower}) " +
                                    //     "ON CREATE SET translation={translation}, translation.created=TIMESTAMP() " +
                                    //     // "ON MATCH  translation.updated=TIMESTAMP() " +
                                    //     "MERGE (term)-[r:HAS_TRANSLATION {languageCode: {translation}.languageCode }]->(translation) " +
                                    //     "RETURN term, translation"

                                    // tag if term exists
                                    var cypher = "MATCH (term:term {lower: {term}.lower }) "
                                               + "RETURN term "

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
                                    console.log(term)
                                    if(term.length > 0){
                                      // var termID = term[0]['term']['uid'];
                                      var termID = term[0]['uid'];
                                      console.log(termID)

                                      // tag video with term
                                      var cypher = "MATCH (n:term {uid: {term}})-[:IN_SET]->(set:synSet) , (p:resource {uid: {resource}}) " +
                                          "MERGE (set)<-[:TAGGED_WITH]-(p)"
                                      db.query(cypher, {
                                          term: termID,
                                          resource: videoID
                                      }, function(err, result) {
                                          if (err) console.log(err);

                                          w4callback(null, result)
                                      })
                                  } else {
                                      w4callback(null, {})
                                  }

                                }
                            ], function(err, result) {
                                console.log("tagged term!")
                                tcallback(null); // call back waterfall2
                            })
                        }
                    }, function(err) {
                        if (err) {
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
            if (err) {
                console.log('A video failed to process');
            } else {
                console.log('All videos have been processed successfully');
            }
        }) // end each
    } // end addVideosToDB fn


} // end module
