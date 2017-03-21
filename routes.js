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
          draggable: true // Choose whether you can drag to open on touch screens
        }
      );
    }
}

/*
███████ ██   ██ ██████  ██       ██████  ██████  ███████
██       ██ ██  ██   ██ ██      ██    ██ ██   ██ ██
█████     ███   ██████  ██      ██    ██ ██████  █████
██       ██ ██  ██      ██      ██    ██ ██   ██ ██
███████ ██   ██ ██      ███████  ██████  ██   ██ ███████
*/
const explore = Vue.component('exploreComp',{
  template: "#exploreTemplate",
  props: ['tagQuery'],
  data: function() {
        return {
            db: undefined,                      // search results to display - array of material objects
            crossSection: null,                 // object containing the name of the cross section and tags in lens group - object containing array of tag objects and string name
           //tagQuery: [],                       // tags selected for search - - array of tag objects with flags for include/exclude/pin etc.
            words: [],                          // suggested tags...not sure about ui, currently  - array of tag objects
            list: [],                           // db when no lens, replace with db even though less items? - array of tag objects
            numberOfDisplayed: null,            // number of materials currently displayed
            display: undefined,                 // display option for materials in search result - string name of displaytype
            currentLayout: 'masonry',           // incase want to change isotope display type...not used now
            sortOption: "original-order",       // to sort search results by - string name
            sortAscending: true,                // whether sort whould be ascending or descending - boolean
            filterOption: "show all",
            searchStr: null,                    // current user entered search text - string
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
                  for (var keyIndex = 0; keyIndex < this.tagQuery.length; keyIndex++) {
                    foundOne = false
                    el.keywords.some((element, i) =>{
                      if (this.tagQuery[keyIndex]['name'].toLowerCase().trim() === element.toLowerCase().trim()) {
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
        addToFrom: function(tag, to, from){ /// this is all stupid and needs to be re thoughts.

          if(tag.status.focus){ // clear all non pinned terms
            console.log('tag focused')
            for (var tagIndex = to.length - 1 ; tagIndex >= 0; tagIndex --) {
              console.log(to[tagIndex].status)
              if(!to[tagIndex].status.pinned){
                to.splice(to[tagIndex], 1)
                console.log('not pinned')
              }
            }
          }

          if(to){this.addTo(tag, to)};
          if(from) {this.removeFrom(tag, from)};

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
                if(steps[stepIndex].tagName  !== undefined){
                  steps[stepIndex]['__vue__'].sort(key)
                }
              }
              // this.$refs.contentBin.sort(key);
              this.sortOption = key;
            })
        },
        shuffle: function(key) {
            this.$refs.contentBin.shuffle();
            this.$refs.key.shuffle();
            this.$refs.tagQuery.shuffle();
        },
        filter: function(key) {
            // this.$refs.contentBin.filter(key);
            this.numberOfDisplayed =   this.$refs.contentBin.getFilteredItemElements().length
        },
        layout: function(mes) {
          console.log('in layout: ', mes) // just for testing vue-images-loaded. Which I may never get to wrok.
          this.$refs.tagQuery.layout('masonry');

           // pretty serious antipattern here...make a registery when using cross section views instead?
          var steps = $('.step'); // get isotope containers with jquery
          for (var stepIndex = 0; stepIndex < steps.length; stepIndex++) {
            if(steps[stepIndex].tagName !== undefined && steps[stepIndex]['__vue__'] != null){
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
        }
    },
    mounted: function(){

      // redirect to landing if first time to knowlo
      if(Cookies.get('returning') == undefined){
        Cookies.set('returning', true, { expires: 7 });
        this.$router.push('/land');
      } else {
        //alpha warning - only show on explore page
        if(!Cookies.get('alpha-warning-seen')){
          Cookies.set('alpha-warning-seen', true, { expires: 7 });
          var $toastContent = $("<span>Hi! Knowlo is pre-alpha right now. There's not a lot to see and what there is will probably break.</span>");
          Materialize.toast($toastContent, 10000);
        } else {
          Cookies.set('alpha-warning-seen', true, { expires: 7 }); // reset expiry
        }
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
      this.list = videos;

      this.db = db;
      this.bigHistory = bigHistory;
      this.size = disciplines;

      // limit number of initally displayed keys
      for(word in keywords){
        if(keywords[word]['count'] > 20){
          this.words.push(keywords[word])
        }
      }
      // this.words = keywords;

        bus.$on('addTagSubTag', (tag) => {
          this.addToFrom(tag, this.tagQuery)
        })

    }
});

/*
████████  █████   ██████
   ██    ██   ██ ██
   ██    ███████ ██   ███
   ██    ██   ██ ██    ██
   ██    ██   ██  ██████
*/
Vue.component('tag',{
    template: "#tagContainer",
    name: "tag",
    props: ['tag'],
    data: () =>  {
      return {
        flickRegistry: []
      }
    },
    methods: {
      addFromSub: function(tag){ // there must be a better way to add sub tag...
        bus.$emit('addTagSubTag', tag)
      },
      focus: function(tag){
        console.log(this.$parent)

      },
      pin: function(tag){

      },
      addToFrom: function(tag, type){
        if(tag.status[type] == undefined){
          tag.status[type] = true; // need to add logic for combinations... ex: can't be both inclded and excluded. Track with string instead? status.type = "exclude"
        } else {
          tag.status[type] = !tag.status[type]
        }
        if(tag.status.expanded){
            this.destroySingleFlickity(tag.name)
            tag.status.expanded = false;
        }
        tag.status.hover = false;
        this.$emit('add-me')
      },
      bigSmallTag: function(word){
        if(word.group){
          if(word.status.expanded){
            this.destroySingleFlickity(word.name)
          } else {
            this.createFlickity(word.name)
          }
          word.status.expanded = !word.status.expanded
        }
        window.setTimeout(()=>{
          this.$emit('lay-me')
        },500)
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
        delayHover: function(item, parentID){
          item.parentID = parentID;
          item.left=false;
          window.setTimeout(()=>{
            if(!item.left){
                item.status.hover=true
            }
          }, 300)
        },
        leave: function(tag){
          tag.left=true;
          tag.status.hover=false;
        }
    }
});

var bus = new Vue() // this feels dumb, but can't see how else to tell explore what sub tag was added

/*
 ██████  ██████  ███    ██ ████████ ███████ ███    ██ ████████     ██████   █████   ██████  ███████
██      ██    ██ ████   ██    ██    ██      ████   ██    ██        ██   ██ ██   ██ ██       ██
██      ██    ██ ██ ██  ██    ██    █████   ██ ██  ██    ██        ██████  ███████ ██   ███ █████
██      ██    ██ ██  ██ ██    ██    ██      ██  ██ ██    ██        ██      ██   ██ ██    ██ ██
 ██████  ██████  ██   ████    ██    ███████ ██   ████    ██        ██      ██   ██  ██████  ███████
*/
const resourceComp = Vue.component('resourceComp',{
    template: "#resourceTemplate",
    data: function() {
          return {
              resource: {},
              resourceSection: ["Activity","Tags","Vote","Stats","Related"]
            }
          },
    methods: {
      find: function(id){
          for (var i = 0; i < videos.length; i++) {
            if(videos[i]['videoid'] == id){
              return videos[i]
              break
            }
          }
      },
      exit: (id) => {
        console.log('exit here')
        $('#resourceModal'+id).modal('close');

      }
    },
    mounted: function(){
      this.resource = this.find(this.$route.params.id)
      $('#resourceModal'+this.resource.id).modal({
          dismissible: true, // Modal can be dismissed by clicking outside of the modal
          opacity: .5, // Opacity of modal background
          inDuration: 300, // Transition in duration
          outDuration: 200, // Transition out duration
          startingTop: '4%', // Starting top style attribute
          endingTop: '10%', // Ending top style attribute
          ready: function(modal, trigger) { // Callback for Modal open. Modal and trigger parameters available.
            console.log("Ready");
            console.log(modal, trigger);
          },
          complete: () => {
            $('.resourceNav').flickity('destroy');
            $('.resourceSections').flickity('destroy');
            this.$router.push('/')
          }
        })

      $('#resourceModal'+this.resource.id).modal('open');

      $('.resourceNav').flickity({
        asNavFor: '.resourceSections',
        // wrapAround: true,
        pageDots: true,
        prevNextButtons: true,
        accessibility: false, // to prevent jumping when focused
      })

      $('.resourceSections').flickity({
        wrapAround: true,
        pageDots: false,
        prevNextButtons: true,
        accessibility: false, // to prevent jumping when focused
        dragThreshold: 40 // play around with this more?
      });

      // from http://kempe.net/blog/2014/06/14/leaflet-pan-zoom-image.html
      var map = L.map('image-map', {
        minZoom: 1,
        maxZoom: 4,
        center: [0, 0],
        zoom: 1,
        crs: L.CRS.Simple
      });

      // dimensions of the image
      var w = 2000,
          h = 1500,
          url = 'http://kempe.net/images/newspaper-big.jpg';

      // calculate the edges of the image, in coordinate space
      var southWest = map.unproject([0, h], map.getMaxZoom()-1);
      var northEast = map.unproject([w, 0], map.getMaxZoom()-1);
      var bounds = new L.LatLngBounds(southWest, northEast);

      // add the image overlay,
      // so that it covers the entire map
      L.imageOverlay(url, bounds).addTo(map);

      // tell leaflet that the map is exactly as big as the image
      map.setMaxBounds(bounds);
    }
});
