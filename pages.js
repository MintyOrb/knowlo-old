
/*
████████ ███████ ██████  ███    ███     ██████   █████   ██████  ███████
   ██    ██      ██   ██ ████  ████     ██   ██ ██   ██ ██       ██
   ██    █████   ██████  ██ ████ ██     ██████  ███████ ██   ███ █████
   ██    ██      ██   ██ ██  ██  ██     ██      ██   ██ ██    ██ ██
   ██    ███████ ██   ██ ██      ██     ██      ██   ██  ██████  ███████
*/
const termComp = Vue.component('termComp',{
    template: "#termTemplate",
    data: function() {
      return {
        term: {name: 'default',translation:{name:''},term:{iconURL:""}},
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
           this.openModal()
         }, response => {
           this.openModal()
           Materialize.toast('Something went wrong...are you online?', 4000)
         });
      },
      addDefinition: function (){

      },
      openModal: function(){
        this.$nextTick(function(){
            $('#termModal'+this.term.id).modal({
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
                if(  $('.termNav').flickity()){
                  $('.termNav').flickity('destroy');
                  $('.termSections').flickity('destroy');
                }
                $('body').css("overflow","auto")
              }
            }).modal('open');
          })
      },
      close: function(){
        console.log("close here after esc")
      },
      addIcon: function(){

      },
      deleteIcon: function(){

      },
      fetchProps: function(){
        this.$http.get('/set/' + this.$route.params.uid + '/props/', {params: { languageCode: 'en'}}).then(response => {

          var tempIcon = []
          if(response.body.length > 0){
            tempIcon = response.body.filter(prop => {
              return prop.type=='url'
            })
            this.definitions = response.body.filter(prop => {
              return prop.type=='definition';
            })
          } else {
            Materialize.toast('Properties not found.', 4000)
          }

          // temp prop renaming...
          for(icon in tempIcon){
            tempIcon[icon].resource = {}
            tempIcon[icon].resource.uid = icon;
            tempIcon[icon].resource.mThumb = tempIcon[icon].translation.value
            console.log('woahhhhhh')
            console.log(tempIcon[icon])

          }
          this.icons=tempIcon;

        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      fetchMeta: function(type){
        this.$http.get('/set/' + this.$route.params.uid + '/meta/', {params: { languageCode: 'en', type: type }}).then(response => {
          console.log(response.body)
          if(response.body.length > 0){

          } else {
            Materialize.toast('No def found..... not found.', 4000)
          }
          if(type=='definition'){
            this.definitions=response.body;
          } else if (type=='icon'){
            this.icons=response.body;
          }


        }, response => {
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
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
      addSynonym: function(synonym){
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
            Materialize.toast('Within not found.', 4000)
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
            Materialize.toast('Set deleted!', 4000)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      }
    },
    mounted: function(){
      this.init();

      $('.termNav').flickity({
        asNavFor: '.termSections',
        pageDots: true,
        prevNextButtons: true,
        accessibility: false, // to prevent jumping when focused
      })

      $('.termSections').flickity({
        // asNavFor: '.termNav',
        wrapAround: true,
        pageDots: false,
        prevNextButtons: true,
        accessibility: false, // to prevent jumping when focused
        dragThreshold: 20 // play around with this more?
      });

      // TODO: set flickity tab in URL
      $('.termSections').flickity('selectCell', 1, true, true ) //  value, isWrapped, isInstant
      // listen for escape key (materalize closes modal on esc, but doesn't re-route)

      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' || event.keyCode === 27) {
          router.go(-1) || router.push('/')
        }
      });

  },
  beforeRouteLeave: function (to, from, next){
    if($('#termModal'+this.term.id)){
      $('#termModal'+this.term.id).modal('close');
    }
    document.removeEventListener('keydown',function(){})
    window.setTimeout(()=>{
      next()
    }, 375)
  },
  watch: {
    '$route.params.uid': function (id) {
      this.init();
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
    data: function() {
          return {
              resource: {uid: 0, displayType: "none"}, // include defaults so init doesn't break if resource is not found
              terms: [],
              discussion: [],
              display: 'card', // default display for discussion
              resourceSection: ["Discussion","Terms","Vote","Stats","Related"],
              addResource:false,
              addResourceType: '',
            }
          },
    methods: {
      changeDisplay: function(disp){ // TODO: make dry ( essentially duplicated from explore) - make resource bin component?
        this.display = disp
        // Cookies.set('displayStyle', disp)
        // weird to wrap a timeout with next tick, but css lags and screws up the layout after transistion
        this.$nextTick(function(){
          window.setTimeout(()=>{
            // this.layout()
            this.$refs.discussionBin.layout('masonry');
          }, 375)
        })
      },
      fetchResource: function(){
        // TODO take language from member instead of hardcoding english...
        this.$http.get('/resource/' + this.$route.params.uid + '/full', {params: { languageCode: 'en'}}).then(response => {
          if(response.body.resource){
            this.resource = response.body.resource;
            this.terms = response.body.terms;
            if(this.resource.url){
              if(this.resource.url.match(/[^/]+(jpg|png|gif|jpeg)$/)){
                this.resource.displayType = 'image'
              } else if(this.resource.url.match(/[^/]+(gifv|webm)$/)){
                this.resource.displayType = 'video'
              } else if(this.resource.url.indexOf('youtube') > -1){
                this.resource.ytID = new URL(this.resource.url).searchParams.get('v')
                this.resource.displayType = 'embed'
              }
            } else {
              this.resource.displayType = 'text'
            }

          } else {
            Materialize.toast('Resource not found.', 4000)
          }
          this.init()
        }, response => {
          this.init()
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      init: function(){

          this.fetchDiscussion();

          this.$nextTick(function(){
            if($('.resourceNav').flickity() && $('.resourceSections').flickity()){
              $('.resourceNav').flickity('destroy');
              $('.resourceSections').flickity('destroy');
            }
            $('.resourceNav').flickity({
              asNavFor: '.resourceSections',
              // wrapAround: true,
              pageDots: true,
              prevNextButtons: true,
              contain: true,
              // freeScroll: true,
              accessibility: false, // to prevent jumping when focused
            })

            $('.resourceSections').flickity({
              wrapAround: true,
              // asNavFor: '.resourceNav',
              pageDots: false,
              prevNextButtons: true,
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
                  $('.resourceNav').flickity('destroy');
                  $('.resourceSections').flickity('destroy');
                  $('body').css("overflow","auto");
                  router.go(-1) || router.push("/");
                }
              }).modal('open');

              $('#resourceModal'+resource.uid).css('opaciy',1)

              // remove any existing leaflet elements from previous resource (probably a smarter way to handle this...)
              $('.leaflet-control-container').remove();
              $('.leaflet-pane').remove();
              if(this.resource.displayType == "image"){
                // from http://kempe.net/blog/2014/06/14/leaflet-pan-zoom-image.html

                var map = L.map('image-map', {
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
              }
          })

      },
      fetchDiscussion: function(){
        this.$http.get('/resource/' + this.$route.params.uid + '/discussion', {params: { languageCode: 'en'}}).then(response => {
          if(response.body.length>0){
            this.discussion = response.body;
          } else {
            this.discussion=[]
          }
        }, response => {
          // Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      addCreatedDiscussion: function(dis){
        this.discussion.push(dis)
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
    },
    mounted: function(){

      this.fetchResource();

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

      $('.modal-overlay').remove(); // needed if navigating from resource page to set page
      if(this.resource && $('#resourceModal'+this.resource.id)){
        $('#resourceModal'+this.resource.id).modal('close');
      }
      window.setTimeout(()=>{
        next()
      }, 375)
    },
    watch: {
      '$route.params.uid': function (id) {
        this.fetchResource();
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
            db: undefined,                      // search results to display - array of material objects
            crossSection: null,                 // object containing the name of the cross section and terms in lens group - object containing array of term objects and string name
            suggestionGroups: [],               // holds suggestion groups and terms within
            // termQuery: [],                   // terms selected for search - - array of term objects with flags for include/exclude/pin etc.
            suggestions: [],                    // suggested terms...not sure about ui, currently  - array of term objects
            resources: [],                      // db when no lens, replace with db even though less items? - array of term objects
            numberOfDisplayed: null,            // number of materials currently displayed
            display: undefined,                 // display option for materials in search result - string name of displaytype (thumb, list, card)
            currentLayout: 'masonry',           // incase want to change isotope display type...not used now
            sortOption: "original-order",       // to sort search results by - string name
            sortAscending: true,                // whether sort whould be ascending or descending - boolean
            filterOption: "show all",
            searchStr: null,                    // current member entered search text - string
            getSortData:  {                     // sort options for isotope...eventually include others...
                rating: "rating",
                viewcount: "viewcount",
                author: "author",
                dislikes: "dislikes",
                length: "length",
                likes: "likes"
            },
            getFilterData: {                    // isotop filter functions - filter here for crosssection/grou/lensp instead of with jquery?
                "keywords": (el) => {
                  foundAll = true
                  for (var keyIndex = 0; keyIndex < this.termQuery.length; keyIndex++) {
                    foundOne = false
                    el.keywords.some((element, i) =>{
                      if (this.termQuery[keyIndex]['name'].toLowerCase().trim() === element.toLowerCase().trim()) {
                          foundOne = true;
                      }
                    })
                    foundAll = foundAll && foundOne // "AND" search
                  }
                  return foundAll
                },
                "show all": function() {
                    return true;
                },
                "contains": (el) => {
                    return el.description.toLowerCase().includes(this.searchStr.toLowerCase())
                    // return el.keywords.some((element, i) =>{
                    //     if (this.searchStr.toLowerCase().trim() === element.toLowerCase().trim()) {
                    //         return true;
                    //     }
                    // });
                }
            },
        }
    },
    methods: {
        includeSearch: function(set){
          this.termQuery.push(set);
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
        addToQuery: function(item){
            item.connections=0;
            if(item.status.focusIcon){
              this.focus(item);
            }
            this.termQuery.push(item);
        },
        includeExclude: function(set){ // for including/excluding terms already in query
          if(set.status.includeIcon){
            set.status.include = false;
            set.status.includeIcon = false;
            status.exclude = true;
            set.status.excludeIcon=true;
          } else {
            set.status.include = true;
            set.status.includeIcon = true;
            status.exclude = false;
            set.status.excludeIcon=false;
          }
          this.fetchResources();
        },
        changeDisplay: function(disp){
          this.display = disp
          Cookies.set('displayStyle', disp)
          // weird to wrap a timeout with next tick, but css lags and screws up the layout after transistion
          this.$nextTick(function(){
            window.setTimeout(()=>{
              this.layout()
            }, 375)
          })

        },
        changeLens: function(lens){
          console.log(lens)
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
                pageDots: true,
                prevNextButtons: true,
                accessibility: false, // to prevent jumping when focused
              })

              $('#crossSectionSteps').flickity({
                // asNavFor: '.crossSectionNav',
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
        getContentOptions: function() { // need to rethink managing multiple iso instances - single function that take parameter?
            return {
                sortAscending: this.sortAscending,
                itemSelector: ".element-item",
                getSortData: this.getSortData,
                getFilterData: this.getFilterData,
            }
        },
        sort: function(key) {
            if(key == this.sortOption){ // switch ascending/descending if sort option already selected
              this.sortAscending = !this.sortAscending;
            }
            this.$nextTick(()=>{
              var steps = $('.step'); // pretty serious antipattern here...make a registery when using cross section views instead?
              for (var stepIndex = 0; stepIndex < steps.length; stepIndex++) {
                if(steps[stepIndex].termName  !== undefined){
                  steps[stepIndex]['__vue__'].sort(key)
                }
              }
              // this.$refs.resourceBin.sort(key);
              this.sortOption = key;
            })
        },
        shuffle: function(key) {
            this.$refs.resourceBin.shuffle();
            this.$refs.key.shuffle();
            this.$refs.termQuery.shuffle();
        },
        filter: function(key) {
            // this.$refs.resourceBin.filter(key);
            console.log(this.$refs)
            // this.numberOfDisplayed =   this.$refs.resourceBin.getFilteredItemElements().length
        },
        layout: function(mes) {
          console.log('in layout: ', mes) // just for testing vue-images-loaded. Which I may never get to wrok.
          for(termIndex in this.suggestionGroups){ // layout all isotope containers in term suggestionGroups
            if(this.$refs['suggestionBin' + this.suggestionGroups[termIndex].group[0].setID]){
              this.$refs['suggestionBin' + this.suggestionGroups[termIndex].group[0].setID][0].layout('masonry');
            }
          }
          for(termIndex in this.crossSection){ // layout all isotope containers in cross section
            this.$refs['resourceBin' + this.crossSection[termIndex].setID][0].layout('masonry');
          }
          this.$refs.termQuery.layout('masonry');
          if(!this.crossSection || this.crossSection.length == 0){
            this.$refs.resourceBin.layout('masonry');
          }

        },
        getTerms: function(){
          var include = [];
          var exclude = [];
          for (var termIndex = 0; termIndex < this.termQuery.length; termIndex++) {
            include.push(this.termQuery[termIndex]['term'].uid)
          }
          this.suggestionGroups =[];
          this.$http.get('/set/', {params: { languageCode: 'en', include: include, exclude: ['']}}).then(response => {
            // this.suggestions=response.body;
            this.suggestionGroups=response.body;
            // setup suggection flickity
            this.$nextTick(function(){
              if($('#suggestionNav').flickity() && $('#suggestionSteps').flickity()){
                $('#suggestionNav').flickity('destroy');
                $('#suggestionSteps').flickity('destroy');
              }
              $('#suggestionNav').flickity({
                asNavFor: '#suggestionSteps',
                // wrapAround: true,
                pageDots: true,
                prevNextButtons: true,
                accessibility: false, // to prevent jumping when focused
              })

              $('#suggestionSteps').flickity({
                // asNavFor: '.crossSectionNav',
                wrapAround: true,
                pageDots: false,
                prevNextButtons: true,
                accessibility: false, // to prevent jumping when focused
                dragThreshold: 40 // play around with this more?
              });
            });
          }, response => {
            // warning would be redundant?
          });
        },
        fetchContains: function(set){
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
        fetchResources: function(){
          var include = [];
          var exclude = [];

          for (var termIndex = 0; termIndex < this.termQuery.length; termIndex++) {
            if(this.termQuery[termIndex]['status'].includeIcon){
              include.push(this.termQuery[termIndex]['setID'])
            } else {
              exclude.push(this.termQuery[termIndex]['setID'])
            }
          }
          this.$http.get('/resource', {params: { languageCode: 'en', include: include, exclude: exclude}}).then(response => {
            this.resources=response.body;
            this.numberOfDisplayed = response.body.length;
            this.getTerms();
            window.setTimeout(() =>{
              this.layout()
            }, 500);
          }, response => {
            console.log('error getting resources... ', response)
          });
        }

    },
    mounted: function(){

      //alpha warning
      if(!Cookies.get('alpha-warning-seen')){
        Cookies.set('alpha-warning-seen', true, { expires: 7 });
        var $toastContent = $("<span>Hi! Knowlo is pre-alpha right now. There's not a lot to see and what there is will probably break.</span>");
        Materialize.toast($toastContent, 10000);
      } else {
        Cookies.set('alpha-warning-seen', true, { expires: 7 }); // reset expiry
      }

      // get previously selected lens - (remove after generalized to any group as a lens)
      if(Cookies.get('lens') == 'null'){ // temporary until cross sections are generalized.
        this.changeLens(null)
      } else if (Cookies.get('lens') == "Big_History"){
        this.changeLens(this.bigHistory)
      } else {
        this.changeLens(this.size)
      }

      // get previously selected display Style
      if(!Cookies.get('displayStyle')){
        this.display = "card";
      } else {
        this.display = Cookies.get('displayStyle');
      }


      $('.dropdown-button').dropdown();

      $('.element-item').imagesLoaded() // layout when images loaded and on progress...... doesn't seem to be working
        .always( ( instance ) => {
          console.log('all images loaded');
          this.$nextTick(function(){
            window.setTimeout(()=>{
              this.layout('from images loaded, finished.')
            }, 375)
          })

        });
        // temp workaround as long as imagesLoaded() is not working
        setInterval(x => {
          this.layout();
        }, 3000);
    },
    created: function(){
      this.bigHistory = bigHistory;
      this.size = disciplines;
    },
    watch: {
      termQuery: function(val){

        Cookies.set('termQuery',val)
        this.fetchResources();

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
    mounted: function(){
      $('.collapsible').collapsible();
      $('.button-collapse').sideNav({
          closeOnClick: true, // Closes side-nav on <a> clicks, useful for Angular/Meteor
          draggable: true // Choose whether you can drag to FF on touch screens
        }
      );
    }
}
