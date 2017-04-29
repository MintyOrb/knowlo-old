const sidebar = Vue.component('sidebar',{
  template: "#side-nav-template",
  props: ['member'],
  methods:{
    signOut: function(){ // since this is a child component, probably should be emitting an event and using the signout method on main instead...
      firebase.auth().signOut().then(function() {
      // Sign-out successful.
      }, function(error) {
        console.log('an error...')
      // An error happened.
      });
    }
  },
  created: function(){
    this.$nextTick(function(){
      $('.navbar-collapse').sideNav({
          closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
          draggable: true // Choose whether you can drag to open on touch screens
        }
      );
    })

  }
})
const home = {
  template: `<div>hello world! home here.</div>`
}

const status = {
  template: `<div>hello world! status here.</div>`
}

const trending = {
  template: `<div>hello world! trending here.</div>`
}

const about = Vue.component('about',{
  template: `<div>hello world! about here.</div>`
})

const principals = {
  template: "#principals",
  mounted: function(){
   $('.scrollspy').scrollSpy();  }
}

const profile = Vue.component('profile',{
  props: ['member'],
  template: `<div>hello world! {{member.displayName}}'s profile here.</div>`
})

const involved = {
  template: `<div>hello world! involved here.</div>`
}

const legal = {
  template: `<div>hello world! legal here.</div>`
}
