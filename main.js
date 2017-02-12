const routes = [
  {  path: '/', component: landing },
  {  name: "explore", path: '/e', component: explore },
  {  name: "content", path: '/c/:id', component: content }
]

const router = new VueRouter({
  // mode:"history", // will need to catch direct calls to routes if enabled
  routes // short for routes: routes
})

const app = new Vue({
  router
}).$mount('#main')
