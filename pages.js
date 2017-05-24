/*
 █████  ██████  ██████      ██████  ███████ ███████  ██████  ██    ██ ██████   ██████ ███████
██   ██ ██   ██ ██   ██     ██   ██ ██      ██      ██    ██ ██    ██ ██   ██ ██      ██
███████ ██   ██ ██   ██     ██████  █████   ███████ ██    ██ ██    ██ ██████  ██      █████
██   ██ ██   ██ ██   ██     ██   ██ ██           ██ ██    ██ ██    ██ ██   ██ ██      ██
██   ██ ██████  ██████      ██   ██ ███████ ███████  ██████   ██████  ██   ██  ██████ ███████
*/

const addResource = Vue.component('addResource',{
    template: "#addResource",
    props: ['member'],
    data: function() {
      return {
        resource:{ // these aren't all strings...
          'thumb': "",
          'URL': "",
          'displayType': "",
          'source': "",
          'timeToView': "",
          'insight': "",
          'difficulty': "",
          'created': "",
          'updated': "",
          'viewCount': "",
          translations: {
            'text':"",// if resource is plain text
            'title': "",
            'subtitle': "",
            'description': "",
            'value': "",
            'languageCode': this.member.languageCode,
            '_rel':  {languageCode: this.member.languageCode}
          }
        },
      }
    },
    methods:{
      close: function(){
        console.log("close here after esc")
      },
      checkURL: function(){
        // parse youtube/vimeo/other....set display type?....settime to view

      },
      saveTranslation(){
        console.log(this.resource)
        this.$http.post('/resource', {resource:this.resource, member: this.member}).then(response => {
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
      $('#addResourceModal').modal({
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
          router.go(-1) || router.push('/')
        }
      });

  },
  beforeRouteLeave: function (to, from, next){
    if($('#addResourceModal')){
      $('#addResourceModal').modal('close');
    }
    window.setTimeout(()=>{
      next()
    }, 375)

    document.removeEventListener('keydown',function(){})
  }
});



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
        term: {name: 'default'},
        synonyms: [],
        groups: [],
        termSection: ["Activity","Synonyms","Groups","Stats","Related"] //stats? vote? member's relation? definition?
      }
    },
    methods:{
       init: function(){
         this.$http.get('/term/' + this.$route.params.name + '/' + this.$route.params.uid, {params: { languageCode: 'en'}}).then(response => {
           if(response.body.term){
             response.body.term.name = response.body.translation.name
             response.body.term.status = {};
             this.term = response.body;
             this.fetchSynonyms();
             this.fetchGroups();
           } else {
             Materialize.toast('Resource not found.', 4000)
           }
           this.openModal()
         }, response => {
           this.openModal()
           Materialize.toast('Something went wrong...are you online?', 4000)
         });
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
                $('.termNav').flickity('destroy');
                $('.termSections').flickity('destroy');
                $('body').css("overflow","auto")
              }
            }).modal('open');
          })
      },
      fetchSynonyms: function() {
        this.$http.get('/term/' + this.$route.params.uid + '/synonym/', {params: { languageCode: 'en'}}).then(response => {
          if(response.body.length > 0){
            this.synonyms = response.body;
          } else {
            Materialize.toast('Synonyms not found.', 4000)
          }
        }, response => {
          this.openModal()
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      addSynonym: function(synonym){
        this.$http.put('/api/term/'+ this.term.term.uid +'/synonym/'+ synonym.term.uid).then(response => {
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
        this.$http.delete('/api/term/'+ this.term.term.uid +'/synonym/'+ synUID).then(response => {
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
      fetchGroups: function(){console.log('in fetch group')
        this.$http.get('/term/' + this.$route.params.uid + '/group/', {params: { languageCode: 'en'}}).then(response => {
          console.log('back: ',response.body)
          if(response.body.length > 0){
            this.groups = response.body;
          } else {
            Materialize.toast('Groups not found.', 4000)
          }
        }, response => {
          this.openModal()
          Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      addGroup: function(group){
        this.$http.put('/api/term/'+ this.term.term.uid +'/group/'+ group.term.uid).then(response => {
          if(response.body){
            Materialize.toast('Added!', 4000)
            this.groups.push(group)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      removeGroup: function(groupUID){
        this.$http.delete('/api/term/'+ this.term.term.uid +'/group/'+ groupUID).then(response => {
          if(response.body){
            Materialize.toast('Removed!', 4000)
            this.groups.splice(this.groups.findIndex( (term) => term.term.uid === groupUID) ,1)
          } else {
            Materialize.toast('Something went wrong...', 4000)
          }
        }, response => {
           Materialize.toast('Something went wrong...are you online?', 4000)
        });
      },
      close: function(){
        console.log("close here after esc")
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
              resource: {id: 0, displayType: "none"}, // include defaults so init doesn't break if resource is not found
              terms: [],
              resourceSection: ["Activity","terms","Vote","Stats","Related"]
            }
          },
    methods: {
      init: function(){
          // for (var i = 0; i < videos.length; i++) {
          //   if(videos[i]['videoid'] == id){
          //     this.resource = videos[i]
          //     break
          //   }
          // }
          this.$nextTick(function(){
            $('#resourceModal'+this.resource.id).modal({
                // dismissible: true, // Modal can be dismissed by clicking outside of the modal
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
                  $('body').css("overflow","auto")
                }
              }).modal('open');

              // from http://kempe.net/blog/2014/06/14/leaflet-pan-zoom-image.html
              if(this.resource.displayType == "image"){
                // TODO: make dry and sensible...
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
                    url = 'http://s3.amazonaws.com/submitted_images/'+this.resource.savedAs;
                    console.log('http://s3.amazonaws.com/submitted_images/'+this.resource.savedAs)
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

      }
    },
    mounted: function(){
      // take language from member instead of hardcoding english...
      this.$http.get('/resource/' + this.$route.params.uid + '/full', {params: { languageCode: 'en'}}).then(response => {
        console.log(response.body)
        if(response.body.resource){
          this.resource = response.body.resource;
          this.terms = response.body.terms;
        } else {
          Materialize.toast('Resource not found.', 4000)
        }
        this.init()
      }, response => {
        this.init()
        Materialize.toast('Something went wrong...are you online?', 4000)
      });


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

      // listen for escape key (materalize closes modal on esc, but doesn't re-route)
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape' || event.keyCode === 27) {
          router.go(-1) || router.push('/')
        }
      });
    },
    beforeRouteLeave: function (to, from, next){
      if(this.resource && $('#resourceModal'+this.resource.id)){
        $('#resourceModal'+this.resource.id).modal('close');
      }
      window.setTimeout(()=>{
        next()
      }, 375)

      document.removeEventListener('keydown',function(){})

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
            // termQuery: [],                      // terms selected for search - - array of term objects with flags for include/exclude/pin etc.
            words: [],                          // suggested terms...not sure about ui, currently  - array of term objects
            list: [],                           // db when no lens, replace with db even though less items? - array of term objects
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
        addToFrom: function(term, to, from){ /// this is all stupid and needs to be re thought.

          if(term.status.focus){ // clear all non pinned terms
            console.log('term focused')
            for (var termIndex = to.length - 1 ; termIndex >= 0; termIndex --) {
              console.log(to[termIndex].status)
              if(!to[termIndex].status.pinned){
                to.splice(to[termIndex], 1)
                console.log('not pinned')
              }
            }
          }

          if(to){this.addTo(term, to)};
          if(from) {this.removeFrom(term, from)};

          this.filter('keywords')
        },
        addTo: function(item, theArray){
          theArray.push(item)
        },
        removeFrom: function(item, theArray){ // removal looks funny...open issue: https://github.com/David-Desmaisons/Vue.Isotope/issues/24
          for( i=theArray.length-1; i>=0; i--) {
              if( theArray[i].name == item.name) theArray.splice(i,1);
          }
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
          if(lens === null){
              Cookies.set('lens', null)
          } else {
              Cookies.set('lens', lens.name)
          }

          if(lens === null || this.crossSection===null || this.crossSection.name !== lens.name){
            $('.crossSectionNav').flickity('destroy');
            $('.crossSectionSteps').flickity('destroy');

            this.crossSection = lens
            this.$nextTick(function(){
              $('.crossSectionNav').flickity({
                asNavFor: '.crossSectionSteps',
                // wrapAround: true,
                pageDots: true,
                prevNextButtons: true,
                accessibility: false, // to prevent jumping when focused
              })

              $('.crossSectionSteps').flickity({
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
        getSelectedOptions: function() {
            return {
                masonry:{columnWidth: 1},
                sortAscending: this.sortAscending,
                getSortData: this.getSortData,
                getFilterData: this.getFilterData,
            }
        },
        getSuggestionOptions: function() {
            return {
                masonry:{columnWidth: 1},
                sortAscending: this.sortAscending,
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
              // this.$refs.contentBin.sort(key);
              this.sortOption = key;
            })
        },
        shuffle: function(key) {
            // this.$refs.contentBin.shuffle();
            this.$refs.key.shuffle();
            this.$refs.termQuery.shuffle();
        },
        filter: function(key) {
            // this.$refs.contentBin.filter(key);
            console.log(this.$refs)
            // this.numberOfDisplayed =   this.$refs.contentBin.getFilteredItemElements().length
        },
        layout: function(mes) {
          console.log('in layout: ', mes) // just for testing vue-images-loaded. Which I may never get to wrok.
          // use parameter to chhose which isotope instance to layout? - pass in name vs pass in container?
          this.$refs.termQuery.layout('masonry');
          this.$refs.contentBin.layout('masonry');

           // pretty serious antipattern here...make a registery when using cross section views instead?
          var steps = $('.step'); // get isotope containers with jquery
          for (var stepIndex = 0; stepIndex < steps.length; stepIndex++) {
            console.log('in anti pattern')

            if(steps[stepIndex].termName !== undefined && steps[stepIndex]['__vue__'] != null){
              steps[stepIndex]['__vue__'].layout('masonry')
            }
          }

        },
        trimNumber: function(num, digits) { // from http://stackoverflow.com/a/9462382/2061741 - displays number of views
          var si = [ { value: 1E18, symbol: "E" }, { value: 1E15, symbol: "P" }, { value: 1E12, symbol: "T" }, { value: 1E9,  symbol: "G" }, { value: 1E6,  symbol: "M" }, { value: 1E3,  symbol: "k" }], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;
          for (i = 0; i < si.length; i++) {
            if (num >= si[i].value) {
              return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
            }
          }
          return num.toFixed(digits).replace(rx, "$1");
        },
        test(){
        },
        getTerms(){
          var include = [];
          var exclude = [];
          for (var termIndex = 0; termIndex < this.termQuery.length; termIndex++) {
            include.push(this.termQuery[termIndex]['term'].uid)
            console.log(this.termQuery[termIndex]['term'].uid)
          }
          this.$http.get('/term/', {params: { languageCode: 'en', include: include, exclude: ['']}}).then(response => {
            console.log(response)
            this.words=response.body;
          }, response => {
            console.log('test ',response)
          });
        }

    },
    mounted: function(){
      // this.test()

      //alpha warning
      if(!Cookies.get('alpha-warning-seen')){
        Cookies.set('alpha-warning-seen', true, { expires: 7 });
        var $toastContent = $("<span>Hi! Knowlo is pre-alpha right now. There's not a lot to see and what there is will probably break.</span>");
        Materialize.toast($toastContent, 10000);
      } else {
        Cookies.set('alpha-warning-seen', true, { expires: 7 }); // reset expiry
      }


      // get previously selected display Style
      if(!Cookies.get('displayStyle')){
        this.display = "card";
      } else {
        this.display = Cookies.get('displayStyle');
      }
      // get previously selected lens - (remove after generalized to any group as a lens)
      if(Cookies.get('lens') == 'null'){ // temporary until cross sections are generalized.
        this.changeLens(null)
      } else if (Cookies.get('lens') == "Big_History"){
        this.changeLens(this.bigHistory)
      } else {
        this.changeLens(this.size)
      }

      $('.dropdown-button').dropdown();

      $('.step').imagesLoaded() // layout when images loaded and on progress...... doesn't seem to be working - do I need to do a for each?
        .always( ( instance ) => {
          console.log('all images loaded');
          this.layout('from images loaded, finished.')
        })
        .progress( ( instance, image ) => { // this doesn't seem to be working either
          var result = image.isLoaded ? 'loaded' : 'broken';
          console.log( 'image is ' + result + ' for ' + image.img.src );
          this.layout('from images loaded, progress made.')
        });
    },
    created: function(){
      this.bigHistory = bigHistory;
      this.size = disciplines;
    },
    watch: {
      termQuery: function(val){
        var include = [];
        var exclude = [];
        for (var termIndex = 0; termIndex < val.length; termIndex++) {
          include.push(val[termIndex]['term'].uid)
          //TODO:get excluded terms...
        }
        this.$http.get('/resource', {params: { languageCode: 'en', include: include, exclude: exclude}}).then(response => {
        this.list=response.body;
          this.getTerms();
          window.setTimeout(() =>{
            this.layout('post term query')
          }, 500);
        }, response => {
          console.log('error getting resources... ', response)
        });
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
