const routes = [

  {  path: '/land', component: landing },
  {  name: "explore", path: '/', component: explore,
      children: [
        { path: '/c/:id', component: resourceComp, name: 'resourceSub' },
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
        tagQuery: [],   // list of tag objects to be queried
      }
  },
  created: function(){

    this.bigHistory = bigHistory.members//.slice(0,3);
    this.tagQuery= disciplines.members.slice(0,3);

    this.$nextTick(function(){
      $('.tagQuery-collapse').sideNav({
          menuWidth: 300, // Default is 300
          edge: 'right', // Choose the horizontal origin
          closeOnClick: false, // Closes side-nav on <a> clicks, useful for Angular/Meteor
          draggable: true // Choose whether you can drag to open on touch screens
        })
      });

  }
}).$mount('#main')
