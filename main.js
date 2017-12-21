const routes = [

  {  name: "explore", path: '/', component: explore,
      children: [
        { path: '/m/:uid', component: memberPage, name: 'memberPage' },
        { path: '/r/:uid', component: resourceComp, name: 'resourceSub' },
        { path: '/t/:name/:uid?', component: termComp, name: 'setSub' },
        { path: '/addResource', component: addResource, name: 'addResource' },
        { path: '/addTerm/:translation/:termID?', component: addTerm, name: 'addTerm' },
      ]
  },
  {  path: "/trending", component: trending },
  {  path: "/status", component: status },
  {  path: "/about", component: landing },
  {  path: "/principals", component: principals },
  {  path: "/involved", component: involved },
  {  path: "/legal", component: legal },
  { path: '*', redirect: '/' }
]

const router = new VueRouter({
  // mode:"history", // will need to catch direct calls to routes if enabled
  routes
})

const app = new Vue({
  router,
  data: function() {
    return {
        member: {uid:null},       // id and info for member if logged in, uid null if not
        termQuery: [],            // array of term objects to be queried
      }
  },
  methods: {
    close: function(){
      $('.termQuery-collapse').sideNav('hide');
    },
    loginModal: function(){
      $('#login-modal').modal('open');
    },
    touchMember: function(){
      // ensure member is in DB (add if first time signing in)
      this.$http.post('/api/member', {term: this.term, translation:this.translation}).then(response => {
        if(!response.body){
          Materialize.toast('Something went wrong...', 4000)
        }
      }, response => {
         Materialize.toast('Something went wrong...are you online?', 4000)
      });
    },
  },
  mounted: function(){

    // needed to recover from occasional mystery DOM exception on resource/term suggestion change
    // Vue.config.errorHandler =  (err) => { //TODO figure out what is causing this...vueisotope?
    //   Materialize.toast('whoops...hit a snag. Reload the page if things seem off...',3000)
    //   console.log(err)
    //   // window.setTimeout(()=> {
    //   //   this.$router.go(this.$route)
    //   // }, 2000);
    // };
    // get term query
    if(Cookies.get('termQuery')){
        this.termQuery = Cookies.getJSON('termQuery');
    }

    var lang = window.navigator.userLanguage || window.navigator.language;
    console.log(lang)
    lang = lang.substr(0,2); // get two letter language code

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
    		"offset": 50,
    		"tolerance" : {
        down : 0,
        up : 10
        },
  		}).init();

      firebase.auth().onAuthStateChanged((member) => {
          if (member) {
            this.member = member;
            this.member.first = member.displayName.substr(0,member.displayName.indexOf(' ')); // get first name -  if there is no space at all, then the first line will return an empty string and the second line will return the entire string
            member.getIdToken().then((accessToken) => {
              Vue.http.headers.common['Authorization'] = "Bearer " + accessToken;
              this.touchMember();
              bus.$emit('login',member)
            });
          } else {
            this.member = {uid:null};
            Vue.http.headers.common['Authorization'] = '';
          }
        }, function(error) {
          Materialize.toast('Something went wrong...are you online?', 4000)
        });

  }
}).$mount('#main')

var bus = new Vue()
