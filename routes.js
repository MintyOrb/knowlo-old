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
    }
}

/*
███████ ██   ██ ██████  ██       ██████  ██████  ███████
██       ██ ██  ██   ██ ██      ██    ██ ██   ██ ██
█████     ███   ██████  ██      ██    ██ ██████  █████
██       ██ ██  ██      ██      ██    ██ ██   ██ ██
███████ ██   ██ ██      ███████  ██████  ██   ██ ███████
*/
const explore = Vue.extend({
  template: "#exploreTemplate",
  data: function() {
        return {
            db: undefined,
            crossSection: null,
            displayed: "",
            selected: [],
            words: [],
            list: [],
            numberOfDisplayed: null,
            display: undefined,
            currentLayout: 'masonry',
            sortOption: "original-order",
            filterOption: "show all",
            searchStr: null,
            getSortData:  {
                rating: "rating",
                viewcount: "viewcount",
                author: "author",
                dislikes: "dislikes",
                length: "length",
                likes: "likes"
            },
            sortAscending: true,
            getFilterData: {
                "keywords": (el) => {
                  foundAll = true
                  for (var keyIndex = 0; keyIndex < this.selected.length; keyIndex++) {
                    foundOne = false
                    el.keywords.some((element, i) =>{
                      if (this.selected[keyIndex]['name'].toLowerCase().trim() === element.toLowerCase().trim()) {
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
        // updateSuggestedKewords: function(){ // this solution is wayyyy to slow. try something here? http://codereview.stackexchange.com/questions/96096/find-common-elements-in-a-list-of-arrays
        //   this.words = []
        //   // build array of suggested
        //   for (var contentIndex = 0; contentIndex < this.list.length; contentIndex++) { // each returned content
        //     for (var key = 0; key < this.list[contentIndex]['keywords'].length; key++) { // each keyword
        //       // console.log(this.list[contentIndex]['keywords'][key].toLowerCase())
        //       found = false;
        //       for (var word = 0; word < this.words.length; word++) { // each cumulative
        //
        //         if(this.words[word]['word'].toLowerCase() == this.list[contentIndex]['keywords'][key].toLowerCase()){
        //           found = true;
        //           this.words[word]['count'] +=1;
        //           break
        //         }
        //       }
        //       if(!found){
        //         this.words.push({
        //           'count': 0,
        //           'word': this.list[contentIndex]['keywords'][key]
        //         })
        //       }
        //     }
        //   }
        // },
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
        getContentOptions: function() { // need to rethink managing multiple iso instances
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
            this.$refs.selected.shuffle();
        },
        filter: function(key) {
            this.$refs.contentBin.filter(key);
            this.numberOfDisplayed =   this.$refs.contentBin.getFilteredItemElements().length
        },
        layout: function(mes) {
          console.log('in layout: ', mes) // just for testing vue-images-loaded. Which I may never get to wrok.
          // this.$refs.key.layout('masonry');
          this.$refs.selected.layout('masonry');
          var steps = $('.step'); // pretty serious antipattern here...make a registery when using cross section views instead?
          for (var stepIndex = 0; stepIndex < steps.length; stepIndex++) {
            if(steps[stepIndex].tagName  !== undefined){
              steps[stepIndex]['__vue__'].layout('masonry')
            }
          }

        },
        trimNumber: function(num, digits) { // from http://stackoverflow.com/a/9462382/2061741
          var si = [ { value: 1E18, symbol: "E" }, { value: 1E15, symbol: "P" }, { value: 1E12, symbol: "T" }, { value: 1E9,  symbol: "G" }, { value: 1E6,  symbol: "M" }, { value: 1E3,  symbol: "k" }], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;
          for (i = 0; i < si.length; i++) {
            if (num >= si[i].value) {
              return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
            }
          }
          return num.toFixed(digits).replace(rx, "$1");
        }
    },
    watch: {
      crossSection: function(newVal, oldVal){
        if(newVal !== oldVal){
          $('.crossSectionNav').flickity('destroy');
          $('.crossSectionSteps').flickity('destroy');
          this.$nextTick(function(){
          $('.crossSectionNav').flickity({
            asNavFor: '.crossSectionSteps',
            // wrapAround: true,
            pageDots: true,
            prevNextButtons: true,
            accessibility: false, // to prevent jumping when focused
          });
          $('.crossSectionSteps').flickity({
            wrapAround: true,
            pageDots: true,
            prevNextButtons: true,
            accessibility: false, // to prevent jumping when focused
            dragThreshold: 40
          });
        })
        } else {
          $('.crossSectionNav').flickity('destroy');
          $('.crossSectionSteps').flickity('destroy');
        }

      }
    },
    mounted: function(){

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

      //alpha warning
      if(!Cookies.get('alpha-warning-seen')){
        Cookies.set('alpha-warning-seen', true, { expires: 7 });
        var $toastContent = $("<span>Hi! Knowlo is pre-alpha right now. There's not a lot to see and what there is will probably break.</span>");
        Materialize.toast($toastContent, 10000);
      } else {
        Cookies.set('alpha-warning-seen', true, { expires: 7 }); // reset expiry
      }
      // display Style
      if(!Cookies.get('displayStyle')){
        this.display = "card";
      } else {
        this.display = Cookies.get('displayStyle');
      }

      $('.dropdown-button').dropdown();
      $('.step').imagesLoaded() // layout when images loaded and on progress
        .always( ( instance ) => {
          console.log('all images loaded');
          this.layout('from images loaded, finished.')
        })
        .progress( ( instance, image ) => { // this doesn't seem to be working?
          var result = image.isLoaded ? 'loaded' : 'broken';
          console.log( 'image is ' + result + ' for ' + image.img.src );
          this.layout('from images loaded, progress made.')

        });
    },
    created: function(){
        bus.$on('addTagSubTag', (tag) => {
          this.addToFrom(tag, this.selected)
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
const content = Vue.extend({
    template: `
    <div class="container">
      <h4 class="center thin">{{content.title}}</h4>
      <div class="row video-container ">
          <iframe :src="'http://youtube.com/embed/'+content.videoid">
      </div>
    </div>
    `,
    data: function() {
          return {
              content: {},
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
      }
    },
    mounted: function(){
      this.content = this.find(this.$route.params.id)
    }
});
