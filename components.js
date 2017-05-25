
/*
████████ ███████ ██████  ███    ███
   ██    ██      ██   ██ ████  ████
   ██    █████   ██████  ██ ████ ██
   ██    ██      ██   ██ ██  ██  ██
   ██    ███████ ██   ██ ██      ██
*/
Vue.component('term',{
    template: "#termContainer",
    name: "term",
    props:['term'],
    data: () =>  {
      return {
        flickRegistry: [],
        inSidebar: false,
        pinned: false,
        hover: false,
        include: false,
        exclude: false,
        focus: false,
        expanded: false,
        info: false
      }
    },
    methods: {
      remove: function(){
        this.$emit('remove', this.term.term.uid)
      },
      addFromSub: function(term){ // there must be a better way to add sub term...
        bus.$emit('addtermSubterm', term)
      },
      focus: function(){
        console.log(this.term)
        // router.push("/t/"+term.name)
      },
      pin: function(){
        this.pinned = !this.pinned;
      },
      addToFrom: function(term, type){
        if(term[type] == undefined){
          term[type] = true; // need to add logic for combinations... ex: can't be both inclded and excluded. Track with string instead?.type = "exclude"
        } else {
          term[type] = !term[type]
        }
        if(term.expanded){
            this.destroySingleFlickity(term.name)
            term.expanded = false;
        }
        this.hover = false;
        this.$emit('add-me')
      },
      createFlickity: function(id){
        this.flickRegistry.push(id);// register flick

        setTimeout(()=>{ // allow time for size change
          $('.flickContainer' + id).flickity({
            wrapAround: true,
            pageDots: true,
            prevNextButtons: true,
            accessibility: false, // to prevent jumping when focused
          });
          this.$emit('lay-me')
          }, 10);

        },
        destroySingleFlickity: function(id){
          window.setTimeout(()=>{
            $('.flickContainer' + id).flickity('destroy');
            for(index in this.flickRegistry){
              if(this.flickRegistry[index] == id){
                this.flickRegistry.splice(index,1)
                break
              }
            }
          },1000)
        },
        destroyAllFlickity: function(){
          for(var index in this.flickRegistry){
            this.destroySingleFlickity(this.flickRegistry[index]);
          }
          this.flickRegistry=[];
        },
        delayHover: function(){
          this.left=false;
          window.setTimeout(()=>{
            if(!this.left){
                this.hover=true
            }
          }, 150)
        },
        leave: function(){
          this.left=true;
          this.hover=false;
        }
    },
    mounted: function(){
      this.$emit('created')
      if(this.$parent.$el && this.$parent.$el._prevClass == 'termQuery'){ // stupid way to change css. cake component param/option instead
        this.inSidebar = true; // defaults to false
      }
    }
});

var bus = new Vue() // this feels dumb, but can't see how else to tell explore what sub term was added

