const routes = [
  {  path: '/', component: landing },
  {  name: "explore", path: '/e', component: explore },
  {  path: "/home", component: home },
  {  path: "/trending", component: trending },
  {  path: "/status", component: status },
  {  path: "/about", component: about },
  {  path: "/principals", component: principals },
  {  path: "/profile", component: profile },
  {  path: "/involved", component: involved },
  {  path: "/legal", component: legal },
  {  name: "content", path: '/c/:id', component: content }
]

const router = new VueRouter({
  // mode:"history", // will need to catch direct calls to routes if enabled
  routes // short for routes: routes
})

const app = new Vue({
  router,
  data: function() {
    return {
        tagQuery: [],
      }
  },
  created: function(){

    // var searchFlick = $('.tagQuery').flickity({
    //   wrapAround: false,
    //   pageDots: false,
    //   prevNextButtons: true,
    //   accessibility: false, // to prevent jumping when focused
    //   dragThreshold: 0 // play around with this more?
    // });
    // searchFlick.reloadCells()

    this.bigHistory = bigHistory.members//.slice(0,3);
    this.tagQuery= disciplines.members

    this.$nextTick(function(){
      $('.tagQuery-collapse').sideNav({
          menuWidth: 300, // Default is 300
          edge: 'right', // Choose the horizontal origin
          closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
          draggable: true // Choose whether you can drag to open on touch screens
        })
      });

      // check height when adding new items to search. if larger than view hight, make menu wider.
      $('.tagQuery-collapse').sideNav({menuWidth:300})

  },
  methods: {
    layout: function(mes) {
      console.log('in layout: ', mes) // just for testing vue-images-loaded. Which I may never get to wrok.
      this.$refs.tagQuery.layout('masonry');

       // pretty serious antipattern here...make a registery when using cross section views instead?
      var steps = $('.step'); // get isotope containers with jquery
      for (var stepIndex = 0; stepIndex < steps.length; stepIndex++) {
        if(steps[stepIndex].tagName !== undefined && steps[stepIndex]['__vue__'] != null){
          steps[stepIndex]['__vue__'].layout('masonry')
        }
      }

    },
    getQueryOptions: function() {
        return {
            masonry:{columnWidth: 1},
            sortAscending: this.sortAscending,
            getSortData: this.getSortData,
            getFilterData: this.getFilterData,
        }
    },
  }
}).$mount('#main')
