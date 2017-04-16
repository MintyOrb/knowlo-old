module.exports = function(app, db){
  var model = require('seraph-model');

  var Term = model(db, 'term');
  var Translation = model(db, 'translation');
  Term.compose(Translation, 'translations', 'HAS_TRANSLATION');

  Term.fields = ['url', 'english', 'dateAdded', 'MID', 'languageAddedIn']; // props not on the list are stripped
  Term.setUniqueKey('english', true); // using this feels hacky...the field was only meant to be added as a convinience when using the neo4j browser
  Term.useTimestamps(); // tracks created and updated

  Translation.fields = ['name', 'definition', 'languageCode', 'dateAdded', "_rel"]; // props not on the list are stripped
  // Translation.setUniqueKey('languageCode'); // i
  Translation.useTimestamps() // tracks created and updated
  // Translation.exists(36225,function(err,model){
  //   console.log(model) //-> true
  // })

  Translation.read(86831,function(err,model){
    console.log(model) //-> true
  })

  //
  // var t = require("../keywords")
  // // console.log(t[0].members)
  //
  // //get ids for any existing trans vs get all trans?
  // for (var termIndex = 0; termIndex < t[1].members.length; termIndex++) {
  //   // t[1].members[termIndex]
  //   var term = {
  //       url: 'again',
  //       id: 75515,
  //       english: t[1].members[termIndex].name ,
  //       cowboy: 'check',
  //       translations:[
  //          { name: t[1].members[termIndex].name,_rel: {languageCode: 'en'}}, // including ID adds to node rather than create new.
  //          { name: 'womp', _rel: {languageCode: 'womp' }},
  //       ]
  //     };
  //     var translations = [
  //        { name: t[1].members[termIndex].name,  languageCode: 'en'},
  //        { name: 'womp',  languageCode: 'womp' },
  //     ]
  //     // console.log(term)
  //     // // ...for translation in req.body term.translations.push
  //     //
  //     // var cypher ='MERGE (t:term {url: {term.url}, engl})   '
  //     //           //  +' FOREACH lang in {trans} MERGE (t)-[tr:HAS_TRANSLATION {languageCode: lang.languageCode}]->(tt:translation {lang}) '
  //     //
  //     //             +'RETURN t'
  //     //
  //     //             // MATCH (a:Superlabel {id: {_parentid}}), (b)
  //     //             // WHERE b.id IN EXTRACT(tabobj IN {_tabarray} | tabobj.id)
  //     //             // MERGE (a)-[r:INCLUDES]->(b {name: tabobj.name})
  //     //
  //     // db.query(cypher, {term: term, trans: translations},function(err, result) {
  //     //   if (err) console.log(err);
  //     //   console.log(result)
  //       // if(result){
  //       //   res.send(result[0])
  //       // } else {
  //       //   res.send() // resource not found
  //       // }
  //     // })
  //     // var cypher = "MERGE (term:term {english:{name}, url:{url}})-[tr:HAS_TRANSLATION {languageCode:'en'}]-(translation:translation)"
  //     // var cypher ="MATCH (term:term) WHERE term.name={id} return term"
  //     // var cypher ="START term=NODE({id}) MATCH (term)-[r:HAS_TRANSLATION]->(translation:translation) WHERE r.languageCode={languageCode} return term, translation"
  //
  //     // Term.where({ english: 'Physics' }, { varName: "term" }, function(err, terms) {
  //     //   console.log(terms[0])
  //       Term.update(term, function(err, saved) {
  //         if (err) console.log(err);
  //         console.log(saved);
  //         // res.send()// blah.
  //       })
  //     // })
  //     break
  //   }


  // return term core and synonyms/groups based on ID.
  // language code passed in as "languageCode" by query, default to english
  // id takes the numerical ID or string name of the term
  app.get('/term/:id', function(req, res){
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
  })

  // expects term data, array of translation (name, languagdeCode)
  app.post('/term', function(req, res) {
    // validate data
      //if term already exists
        // run put function?
        // update term data, tags
      // else
        // add term node
        // create relatinships to terms
        var cypher ='MERGE (t:term {term}) '
                   +'UWIND translations as lang MERGE (t)-[tr:HAS_TRANSLATION {languageCode: {lang.languagdeCode}} ]->(tt:translation {lang}) '
                    // 'WHERE ID(tt) IN translations '
                    // 'AND tr.languageCode = lang.languageCode '
                    // 'WHERE ID(translation) IN translations '
                    'RETURN term, COLLECT (tt) as translationss'
                    // MERGE (p:Person{ first: { map }.name, last: { map }.last }
                    // ON CREATE SET n = { map }
                    // ON MATCH  SET n += { map }
        db.query(cypher, {term: term, translations: translations},function(err, result) {
          if (err) console.log(err);
          console.log(result)
          if(result){
            res.send(result[0])
          } else {
            res.send() // resource not found
          }
        })

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

  app.put('/term/:id', function(req, res) {
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
        "RETURN langNode.name as name, core.url as url  LIMIT 8"
    ].join('\n');

    db.query(query, properties, function (err, matches) {
        if (err) {console.log("error in db query: " + err);}
        res.send(matches);
    });

  })
}
