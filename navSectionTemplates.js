const sidebar = Vue.component('sidebar',{
  template: "#side-nav-template",
  props: ['user'],
  methods:{
    signOut: function(){ // since this is a child component, probably should be emitting an event and using the signout method on main instead...
      firebase.auth().signOut().then(function() {
      // Sign-out successful.
      }, function(error) {
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

const profile = {
  template: `<div>hello world! profile here.</div>`
}

const involved = {
  template: `<div>hello world! involved here.</div>`
}

const legal = {
  template: `<div>hello world! legal here.</div>`
}

const add = Vue.component('add',{
    template: "#addTemplate",
    data: function() {
      return {
      }
    },
    methods:{
      close: function(){
        console.log("close here after esc")
      }
    },
    mounted: function(){

      $('#addModal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '4%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
        ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
          $('body').css("overflow","hidden")
        },
        complete: () => {
          $('body').css("overflow","auto")
        }
      }).modal('open');

      // listen for escape key (materalize closes modal on esc, but doesn't re-route)
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' || event.keyCode === 27) {
          router.go(-1)
        }
      });

  },
  beforeRouteLeave: function (to, from, next){
    if($('#addModal')){
      $('#addModal').modal('close');
    }
    window.setTimeout(()=>{
      next()
    }, 375)

    document.removeEventListener('keydown',function(){})
  }
});
