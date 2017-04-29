module.exports = function(app, db){

  // set DB constraints

  db.constraints.uniqueness.createIfNone('member', 'email', function(err, constraint) {
    console.log(constraint);
  });
  db.constraints.uniqueness.createIfNone('member', 'uid', function(err, constraint) {
    console.log(constraint);
  });
  db.constraints.uniqueness.createIfNone('term', 'english', function(err, constraint) {
    console.log(constraint);
  });
  db.constraints.uniqueness.createIfNone('resource', 'url', function(err, constraint) {
    console.log(constraint);
  });

  // set DB indexes

  db.index.createIfNone('translation', 'name', function(err, index) {
    console.log(index);
  });
  db.index.createIfNone('translation', 'id', function(err, index) {
    console.log(index);
  });

}
