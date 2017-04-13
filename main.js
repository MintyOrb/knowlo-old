const routes = [

  {  path: '/land', component: landing },
  {  name: "explore", path: '/', component: explore,
      children: [
        { path: '/c/:id', component: resourceComp, name: 'resourceSub' },
        { path: '/t/:id', component: termComp, name: 'termSub' },
        { path: '/add', component: add, name: 'exploreAdd' },
      ]
  },
  {  name: "resource", path: '/c/:id', component: resourceComp },
  {  path: "/home", component: home },
  {  path: "/trending", component: trending },
  {  path: "/status", component: status },
  {  path: "/about", component: about },
  {  path: "/principals", component: principals },
  {  path: "/profile", component: profile },
  {  path: "/involved", component: involved },
  {  path: "/legal", component: legal },
]

const router = new VueRouter({
  // mode:"history", // will need to catch direct calls to routes if enabled
  routes // short for routes: routes
})

const app = new Vue({
  router,
  data: function() {
    return {
        user: {},       // id and info for user if logged in, undefined if not
        termQuery: [],   // array of term objects to be queried
      }
  },
  methods: {
    close: function(){
      console.log('close here')
      $('.termQuery-collapse').sideNav('hide');
    },
    signOut: function(){
      firebase.auth().signOut().then(function() {
      // Sign-out successful.
      }, function(error) {
      // An error happened.
      });
    }
  },
  mounted: function(){

    this.bigHistory = bigHistory.members//.slice(0,3);
    this.termQuery= disciplines.members.slice(0,3);

    this.$nextTick(function(){ // init term sidebar
      $('.termQuery-collapse').sideNav({
          menuWidth: 300, // Default is 300
          edge: 'right', // Choose the horizontal origin
          closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
          draggable: true // Choose whether you can drag to open on touch screens
        })
      });

      $('#login-modal').modal(); // init login modal

      // init headroom (hide/show navbar on scroll down/up)
      var elem = document.querySelector("#nav-slide");
    	var headroom = new Headroom(elem, {
    		"offset": 220,
    		"tolerance" : {
        down : 0,
        up : 10
        },
  		})
    	headroom.init();

      firebase.auth().onAuthStateChanged((user) => {
          if (user) {
            this.user = user;
            this.user.first = user.displayName.substr(0,user.displayName.indexOf(' ')); // get first name -  if there is no space at all, then the first line will return an empty string and the second line will return the entire string

            user.getToken().then(function(accessToken) {
              // do I need this?
            });
          } else {
            this.user = undefined;
            console.log("user is signed out")
          }
        }, function(error) {
          console.log(error);
          Materialize.toast('Something went wrong...are you online?', 4000)
        });

  }
}).$mount('#main')
