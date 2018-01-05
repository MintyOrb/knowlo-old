
/*
████████ ███████ ██████  ███    ███     ██████   █████   ██████  ███████
   ██    ██      ██   ██ ████  ████     ██   ██ ██   ██ ██       ██
   ██    █████   ██████  ██ ████ ██     ██████  ███████ ██   ███ █████
   ██    ██      ██   ██ ██  ██  ██     ██      ██   ██ ██    ██ ██
   ██    ███████ ██   ██ ██      ██     ██      ██   ██  ██████  ███████
*/
const termComp = Vue.component('termComp',{
    template: "#termTemplate",
    props: ['termQuery','member'],
    data: function() {
      return {
        term: {name: 'default',translation:{name:''},term:{iconURL:""}},
        termDisplay: 'list',
        modalOpen: false,
        addResource:false,
        addResourceType: '',
        definitions: [],
        translations:[],
        synonyms: [],
        groups: [],
        within: [],
        contains: [],
        icons:[],
        definitions:[],
        termSection: ["Icon","Definition","Synonyms","Within","Contains","Translations"] //stats? vote? member's relation? definition?
      }
    },
    methods:{
       init: function(){
         this.$http.get('/set/' + this.$route.params.uid, {params: { languageCode: 'en'}}).then(response => {
           if(response.body.term){
             response.body.term.name = response.body.translation.name
             response.body.term.status = {};
             this.term = response.body;
             this.$route.params.name
             this.term.setID = this.$route.params.uid;
             this.fetchSynonyms();
             this.fetchWithin();
             this.fetchContains();
             this.fetchTranslations();
             this.fetchMeta('definition');
             this.fetchMeta('icon');
           } else {
             Materialize.toast('Resource not found.', 4000)
           }
           if(!this.modalOpen){
             this.openModal()
           }
         }, response => {
           if(!this.modalOpen){
             this.openModal()
           }
           Materialize.toast('Something went wrong...are you online?', 4000)
         });
      },
      openModal: function(){
        this.modalOpen = true;
        this.$nextTick(function(){
            $('#termModal').modal({
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
                if(  $('.metaNav').flickity()){
                  $('.metaNav').flickity('destroy');
                  $('.termSections').flickity('destroy');
                }
                $('body').css("overflow","auto")
                router.push("/");
              }
            }).modal('open');
          })
      },
      evalTopTerm: function(){
        const top = this.icons.reduce(function(prev, current) {
            return (prev.globalVote.quality > current.globalVote.quality) ? prev : current
        })
        if(top.resource.mThumb != this.term.term.iconURL && top.globalVote.quality !== null){
          // triggering new top icon from the front end is probably stupid.
          this.term.term.iconURL = top.resource.mThumb;
          this.$http.put('/api/set/'+ this.term.setID +'/'+ top.resource.uid + '/newTopIcon').then(response => {
              Materialize.toast('New top icon!', 4000)
          }, response => {
             Materialize.toast('Something went wrong...are you online?', 4000)
          });
        }
      },
      newMeta: function(a,b){
        if(this.addResourceType == 'definition'){
          this.definitions.push(a)
        } else if(this.addResourceType == 'icon'){
          this.icons.push(a)
        }
      },
      fetchMeta: function(type){
        if(this.member.uid != null){
          this.$http.get('/api/set/' + this.$route.params.uid + '/meta/', {params: { languageCode: 'en', type: type }}).then(response => {
            if(type=='definition'){
              this.definitions=response.body;
            } else if (type=='icon'){
              this.icons=response.body;
            }
          }, response => {
            Materialize.toast('Something went wrong...are you online?', 4000)
          });
        } else {
          this.$http.get('/set/' + this.$route.params.uid + '/meta/', {params: { languageCode: 'en', type: type }}).then(response => {
            if(type=='definition'){
              this.definitions=response.body;
            } else if (type=='icon'){
              this.icons=response.body;
            }
          }, response => {
            Materialize.toast('Something went wrong...are you online?', 4000)
          });
        }
      },
      fetchTranslations: function() {
        this.$http.get('/set/' + this.$route.params.uid + '/translation/', {params: { languageCode: 'en'}}).then(response => {
          if(response.body.length > 0){
            this.translations = response.body;
          } else {
            Materialize.toast('Translations not found.', 4000)
            this.translations = []
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      fetchSynonyms: function() {
        this.$http.get('/set/' + this.$route.params.uid + '/synonym/', {params: { languageCode: 'en'}}).then(response => {
          if(response.body.length > 0){
            this.synonyms = response.body;
          } else {
            Materialize.toast('Synonyms not found.', 4000)
            this.synonyms = []
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      addSynonym: function(synonym){ // TODO: this merges sets...need a separate method for adding term to set
        this.$http.put('/api/set/'+ this.term.setID +'/synonym/'+ synonym.setID).then(response => {
          if(response.body){
            Materialize.toast('Added!', 4000)
            this.synonyms.push(synonym)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      removeSynonym: function(synUID){
        this.$http.delete('/api/set/'+ this.term.setID +'/synonym/'+ synUID).then(response => {
          if(response.body){
            Materialize.toast('Removed!', 4000)
            this.synonyms.splice(this.synonyms.findIndex( (term) => term.term.uid === synUID) ,1)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      fetchWithin: function(){
        this.$http.get('/set/' + this.term.setID + '/within/', {params: { languageCode: 'en'}}).then(response => {
          if(response.body.length > 0){
            this.within = response.body;
          } else {
            this.within = []
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      addWithin: function(within){
        this.$http.put('/api/set/'+ this.term.setID +'/within/'+ within.term.uid).then(response => {
          if(response.body){
            Materialize.toast('Added!', 4000)
            this.within.push(within)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      removeWithin: function(uid){
        this.$http.delete('/api/set/'+ this.term.setID +'/within/'+ uid).then(response => {
          if(response.body){
            Materialize.toast('Removed!', 4000)
            this.within.splice(this.within.findIndex( (term) => term.term.uid === uid) ,1)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      fetchContains: function(){
        this.$http.get('/set/' + this.term.setID + '/contains/', {params: { languageCode: 'en'}}).then(response => {
          if(response.body.length > 0){
            this.contains = response.body;
          } else {
            Materialize.toast('Contains no terms.', 4000)
            this.contains = []
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      addContains: function(contains){
        this.$http.put('/api/set/'+ this.term.setID +'/contains/'+ contains.term.uid).then(response => {
          if(response.body){
            Materialize.toast('Added!', 4000)
            this.contains.push(contains)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      removeContains: function(uid){
        this.$http.delete('/api/set/'+ this.term.setID +'/contains/'+ uid).then(response => {
          if(response.body){
            Materialize.toast('Removed!', 4000)
            this.contains.splice(this.contains.findIndex( (term) => term.term.uid === uid) ,1)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      deleteSet(uid){
        this.$http.delete('/api/set/'+ uid ).then(response => {
          if(response.body){
            Materialize.toast('Set deleted.', 4000)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      addToQuery: function(item){
          this.$emit('add',item);
          $('#termModal').modal('close');
      }
    },
    mounted: function(){
      this.init();
      $('.metaNav').flickity({
        asNavFor: '.termSections',
        pageDots: false,
        prevNextButtons: false,
        accessibility: false, // to prevent jumping when focused
      })

      $('.termSections').flickity({
        wrapAround: true,
        pageDots: false,
        prevNextButtons: true,
        accessibility: false, // to prevent jumping when focused
        dragThreshold: 20 // play around with this more?
      });

      // TODO: set flickity tab in URL
      $('.termSections').flickity('selectCell', 1, true, true ) //  value, isWrapped, isInstant

  },
  beforeRouteLeave: function (to, from, next){
    $('body').css("overflow","auto");
    if($('.modal-overlay')){
      $('.modal-overlay').remove();
    }
    window.setTimeout(()=>{
      next()
    }, 375)
  },
  watch: {
    '$route.params.uid': function (id) {
      this.init();
    },
    member: function() { // re-fetch on member login/logout
      this.$nextTick(x=>{
        this.fetchMeta('definition');
        this.fetchMeta('icon');
      })
    }
  }
});



/*
██████  ███████ ███████  ██████  ██    ██ ██████   ██████ ███████     ██████   █████   ██████  ███████
██   ██ ██      ██      ██    ██ ██    ██ ██   ██ ██      ██          ██   ██ ██   ██ ██       ██
██████  █████   ███████ ██    ██ ██    ██ ██████  ██      █████       ██████  ███████ ██   ███ █████
██   ██ ██           ██ ██    ██ ██    ██ ██   ██ ██      ██          ██      ██   ██ ██    ██ ██
██   ██ ███████ ███████  ██████   ██████  ██   ██  ██████ ███████     ██      ██   ██  ██████  ███████
*/
const resourceComp = Vue.component('resourceComp',{
    template: "#resourceTemplate",
    props: ['member'],
    data: function() {
          return {
              resource: {uid: undefined},
              terms: [], // current resources terms
              discussion: [], // resources within discussion
              related: [], // resources related to current resource
              discussionDisplay: 'card', // default display for discussion
              resourceSection: ["Discussion","Detail","Tokens","Related"],
              addResource:false,
              addResourceType: '',
              modalOpen: false,
              discussionFilter: ["insight","question","criticism","quote"], // which types of discussions should be displayed
              tempIntervalID: '', // ID for layout() set interval (fix layout if images are loaded)
              filterIDs: { // setIDS for filtering by switch
                'insight':'rJxPWooTO-',
                'question':'B1pnQsYW-',
                'quote':'BkF3xoFW-',
                'criticism':'rJxYeYW43b',
              },
            }
          },
    methods: {
      close: function(){
        $('#resourceModal'+this.resource.uid).modal('close')
      },
      changeDisplay: function(disp){
        this.discussionDisplay = disp
        // weird to wrap a timeout with next tick, but css lags and screws up the layout after transistion
        this.$nextTick(function(){
          window.setTimeout(()=>{
            this.$refs.discussionBin.layout('masonry');
            this.$refs.relatedBin.layout('masonry');
          }, 375)
        })
      },
      fetchResource: function(){
        this.$http.get('/resource/' + this.$route.params.uid + '/full', {params: { languageCode: 'en'}}).then(response => {
          if(response.body.resource){
            this.resource = response.body.resource;
            this.terms = response.body.terms;
            this.determineResourceDisplay();
          } else {
            Materialize.toast('Resource not found.', 4000)
          }
          this.init()
        }, response => {
          this.init()
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      determineResourceDisplay: function(){
        if(this.resource.url){
          if(this.resource.url.match(/[^/]+(jpg|png|gif|jpeg)$/)){
            this.resource.displayType = 'image'
          } else if(this.resource.url.match(/[^/]+(gifv|webm|mp4)$/)){
            this.resource.displayType = 'video'
          } else if(this.resource.url.indexOf('youtube') > -1){
            this.resource.ytID = new URL(this.resource.url).searchParams.get('v')
            this.resource.displayType = 'embed'
          }
        } else if(this.resource.hasOwnProperty('null')){ // not sure why it has the null prop to begin with...
          this.resource.displayType = 'icon'
        } else {
          this.resource.displayType = 'text'
        }
      },
      init: function(){
          this.fetchDiscussion();
          this.fetchRelated(); //TODO: only fetch when on related panel
          this.$nextTick(function(){
            if(!this.modalOpen){
              this.modalOpen=true;
              $('.metaNav').flickity({
                asNavFor: '.resourceSections',
                selectedAttraction: 0.2,
                friction: 0.8,
                // wrapAround: true,
                // pageDots: false,
                prevNextButtons: false,
                contain: true,
                // freeScroll: true,
                accessibility: false, // to prevent jumping when focused
              })

              $('.resourceSections').flickity({
                wrapAround: true,
                pageDots: false,
                prevNextButtons: true,
                selectedAttraction: 0.2,
                friction: 0.8,
                accessibility: false, // to prevent jumping when focused
                dragThreshold: 20 // play around with this more?
              });
              $('#resourceModal'+this.resource.uid).modal({
                opacity: .5, // Opacity of modal background
                inDuration: 300, // Transition in duration
                outDuration: 200, // Transition out duration
                startingTop: '4%', // Starting top style attribute
                endingTop: '10%', // Ending top style attribute
                ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                  $('body').css("overflow","hidden")
                },
                complete: () => {
                  router.push("/");
                }
              }).modal('open');
            }
            if(this.resource.displayType == "image"){
              this.initImage();
            }
          })

      },
      fetchDiscussion: function(){
        this.discussion=[];
        this.$http.get('/resource/' + this.$route.params.uid + '/discussion', {params: { languageCode: 'en'}}).then(response => {
          if(response.body.length>0){
            this.discussion = response.body;
          }
        }, response => {
          // Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      addCreatedDiscussion: function(dis){
        this.discussion.push(dis)
      },
      layout: function(){
        this.$refs.relatedBin.layout('masonry');
      },
      fetchRelated: function(){
        this.$nextTick(()=>{
          this.$http.get('/resource/' + this.$route.params.uid + '/related', {params: { languageCode: 'en'}}).then(response => {
            this.related = response.body;
            window.setTimeout(()=> {
              this.layout();
            }, 250)
          }, response => {
            // Materialize.toast('Something went wrong...are you online?', 4000)
          });
        })

      },
      addTerm: function(set){
        this.$http.put('/api/resource/'+ this.resource.uid +'/set/'+ set.setID).then(response => {
          if(response.body){
            Materialize.toast('term added', 4000)
            this.terms.push(set)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      removeTerm: function(setUID){
        this.$http.delete('/api/resource/'+ this.resource.uid +'/set/'+ setUID).then(response => {
          if(response.body){
            Materialize.toast('term removed.', 4000)
            this.terms.splice(this.terms.findIndex( (set) => set.setID === setUID) ,1)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      addToQuery: function(item){
          this.$emit('add',item)
      },
      discussionIsotope: function() {
        return {
          getFilterData: {
            "type": el => {
              var setIDs = [] // ids of filter sets
              // with name of sets, get ids from object with names and ides
              for(nameIndex in this.discussionFilter){
                if(this.filterIDs[this.discussionFilter[nameIndex]]){
                  setIDs.push(this.filterIDs[this.discussionFilter[nameIndex]])
                }
              }
              return el.setIDs.some(x => {
                return setIDs.includes(x);
              })
            }
          },
        }
      },
      initImage: function(){
        // from http://kempe.net/blog/2014/06/14/leaflet-pan-zoom-image.html
        if(window.map){ // remove previous map, if any (necessary for transistion from one image resource to another)
          map.remove();
        }
        window.map = L.map('image-map', {
          minZoom: 1,
          maxZoom: 4,
          center: [0, 0],
          zoom: 2,
          crs: L.CRS.Simple
        });

        // dimensions of the image
        var w = 2000,
            h = 1500,
            url = this.resource.url
        var img = new Image();
        img.onload = function() {
          map.removeLayer(preLoad);
          var southWest = map.unproject([0, this.height], map.getMaxZoom()-1);
          var northEast = map.unproject([this.width, 0], map.getMaxZoom()-1);
          var bounds = new L.LatLngBounds(southWest, northEast);

          // add the image overlay,
          // so that it covers the entire map
          L.imageOverlay(url, bounds).addTo(map);
          map.setMaxBounds(bounds);
        }
        img.src=url;
        // calculate the edges of the image, in coordinate space
        var southWest = map.unproject([0, h], map.getMaxZoom()-1);
        var northEast = map.unproject([w, 0], map.getMaxZoom()-1);
        var bounds = new L.LatLngBounds(southWest, northEast);

        // add the image overlay,
        // so that it covers the entire map
        var preLoad = L.imageOverlay(url, bounds).addTo(map);

        // tell leaflet that the map is exactly as big as the image
        map.setMaxBounds(bounds);
      },
      markViewed: function(){
        this.$http.put('/api/resource/'+ this.$route.params.uid +'/viewed').then(response => {

        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      }
    },
    mounted: function(){

      this.fetchResource();
      if(this.member.uid){
        window.setTimeout( ()=> {
            this.markViewed();
        }, 5000); // 5 seconds is pretty arbitrary...
      }
      // workaround as long as imagesLoaded() non-functional
      this.tempIntervalID = setInterval(x => {
        this.layout();
      }, 3000);

      $('.dropdown-button').dropdown({
           inDuration: 300,
           outDuration: 225,
           constrainWidth: false, // Does not change width of dropdown to that of the activator
           hover: true, // Activate on hover
           gutter: 0, // Spacing from edge
           belowOrigin: false, // Displays dropdown below the button
           alignment: 'right', // Displays dropdown with edge aligned to the left of button
           stopPropagation: false // Stops event propagation
         }
       );

    },
    beforeRouteLeave: function (to, from, next){
      $('body').css("overflow","auto");
      if($('.modal-overlay')){
        $('.modal-overlay').remove();
      }
      clearInterval(this.tempIntervalID)
      next();
    },
    watch: {
      '$route.params.uid': function () {
        this.fetchResource();
      },
      discussionFilter: function (a,b) {
        if(this.$refs.discussionBin){ // don't try to filter when there are no comments
          this.$refs.discussionBin.filter('type');
        }
      },
      'member': function (member) {
        if(member.uid){
          this.$nextTick(()=>{
            this.markViewed();
          })
        }
      }
    }
});

/*
                                     888
                                     888
                                     888
88888b.d88b.   .d88b.  88888b.d88b.  88888b.   .d88b.  888d888      88888b.   8888b.   .d88b.   .d88b.
888 "888 "88b d8P  Y8b 888 "888 "88b 888 "88b d8P  Y8b 888P"        888 "88b     "88b d88P"88b d8P  Y8b
888  888  888 88888888 888  888  888 888  888 88888888 888          888  888 .d888888 888  888 88888888
888  888  888 Y8b.     888  888  888 888 d88P Y8b.     888          888 d88P 888  888 Y88b 888 Y8b.
888  888  888  "Y8888  888  888  888 88888P"   "Y8888  888          88888P"  "Y888888  "Y88888  "Y8888
                                                                    888                    888
                                                                    888               Y8b d88P
                                                                    888                "Y88P"
*/
const memberPage = Vue.component('memberPage',{
    template: "#memberPageTemplate",
    props: ['member'],
    data: function() {
          return {
              memberSection: ["Time By Discpline","Stats","History","Top Terms"],
              history: [],
              top:[],
              scale:{all:[]},
              mem:{globalVote:{quality:0,complexity:0}},
              modalOpen: false
            }
          },
    methods: {
      fetchSets: function(){
        this.$http.get('/member/' + this.$route.params.uid+'/set/Bylx_hVBa-').then(response => {
          if(response.body){
            this.scale.all=response.body;
            this.scale.data=[]
            this.scale.labels=[]
            this.scale.all.forEach(x=>{
              this.scale.data.push(x.count)
              this.scale.labels.push(x.translation.name)
              x['connections'] = x.count;
            })
            this.scale.dataLabel=' '
          } else {
            Materialize.toast('Member not found.', 4000)
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      addToQuery: function(item){
          this.$emit('add',item)
      },
      fetchTop: function(){
        this.$http.get('/member/' + this.$route.params.uid+'/set/top').then(response => {
          if(response.body){
            this.top=response.body;
            this.top.forEach(x=>{
              x['connections'] = x.count;
            })
          } else {
            Materialize.toast('Member not found.', 4000)
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      fetchHistory: function(){
        this.$http.get('/member/' + this.$route.params.uid + '/history').then(response => {
          if(response.body){
            this.history=response.body;
            this.$nextTick(()=>{
              window.setTimeout( ()=> {
                this.$refs.seenBin.layout('masonry');
              }, 1000);
            })
          } else {
            Materialize.toast('History not found.', 4000)
          }
        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      fetchMember: function(){
        this.$http.get('/member/' + this.$route.params.uid).then(response => {
          if(response.body){
            this.mem=response.body;
            this.mem.joined= new Date(this.mem.joined).toLocaleDateString();

          } else {
            Materialize.toast('Member not found.', 4000)
          }
          this.init()
        }, response => {
          this.init()
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      init: function(){
        this.fetchSets();
        this.fetchTop();
        this.fetchHistory();
        this.$nextTick(function(){

          if($('.metaNav').flickity() && $('.resourceSections').flickity()){
            $('.metaNav').flickity('destroy');
            $('.resourceSections').flickity('destroy');
          }

          $('.metaNav').flickity({
            asNavFor: '.resourceSections',
            // wrapAround: true,
            pageDots: false,
            prevNextButtons: false,
            contain: true,
            // freeScroll: true,
            accessibility: false, // to prevent jumping when focused
          })

          $('.resourceSections').flickity({
            wrapAround: true,
            pageDots: false,
            prevNextButtons: true,
            accessibility: false, // to prevent jumping when focused
            dragThreshold: 20 // play around with this more?
          });
          if(!this.modalOpen){
            this.modalOpen=true;
            $('#memberModal'+this.member.uid).modal({
                opacity: .5, // Opacity of modal background
                inDuration: 300, // Transition in duration
                outDuration: 200, // Transition out duration
                startingTop: '4%', // Starting top style attribute
                endingTop: '10%', // Ending top style attribute
                ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
                  $('body').css("overflow","hidden")
                },
                complete: () => {
                  router.push("/");
                }
              }).modal('open');
            }
        })

      },

    },
    mounted: function(){
      if(this.member.uid){
        this.fetchMember();
      }

    },
    beforeRouteLeave: function (to, from, next){
      $('.modal-overlay').remove(); // needed if navigating from member page to set page
      $('body').css("overflow","auto");
      next();
    },
    watch: {
      '$route.params.uid': function (id) {
        this.fetchMember();
      },
      member: function(current){
        if(current.uid){
          this.fetchMember();
        }
      }
    }
});

/*
███████ ██   ██ ██████  ██       ██████  ██████  ███████
██       ██ ██  ██   ██ ██      ██    ██ ██   ██ ██
█████     ███   ██████  ██      ██    ██ ██████  █████
██       ██ ██  ██      ██      ██    ██ ██   ██ ██
███████ ██   ██ ██      ███████  ██████  ██   ██ ███████
*/
const explore = Vue.component('exploreComp',{
  template: "#exploreTemplate",
  props: ['termQuery','member'],
  data: function() {
        return {
            db: null,                           // search results to display - array of material objects
            loginCheck: false,                  // true after login status is checked
            crossSection: null,                 // object containing the name of the cross section and terms in lens group - object containing array of term objects and string name
            termSuggestions: [],                // holds suggestion groups and terms within
            suggestionDisplay: "",              // the name of the currently selected display for term suggestions
            suggestions: [],                    // suggested terms - array of term objects
            resources: [],                      // db when no lens, replace with db even though less items? - array of term objects
            showViewed: false,                  // whether or not viewed resources should be returned.
            resourcesRelated: null,             // total number of resources related
            resourcesViewed: null,              // number of related resources logged in member has viwed
            resourceDisplay: null,              // display option for materials in search result - string name of displaytype (thumb, list, card)
            searchStr: null,                    // current member entered search text - string
            selectedPane: 'resources',          // current selected selectedPane (search, terms, or resources)
            endOfResources: false,              // status for reached end of infinite scroll
            loadingResources: false,            // status for fetching resources
            orderby: 'quality',                 // order for returned resources (quality, complexity, number of views, etc.)
            descending: true                    // should resources be returned in ascending or descending order
        }
    },
    methods: {
        setOrderAndDescending: function(by){
          if(by === this.orderby){
            this.descending = !this.descending;
            Cookies.set('descending',!this.descending)
          } else {
            this.orderby = by;
            Cookies.set('orderby',by)
          }
          this.fetchResources();
        },
        infinite: function(){
          if(!this.endOfResources){
            this.fetchResources(true)
          }
        },
        random: function(){
          this.$http.get('/resource/random').then(response => {
            router.push({ name: 'resourceSub', params: { uid: response.body.uid }})
          });
        },
        includeSearch: function(set){
          if(!this.termQuery.includes(set.setID)){
            this.termQuery.push(set);
          }
          this.removeFrom(set, this.suggestions)
        },
        focus: function(set){
          set.status.focusIcon=false;
          var tIndex = this.termQuery.length;
          while(tIndex--){
            if(!this.termQuery[tIndex].status.pinnedIcon && this.termQuery[tIndex].setID!=set.setID) this.termQuery.splice(tIndex,1);
          }
        },
        addToFrom: function(term, to, from){ /// this is all stupid and needs to be re thought.
          if(to){this.addTo(term, to)};
          if(from) {this.removeFrom(term, from)};

          this.filter('keywords')
        },
        addTo: function(item, theArray){
          theArray.push(item)
        },
        removeFrom: function(item, theArray){ // removal looks funny...open issue: https://github.com/David-Desmaisons/Vue.Isotope/issues/24
          for( i=theArray.length-1; i>=0; i--) {
              if( theArray[i].setID == item.setID) theArray.splice(i,1);
          }
        },
        removeTerm: function(id){ // removal looks funny...open issue: https://github.com/David-Desmaisons/Vue.Isotope/issues/24
          for( i=this.termQuery.length-1; i>=0; i--) {
              if( this.termQuery[i].setID == id) this.termQuery.splice(i,1);
          }
        },
        flipViewed: function(){

          if(this.member.uid){
            this.showViewed=!this.showViewed;
            this.$nextTick(()=>{
                this.fetchResources();
            })

            Cookies.set('showViewed', this.showViewed);
            if(this.showViewed){
              Materialize.toast('Include viewed resources',2000)
            } else {
              Materialize.toast('Hide viewed resources',2000)
            }
          } else {
            Materialize.toast('Must be logged in to hide viewed resources!',2000)
            $('#login-modal').modal('open')
          }

        },
        addToQuery: function(item){
            item.connections=0;
            if(item.persistAction){ // this is handled really poorly...neeed to rethink term comp. Also, this doesn't work for pin
              item.status.includeIcon = true;
            }
            if(item.status.focusIcon){
              this.focus(item);
            }
            if(this.termQuery.every(x=>x.setID != item.setID)){ // don't add if already in query
              this.termQuery.push(item);
            } else {
              Materialize.toast('Already in query!', 1500)
            }
        },
        changeDisplay: function(disp){
          this.resourceDisplay = disp
          Cookies.set('resourceDisplay', disp)
          // weird to wrap a timeout with next tick, but css lags and screws up the layout after transistion
          this.$nextTick(function(){
            window.setTimeout(()=>{
              this.layout()
            }, 375)
          })

        },
        changeLens: function(lens){
          if(lens === null){
              Cookies.set('lens', null)
          } else {
              Cookies.set('lens', lens.name)
          }
          if(lens === null || this.crossSection===null || this.crossSection.name !== lens.name){
            if($('#crossSectionNav').flickity()){
              $('#crossSectionNav').flickity('destroy');
              $('#crossSectionSteps').flickity('destroy');
            }
            this.crossSection = lens
            this.$nextTick(function(){
              $('#crossSectionNav').flickity({
                asNavFor: '#crossSectionSteps',
                // wrapAround: true,
                pageDots: false,
                prevNextButtons: false,
                accessibility: false, // to prevent jumping when focused
              })
              $('#crossSectionSteps').flickity({
                wrapAround: true,
                pageDots: false,
                prevNextButtons: true,
                accessibility: false, // to prevent jumping when focused
                dragThreshold: 40 // play around with this more?
              });
              this.$nextTick(function(){
                  this.layout();
              })
            });
          };
        },
        shuffle: function(key) {
            this.$refs.resourceBin.shuffle();
            this.$refs.key.shuffle();
            this.$refs.termQuery.shuffle();
        },
        layout: function() {
          if(this.termSuggestions.length>0 && this.suggestionDisplay == 'groups' && this.selectedPane==='terms'){
            for(termIndex in this.termSuggestions){ // layout all isotope containers in term termSuggestions
              if(this.$refs['suggestionBin' + this.termSuggestions[termIndex].group[0].setID] && this.$refs['suggestionBin' + this.termSuggestions[termIndex].group[0].setID][0]){
                this.$refs['suggestionBin' + this.termSuggestions[termIndex].group[0].setID][0].layout('masonry');
              }
            }
          }
          for(termIndex in this.crossSection){ // layout all isotope containers in cross section
            this.$refs['resourceBin' + this.crossSection[termIndex].setID][0].layout('masonry');
          }
          if(this.$refs.termQuery && this.selectedPane==='search'){
            this.$refs.termQuery.layout('masonry');
          }
          if(this.selectedPane==='resources' && this.$refs.resourceBin && (!this.crossSection || this.crossSection.length == 0) ){
            this.$refs.resourceBin.layout('masonry');
          }

        },
        initSuggestionGroupFlickity: function(length){
          // setup suggestion group flickity

          if($('#suggestionNav').flickity()){
              $('#suggestionNav').flickity('destroy');
          }
          if($('#suggestionSteps').flickity()){
            $('#suggestionSteps').flickity('destroy');
          }
          if($('#suggestionTogether').flickity()){
            $('#suggestionTogether').flickity('destroy');
          }

          if(length >0){
            if(this.suggestionDisplay!='none'){
              $('#suggestionNav').flickity({
                asNavFor: '#suggestionSteps',
                pageDots: false,
                prevNextButtons: true,
                accessibility: false, // to prevent jumping when focused
              })

              $('#suggestionSteps').flickity({
                wrapAround: true,
                pageDots: false,
                prevNextButtons: true,
                accessibility: false, // to prevent jumping when focused
                dragThreshold: 40
              });
            } else {
              $('#suggestionNav').flickity({
                wrapAround: false,
                pageDots: false,
                prevNextButtons: true,
                accessibility: false, // to prevent jumping when focused
                dragThreshold: 40
              })
            }
            if($('#suggestionNav').flickity()){
              window.setTimeout(x=>{ // need time to get flickity situated...
                $('#suggestionNav').flickity( 'selectCell', Math.round(length/2), false, false ); // why is this not working?
                this.layout();
              }, 175)
            }
          }
        },
        getTerms: function(){
          if('size disciplines time'.indexOf(this.suggestionDisplay) > -1){// this is dumb and should be untangled.
            this.getBatchTerms();
          } else {
            var include = [];
            var exclude = [];
            for (var termIndex = 0; termIndex < this.termQuery.length; termIndex++) {
              include.push(this.termQuery[termIndex].setID)
            }
            this.termSuggestions=[];
            this.$http.get('/set/', {params: { languageCode: 'en', include: include, exclude: [''], type: this.suggestionDisplay}}).then(response => {

              this.termSuggestions=response.body;

              if(this.termSuggestions.length===0){
                this.suggestionDisplay='size';
              }
              this.$nextTick(()=>{
                this.initSuggestionGroupFlickity(response.body.length);
              })
            });
          }
        },
        getBatchTerms: function(){
          var scaleIDs={
            'size':'BJgVf2ZQYW',
            'disciplines':'Bylx_hVBa-',
            'time':'BJNgnDdk-'
          }
          var id = scaleIDs[this.suggestionDisplay];
          this.termSuggestions=[];
          this.$http.get('/set/'+id+'/crossSection', {params: { languageCode: 'en'}}).then(response => {
            for(x in response.body){

              if(response.body[x].contains[0].term == null){
                 response.body[x].contains =[]
              }
              if(response.body[x].group[0].translation == null){
                response.body[x].group[0].translation = ''
                console.log("I need to be dealt with - improve query.")
                // no translation because contains no terms
              }
            }
            this.termSuggestions=response.body;

            if(this.termSuggestions.length===0){
              this.suggestionDisplay='size';
            }
            this.$nextTick(()=>{
              this.initSuggestionGroupFlickity(response.body.length);
            })
          });
        },
        fetchContains: function(set){ // used in fetching resource lens...
          this.$http.get('/set/' + set.setID + '/contains/', {params: { languageCode: 'en'}}).then(response => {
            if(response.body.length > 0){
              this.changeLens(response.body);
            } else {
              Materialize.toast('Contains no terms.', 4000)
            }
          }, response => {
            Materialize.toast('Something went wrong...are you online?', 4000)
          });
        },
        fetchResources: function(infinite){
          if(!this.loadingResources && !(infinite && this.resources.length===0)){ // don't fetch if initial resrouces hadn't had time to load to avoid ending up with top resources twice
            this.loadingResources = true;
            this.endOfResources = false;
            var include = [];
            var exclude = [];
            var limit = 30; // default for large devices
            if( screen.width <= 480 ){ // less for mobile
              limit = 10;
            }
            var skip = 0;
            if(infinite){ // only skip if infinite scrolling
              skip = this.resources.length;
            }
            for (var termIndex = 0; termIndex < this.termQuery.length; termIndex++) {
              if(this.termQuery[termIndex]['status'].includeIcon){
                include.push(this.termQuery[termIndex]['setID'])
              } else {
                exclude.push(this.termQuery[termIndex]['setID'])
              }
            }
            if(this.member.uid != null){ // member specific query if logged in
              this.$http.get('/api/resource', {params: {
                languageCode: 'en',
                include: include,
                exclude: exclude,
                showViewed: this.showViewed,
                skip: skip,
                limit: limit,
                orderby: this.orderby,
                descending: this.descending }
              }).then(response => {
                if(response.body.length == 0){
                  this.endOfResources = true;
                } else if(infinite){
                  this.resources.push.apply(this.resources, response.body)
                } else {
                  this.resources=response.body;
                }
                this.loadingResources = false;
              }, failed => {
                console.log(failed)
                Materalize.toast('Something went wrong...')
                this.loadingResources = false;
              });
            } else { // general query if not logged in
              this.$http.get('/resource', {params: {
                languageCode: 'en',
                include: include,
                exclude: exclude,
                skip: skip,
                limit: limit,
                orderby: this.orderby,
                descending: this.descending }
              }).then(response => {
                if(response.body.length == 0){
                  this.endOfResources = true;
                } else if(infinite){
                  this.resources.push.apply(this.resources, response.body)
                } else {
                  this.resources=response.body;
                }
                this.loadingResources = false;
              }, failed => {
                console.log(failed)
                Materalize.toast('Something went wrong...')
                this.loadingResources = false;
              });
            }
          }
        },
        fetchResourceQuantity: function(){
          var include = [];
          var exclude = [];
          for (var termIndex = 0; termIndex < this.termQuery.length; termIndex++) {
            if(this.termQuery[termIndex]['status'].includeIcon){
              include.push(this.termQuery[termIndex]['setID'])
            } else {
              exclude.push(this.termQuery[termIndex]['setID'])
            }
          }
          if(this.member.uid != null){ // member specific query if logged in
            this.$http.get('/api/resource/count', {params: { languageCode: 'en', include: include }}).then(response => {
              this.resourcesRelated = response.body.relatedResources;
              this.resourcesViewed = response.body.viewedResources;
            });
          } else { // general query if not logged in
            this.$http.get('/resource/count', {params: { languageCode: 'en', include: include, exclude: exclude}}).then(response => {
              this.resourcesRelated = response.body.relatedResources;
            });
          }

        }
    },
    mounted: function(){

      //alpha warning
      if(!Cookies.get('alpha-warning-seen')){
        Cookies.set('alpha-warning-seen', true, { expires: 7 });
        var $toastContent = $("<span>Hi! Knowlo is in alpha right now...everthing is subject to change and break.</span>");
        Materialize.toast($toastContent, 10000);
        this.$router.push("/about")
      } else {
        Cookies.set('alpha-warning-seen', true, { expires: 7 }); // reset expiry
      }

      if(!this.resourcesRelated){
        this.fetchResourceQuantity();
      }

      // get previously selected resource display Style
      if(!Cookies.get('resourceDisplay')){
        this.resourceDisplay = "card";
      } else {
        this.resourceDisplay = Cookies.get('resourceDisplay');
      }

      // get previously selected orderby
      if(!Cookies.get('orderby')){
        this.orderby = "quality";
      } else {
        this.orderby = Cookies.get('orderby');
      }

      // get previously selected desc/asc setting
      if(!Cookies.get('descending')){
        this.descending = true;
      } else {
        this.descending = (Cookies.get('descending') === 'true');
      }

      // get previously show viewed setting
      if(!Cookies.get('showViewed')){
        this.showViewed = false;
      } else {
        this.showViewed = (Cookies.get('showViewed') == 'true');
      }

      // get previously selected suggestionDisplay
      if(!Cookies.get('suggestionDisplay')){
        this.suggestionDisplay = "size";
      } else {
        this.suggestionDisplay = Cookies.get('suggestionDisplay');
      }

      // init paned sections
      $('.exploreBins').collapsible({
         onOpen: (el) =>{
           this.selectedPane = el[0].dataset.pane;
           if(el[0].dataset.pane === 'resources'){
             this.$nextTick(()=>{
               $('.dropdown-button').dropdown(); // init order-by dropdown
             })
           }
         }, // Callback for Collapsible open
         onClose: (el) => { // keep at least one pane open - default to resources
           if( el[0] && el[0].dataset.pane === this.selectedPane){

             if(this.selectedPane != 'resources'){
               this.selectedPane = 'resources'
               $('.exploreBins').collapsible('open', 2);
             } else {
               this.selectedPane = 'terms'
               $('.exploreBins').collapsible('open', 1);
             }

           }
         } // Callback for Collapsible close
       });
       $('.exploreBins').collapsible('open', 2);

       // init order by dropdown
       $('.orderby').dropdown();

      // this is not working...
      $('.element-item').imagesLoaded() // layout when images loaded and on progress......
        .always( ( instance ) => {
          console.log('all images loaded');
          this.$nextTick(function(){
            window.setTimeout(()=>{
              this.layout('from images loaded, finished.')
            }, 375)
          })

        });
        // workaround as long as imagesLoaded() non-functional
        setInterval(x => {
          this.layout();
        }, 3000);

        // fixes fetching resources when navigating from a different page (ex /about)...this seems exceedinly inelegant
        setTimeout( () => {
          if(this.selectedPane === 'resources' && this.resources.length===0){
            this.fetchResources();
          }
        }, 500);

    },
    watch: {
      member: function(newVal,oldVal) { // re-fetch resources/terms on member login/logout
        this.loginCheck = true;
        this.$nextTick(x=>{
          this.fetchResourceQuantity();
          if(this.selectedPane === 'resources'){
            this.fetchResources()
          }
        })
      },
      termQuery: function(val,x){
        if(this.termQuery.length===0){
          this.suggestionDisplay='size';
        }
        Cookies.set('termQuery',val)
        if(this.loginCheck){ // don't fetch before checking member login
          this.$nextTick(()=>{
            if(this.selectedPane === 'resources'){
              this.fetchResources();
            } else if (this.selectedPane === 'terms') {
              this.getTerms(); // only get terms if not loaded or set to groups or ungrouped
            }
            this.fetchResourceQuantity();
          })
        }
      },
      suggestionDisplay: function(val,x){
        Cookies.set('suggestionDisplay',val)
        if(x.length>0){
          this.getTerms();
        }
      },
      selectedPane: function(newVal,oldVal){
         if(newVal != oldVal && newVal === 'resources' && this.loginCheck){
          this.fetchResources();
        } else if(newVal != oldVal && newVal === 'terms'){
          this.getTerms()
        }
        this.layout();
      },
    }
});

/*
██       █████  ███    ██ ██████  ██ ███    ██  ██████
██      ██   ██ ████   ██ ██   ██ ██ ████   ██ ██
██      ███████ ██ ██  ██ ██   ██ ██ ██ ██  ██ ██   ███
██      ██   ██ ██  ██ ██ ██   ██ ██ ██  ██ ██ ██    ██
███████ ██   ██ ██   ████ ██████  ██ ██   ████  ██████
*/
const landing = {
    template: "#landingTemplate",
    methods: {
      random: function(){
        this.$http.get('/resource/random').then(response => {
          router.push({ name: 'resourceSub', params: { uid: response.body.uid }})
        });
      },
    },
    mounted: function(){
      $('.collapsible').collapsible();
      $('.button-collapse').sideNav({
          closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
          draggable: true // Choose whether you can drag to FF on touch screens
        }
      );
    }
}
