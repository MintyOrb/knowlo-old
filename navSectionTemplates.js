const sidebar = Vue.component('sidebar',{
  template: "#side-nav-template",
  mounted: function(){
    $('.button-collapse').sideNav({
        closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
        draggable: true // Choose whether you can drag to open on touch screens
      }
    );
  }
})
const home = {
  template: `<div>hello world! home here.</div>`
}

const status = {
  template: `<div>hello world! status here.</div>`
}

const about = {
  template: `<div>hello world! about here.</div>`
}

const principals = {
  template: `<div>hello world! principals here.</div>`
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
