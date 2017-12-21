const sidebar = Vue.component('sidebar',{
  template: "#side-nav-template",
  props: ['member'],
  methods:{
    loginModal: function(){
      $('#login-modal').modal('open');
    },
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
  template:
  `<div style="min-height:90vh;font-weight:300;margin-left:10vw;margin-right:10vw">
    <h5 style="font-weight:300;margin-top:100px;">The intention is for this page to become a live updating dashboard of information in beautiful graphic form about, but not limited to, the following:</h5>
    <div style='margin-left:30px;'>
      <p>- number of current logged in users on the site, with map.</p>
      <p>- total number of knowlo members</p>
      <p>- total number of resources</p>
      <p>- recent donations/expenses</p>
      <p>- recent insights and quotations</p>
      <p>- anything else interesting</p>
    </div>
  </div>`
}

const trending = {
  template: `<div>hello world! trending here.</div>`
}

const principals = {
  template: "#principals",
  mounted: function(){
   $('.scrollspy').scrollSpy();  }
}

const involved = {
  template:
  `<div style="min-height:90vh;font-weight:300;margin-left:10vw;margin-right:10vw">
    <h5 style="font-weight:300;margin-top:100px;">This page will eventually include instructions for how to get involved.</h5>
    <div style='margin-left:30px;'>
      <p>- <a target="_blank" href="http://github.com/timborny/knowlo">find us on github</a></p>
    </div>
  </div>`
}

const legal = {
  template:
  `<div style="min-height:90vh;font-weight:300;margin-left:10vw;margin-right:10vw">
    <h5 style="font-weight:300;margin-top:100px;">No legalese yet.</h5>
    <div style='margin-left:30px;'>
      <p>Eventually there will be offiical terms of use and privacy policies. In the meantime, knowlo promises to act in accordance with its <router-link to="/principals">principals</router-link>, and by using the site, you agree to be a decent person.</a></p>
    </div>
  </div>`
}