/*
        █████  ██    ██ ████████  ██████   ██████  ██████  ███    ███ ██████  ██      ███████ ████████ ███████
       ██   ██ ██    ██    ██    ██    ██ ██      ██    ██ ████  ████ ██   ██ ██      ██         ██    ██
       ███████ ██    ██    ██    ██    ██ ██      ██    ██ ██ ████ ██ ██████  ██      █████      ██    █████
       ██   ██ ██    ██    ██    ██    ██ ██      ██    ██ ██  ██  ██ ██      ██      ██         ██    ██
       ██   ██  ██████     ██     ██████   ██████  ██████  ██      ██ ██      ███████ ███████    ██    ███████
*/
//<!-- ajax auto complete adapted from  http://stackoverflow.com/a/42757285/2061741 -->
Vue.component('autocomplete',{
    template: "#autocomplete",
    props:['ajaxUrl','inputId'],
    name: "autocomplete",
    data: () =>  {
      return {
        addWithDetail: false,
        suggestions:[],
        input:"",
        hidden:false,
        term: {
          url: "",
          english: ""
        },
        translation: {
          name: "",
          definition: "",
          languageCode: 'en' // don't hard code this you idiot
        }
      }
    },
    methods:{
      pick: function(item){
        this.input = '';
        this.suggestions=[]
        if(item.translation.name.indexOf("Create new term:") > -1){ // if term needs to be created
          this.term.english = this.translation.name = item.translation.name.substr(17).trim()
          if(this.addWithDetail){
            router.push('/addTerm/'+this.translation.name)
          } else {
            this.quickAdd();
          }
        } else {
          item.status = {}; // having to add item.status here feels dumb. (otherwise term.status.expanded can't be read)
          this.$emit('select', item)
        }
      },
      quickAdd: function(){
        this.$http.post('/api/term', {term: this.term, translation: this.translation}).then(response => {
          if(response.body.term){
            this.$emit('select', response.body)
            Materialize.toast("'" + response.body.translation.name+ "'" + ' added!', 3000)
          } else {
            Materialize.toast('Something went wrong...term not added.', 4000)
          }
        }, response => {
            if(response.status = 401){
              Materialize.toast('You must be logged in to add a term!', 4000)
              $('#login-modal').modal('open')
            } else {
              Materialize.toast('Something went wrong...are you online?', 4000)
            }
        });

      },
      hide(){ // need to time out because otherwise the li is hidden before selected() fires on click
        window.setTimeout(()=>{
            this.hidden=true
        }, 250)
      }
    },
    mounted:function(){

      var options = {
          inputId: this.inputId || 'autocomplete-input',
          ajaxUrl: this.ajaxUrl || '/term/autocomplete/',
          data: {},
          minLength: 1
      };

      var $input = $("#" + options.inputId);

      if (options.ajaxUrl) {
          var $autocomplete = $('#ac'),
              request,
              runningRequest = false,
              timeout,
              liSelected;

          $input.on('keyup', (e) => {

              if (timeout) { // comment to remove timeout
                  clearTimeout(timeout);
              }

              if (runningRequest) {
                  request.abort();
              }

              if (e.which === 13 && this.input.length > 0 && liSelected[0]) { // select element with enter key
                  liSelected[0].click();
                  return;
              }

              // scroll ul with arrow keys
              if (e.which === 40) { // down arrow
                  if (liSelected) {
                      liSelected.removeClass('selected');
                      next = liSelected.next();
                      if (next.length > 0) {
                          liSelected = next.addClass('selected');
                      } else {
                          liSelected = $autocomplete.find('li').eq(0).addClass('selected');
                      }
                  } else {
                      liSelected = $autocomplete.find('li').eq(0).addClass('selected');
                  }
                  return; // stop new AJAX call
              } else if (e.which === 38) { // up arrow
                  if (liSelected) {
                      liSelected.removeClass('selected');
                      next = liSelected.prev();
                      if (next.length > 0) {
                          liSelected = next.addClass('selected');
                      } else {
                          liSelected = $autocomplete.find('li').last().addClass('selected');
                      }
                  } else {
                      liSelected = $autocomplete.find('li').last().addClass('selected');
                  }
                  return;
              }

              // escape these keys
              if (e.which === 9 || // tab
                  e.which === 16 || // shift
                  e.which === 17 || // ctrl
                  e.which === 18 || // alt
                  e.which === 20 || // caps lock
                  e.which === 35 || // end
                  e.which === 36 || // home
                  e.which === 37 || // left arrow
                  e.which === 39) { // right arrow
                  return;
              } else if (e.which === 27) { // Esc. Close ul
                  return;
              }

              var val = $input.val().toLowerCase();
              if (val.length > options.minLength) {

                  timeout = setTimeout(() => { // comment this line to remove timeout
                      runningRequest = true;
                      request = $.ajax({
                          type: 'GET',
                          url: options.ajaxUrl + val,
                          success: (data) => {
                              this.suggestions = data;
                              // hide "create new" if a match is found
                              if (Object.values(this.suggestions).findIndex(item => this.input.toLowerCase().trim() == item.translation.name.toLowerCase().trim())) {
                                  this.suggestions.push({
                                      term:{},
                                      translation :{
                                        name: "Create new term: " + this.input
                                      },
                                      new: true
                                  })
                              }
                          },
                          complete: function() {
                              runningRequest = false;
                          }
                      });
                  }, 250); // comment this line to remove timeout
              }
          });
      }
  }
})

/*
███    ██ ███████ ██     ██     ████████ ███████ ██████  ███    ███
████   ██ ██      ██     ██        ██    ██      ██   ██ ████  ████
██ ██  ██ █████   ██  █  ██        ██    █████   ██████  ██ ████ ██
██  ██ ██ ██      ██ ███ ██        ██    ██      ██   ██ ██  ██  ██
██   ████ ███████  ███ ███         ██    ███████ ██   ██ ██      ██
*/
const addTerm = Vue.component('addTerm',{
    template: "#addTerm",
    props: ['member'],
    data: function() {
      return {
        term:{
          id: undefined,
          url:"",
          english:""
        },
        translation: {
          definition:"",
          name:"",
          languageCode: 'en' // again, shouldn't be hard coding this.
        },
        syns: [],
        groups: [],
        contains: []
      }
    },
    methods:{
      createTerm: function(){
        this.$http.post('/api/term', {term: this.term, translation:this.translation}).then(response => {
          if(response.body){
            console.log(response.body)
            this.term.uid = response.body.term.uid
            router.replace('/addTerm/'+response.body.translation.name+"/"+response.body.term.uid)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      addSynonym: function(termID, synID){
        this.$http.put('/api/term/'+ termID +'/synonym/'+ synID).then(response => {
          if(response.body){
            console.log(response.body)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      }
    },
    mounted: function(){

      $('#addTermModal').modal({
        dismissible: true, // Modal can be dismissed by clicking outside of the modal
        opacity: .5, // Opacity of modal background
        inDuration: 300, // Transition in duration
        outDuration: 200, // Transition out duration
        startingTop: '4%', // Starting top style attribute
        endingTop: '10%', // Ending top style attribute
        ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
          $('body').css("overflow","hidden")
        },
        complete: (some) => {
          $('body').css("overflow","auto")
          router.go(-1) || router.push('/')
        }
    }).modal('open');

    this.translation.name = this.term.english = this.$route.params.translation;
    if(this.$route.params.termID){
      this.term.uid = this.$route.params.termID
    } else {
      this.createTerm() // will alert if not logged in...
    }

    bus.$on('login', (member) => { // if user freshly loads page, wait for user auth to come back
      if(!this.$route.params.termID){
        if(member){
          this.createTerm()
        } else {
          Materialize.toast('You must be logged in to add a term!', 4000);
          window.setTimeout(()=>{
              $('#login-modal').modal('open');
          },1500)
        }
      }
    })
  }
});
