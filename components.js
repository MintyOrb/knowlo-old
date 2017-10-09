
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
    props:['term', 'display'],
    data: () =>  {
      return {
        inSidebar: false,
        hovering: false,
        status: {
          pinnedIcon: false,
          includeIcon: false,
          excludeIcon: false,
          focusIcon: false,
          infoIcon: false,
          lensIcon: false,
        }
      }
    },
    methods: {
      name:function(uid,val){
        this.$http.put('/god/name/'+uid+'/'+ val).then(response => {
          if(response.body){
            Materialize.toast('changed name', 4000)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      order:function(termID,order){
        this.$http.put('/god/order/'+termID+'/'+ order +'/'+ this.$route.params.uid).then(response => {
          if(response.body){
            Materialize.toast('changed order', 4000)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      main: function(){
        this.status.includeIcon = !this.status.includeIcon;
        this.term.status = this.status;
        this.$emit('main', this.term)
      },
      remove: function(){
        this.status.removeIcon = !this.status.removeIcon;
        this.term.status = this.status;
        this.$emit('remove', this.term)
      },
      include: function(){
        this.status.includeIcon = !this.status.includeIcon;
        this.term.status = this.status;
        this.$emit('include', this.term)
      },
      exclude: function(){
        this.status.excludeIcon = !this.status.excludeIcon;
        this.term.status = this.status;
        this.$emit('exclude', this.term)
      },
      focus: function(){
        this.status.focusIcon = !this.status.focusIcon;
        this.term.status = this.status;
        this.status.includeIcon = true;
        this.$emit('focus', this.term)
      },
      pin: function(){
        this.status.pinnedIcon = !this.status.pinnedIcon;
        this.status.includeIcon = true;
        this.term.status = this.status;
        this.$emit('pin', this.term)
      },
      lens: function(){
        this.status.lensIcon = !this.status.lensIcon;
        this.term.status = this.status;
        this.$emit('lens', this.term)
      },
      delayHover: function(){
        this.left=false;
        window.setTimeout(()=>{
          if(!this.left){
              this.hovering=true
          }
        }, 150)
      },
      leave: function(){
        this.left=true;
        this.hovering=false;
      }
    },
    mounted: function(){
      this.$emit('created')
      if(this.term.status){
        this.status=this.term.status;
      }
      if(this.$parent.$el && this.$parent.$el._prevClass == 'termQuery'){ // stupid way to change css. cake component param/option instead
        this.inSidebar = true; // defaults to false
      }
    }
});
/*

888d888 .d88b.  .d8888b   .d88b.  888  888 888d888 .d8888b .d88b.
888P"  d8P  Y8b 88K      d88""88b 888  888 888P"  d88P"   d8P  Y8b
888    88888888 "Y8888b. 888  888 888  888 888    888     88888888
888    Y8b.          X88 Y88..88P Y88b 888 888    Y88b.   Y8b.
888     "Y8888   88888P'  "Y88P"   "Y88888 888     "Y8888P "Y8888
*/
Vue.component('resource',{
  template: "#resource",
  props:['re','display'],
  name: "resource",
  data: () =>  {
    return {
      voting: true
    }
  },
  methods:{
    trimNumber: function(num, digits) { // from http://stackoverflow.com/a/9462382/2061741 - displays number of views
      if(num && digits){
        var si = [ { value: 1E18, symbol: "E" }, { value: 1E15, symbol: "P" }, { value: 1E12, symbol: "T" }, { value: 1E9,  symbol: "G" }, { value: 1E6,  symbol: "M" }, { value: 1E3,  symbol: "k" }], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;
        for (i = 0; i < si.length; i++) {
          if (num >= si[i].value) {
            return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
          }
        }
        return num.toFixed(digits).replace(rx, "$1");
      }
    },
  },
  mounted: function(){

    if(this.voting){
      var slider = document.getElementById('test-slider' + this.re.resource.uid);
       noUiSlider.create(slider, {
        start: [.5],
        connect: [true,false],
        behavior: "tap-drag-hover",
        range: {
          'min': 0,
          'max': 1
        }
       });
    }
  }
})

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
  props:['ajaxUrl','inputId','exclude'],
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
        item.status = {includeIcon: true}; // having to add item.status here feels dumb.
        this.$emit('select', item)
      }
    },
    quickAdd: function(){
      this.$http.post('/api/set', {term: this.term, translation: this.translation}).then(response => {
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
        data: {exclude: this.exclude},
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
                        url: options.ajaxUrl + val +'/'+ this.exclude,
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

/*
 █████  ██████  ██████      ██████  ███████ ███████  ██████  ██    ██ ██████   ██████ ███████
██   ██ ██   ██ ██   ██     ██   ██ ██      ██      ██    ██ ██    ██ ██   ██ ██      ██
███████ ██   ██ ██   ██     ██████  █████   ███████ ██    ██ ██    ██ ██████  ██      █████
██   ██ ██   ██ ██   ██     ██   ██ ██           ██ ██    ██ ██    ██ ██   ██ ██      ██
██   ██ ██████  ██████      ██   ██ ███████ ███████  ██████   ██████  ██   ██  ██████ ███████
*/

const addResource = Vue.component('addResource',{
    template: "#addResource",
    props: ['member','type'],
    data: function() {
      return {
        synSetMeta: false,  // tag resource to set
        resouceMeta: false, // tag resource to resource
        flickRegistry: [],
        tags: [],
        resource:{ // these aren't all strings...
          core: {
            'displayType':"",
            'uid':"",
            'viewCount':"0",
            'viewTime':"",
            'dateAdded':"",
            // 'thumb': "", set on server
            'url': "", //just return english if not in language specified?
            'source':"",
            'mThumb':""
          },
          detail: {
            'title':"",
            'subtitle':"",
            'text':"",
            'description':"",
            'url':"",
            // 'languageCode': this.member.languageCode,
          }
        },
      }
    },
    methods:{
      open: function(){
        $('#addResourceModal').modal({
          dismissible: true, // Modal can be dismissed by clicking outside of the modal
          opacity: .5, // Opacity of modal background
          inDuration: 300, // Transition in duration
          outDuration: 200, // Transition out duration
          // startingTop: '4%', // Starting top style attribute
          ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            // $('body').css("overflow","hidden")

          },
          complete: () => {
            $('.addNav').flickity('destroy');
            $('.addSections').flickity('destroy');
            // $('body').css("overflow","auto")

            this.$emit('close')
          }
        }).modal('open');

        $('.addNav').flickity({
          asNavFor: '.addSections',
          pageDots: true,
          prevNextButtons: true,
          accessibility: false, // to prevent jumping when focused
        })

        $('.addSections').flickity({
          // asNavFor: '.termNav',
          wrapAround: true,
          pageDots: false,
          prevNextButtons: true,
          accessibility: false, // to prevent jumping when focused
          dragThreshold: 20 // play around with this more?
        });
      },
      tagToResource: function(){ // connect to the currently viewed resource
        if(this.resource.core.uid.length > 0){
          this.$http.put('/api/resource/'+this.$route.params.uid+'/discussion/'+this.resource.core.uid).then(response => {
            if(response.body){
              console.log('tagged to resource')
            } else {
              Materialize.toast('Something went wrong...', 4000)
            }
          }, response => {
             Materialize.toast('Something went wrong...are you online and logged in?', 4000)
          });
        } else {
          Materialize.toast('Add a resource before taggging!', 4000)
        }
      },
      tagToSet: function(){ // connect to the currently viewed synSet
        if(this.resource.core.uid.length > 0){
          this.$http.put('/api/set/'+this.$route.params.uid+'/meta/'+this.resource.core.uid,{type: this.type}).then(response => {
            if(response.body){
              console.log('tagged to set')
            } else {
              Materialize.toast('Something went wrong...', 4000)
            }
          }, response => {
             Materialize.toast('Something went wrong...are you online and logged in?', 4000)
          });
        } else {
          Materialize.toast('Add a resource before taggging!', 4000)
        }
      },
      addTag: function(term){ // add tag(s) to the newly created resource
        if(this.resource.core.uid.length > 0){
          this.$http.put('/api/resource/'+this.resource.core.uid+'/set/'+term.setID).then(response => {
            if(response.body){
              this.tags.push(term)
            } else {
              Materialize.toast('Something went wrong...', 4000)
            }
          }, response => {
             Materialize.toast('Something went wrong...are you online and logged in?', 4000)
          });
        } else {
          Materialize.toast('Add a resource before tagging!', 4000)
        }
      },
      removeTag: function(uid) {
        this.$http.delete('/api/resource/'+this.resource.core.uid+'/set/'+uid).then(response => {
          if(response.body){
            this.tags.splice(this.tags.findIndex( (term) => term.term.uid === uid) ,1)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online and logged in?', 4000)
        });
      },
      close: function(){
        console.log("close here after esc")
      },
      checkURL: function(){
        // parse youtube/vimeo/other....set display type?....settime to view

      },
      upsertResource(){
        // create resource if no ID
        //TODO: update by prop?

        this.$http.post('/resource', {resource:this.resource}).then(response => {
          if(response.body){
            this.resource.core = response.body;
            console.log(response.body)

            //TODO: add/sugest relevant terms based on response?

            if(this.resourceMeta){
              this.tagToResource();
              // need to format like resource to push
              // could re-fetch on add but won't look as good to re-load all vs adding one.
              var holder ={};
              holder.resource=this.resource.core;
              for(pindex in this.resource.detail){
                holder.resource[pindex] = this.resource.detail[pindex]
              }
              console.log(holder)
              $('.addSections').flickity('selectCell', 1, true, false )//  value, isWrapped, isInstant
              this.$emit('added',holder)
            } else if (this.synSetMeta){
              this.tagToSet();
              // need to format like resource to push
              // could re-fetch on add but won't look as good to re-load all vs adding one.
              var holder ={};
              holder.resource=this.resource.core;
              for(pindex in this.resource.detail){
                holder.resource[pindex] = this.resource.detail[pindex]
              }
              this.$emit('added',holder)
            }
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      }
    },
    mounted: function(){

      if(this.$route.name=='resourceSub'){ //take in as param?
        this.resourceMeta=true;
        $('#addResourceModal').css("position","sticky")
      } else if (this.$route.name=='setSub'){
        this.synSetMeta=true;
        $('#addResourceModal').css("position","sticky")
      } // else connect to neither (standalone resource)

      this.open();
      $('.modal-overlay').eq(1).appendTo('.resource-modal'); // workaround for stacking context
      $('.modal-overlay').eq(0).appendTo('#termModal'); // workaround for stacking context
      console.log(this.$route.params.uid)
      // question
      // insight
      // criticism
      // praise?

  },
  beforeRouteLeave: function (to, from, next){
    if($('#addResourceModal')){
      $('#addResourceModal').modal('close');
    }
    $('.modal-overlay').remove();

    window.setTimeout(()=>{
      next()
    }, 375)

    document.removeEventListener('keydown',function(){})
  }
});
