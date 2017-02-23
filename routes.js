/*
██       █████  ███    ██ ██████  ██ ███    ██  ██████
██      ██   ██ ████   ██ ██   ██ ██ ████   ██ ██
██      ███████ ██ ██  ██ ██   ██ ██ ██ ██  ██ ██   ███
██      ██   ██ ██  ██ ██ ██   ██ ██ ██  ██ ██ ██    ██
███████ ██   ██ ██   ████ ██████  ██ ██   ████  ██████
*/
const landing = {
    template: "#landingTemplate"
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
            flickRegistry: [],
            displayed: "",
            words: [],
            list: [],
            numberOfDisplayed: 0,
            display: 'card',
            currentLayout: 'masonry',
            selected: [],
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
      createFlickity: function(id){
        this.flickRegistry.push(id);// register flick

        setTimeout(function(){ // allow time for card reveal
          $('.flickContainer' + id).flickity({
            wrapAround: true,
            pageDots: false,
            prevNextButtons: false,
            accessibility: false, // to prevent jumping when focused
          });

          //   $('.flickNav' + id).flickity({
          //     asNavFor: '.flickContainer' + id,
          //     contain: true,
          //     pageDots: false,
          //     prevNextButtons: false
          //   });
          // }, 10);
          })
        },
        destroySingleFlickity: function(id){
          $('.flickContainer' + id).flickity('destroy');
          $('.flickNav' + id).flickity('destroy');
          for(index in this.flickRegistry){
            if(this.flickRegistry[index] == id){
              this.flickRegistry.splice(index,1)
              break
            }
          }
        },
        destroyAllFlickity: function(){
          for(var index in this.flickRegistry){
            this.destroySingleFlickity(this.flickRegistry[index]);
          }
          this.flickRegistry=[];
        },
        updateSuggestedKewords: function(){ // this solution is wayyyy to slow. try something here? http://codereview.stackexchange.com/questions/96096/find-common-elements-in-a-list-of-arrays
          this.words = []
          // build array of suggested
          for (var contentIndex = 0; contentIndex < this.list.length; contentIndex++) { // each returned content
            for (var key = 0; key < this.list[contentIndex]['keywords'].length; key++) { // each keyword
              // console.log(this.list[contentIndex]['keywords'][key].toLowerCase())
              found = false;
              for (var word = 0; word < this.words.length; word++) { // each cumulative

                if(this.words[word]['word'].toLowerCase() == this.list[contentIndex]['keywords'][key].toLowerCase()){
                  found = true;
                  this.words[word]['count'] +=1;
                  break
                }
              }
              if(!found){
                this.words.push({
                  'count': 0,
                  'word': this.list[contentIndex]['keywords'][key]
                })
              }
            }
          }
          // add/remove from words
        },
        bigSmallTag: function(word){
          if(word.expanded){
            this.destroySingleFlickity(word.name)
          } else {
            this.createFlickity(word.name)
          }
          word.expanded = !word.expanded
          this.$nextTick(function(){
            this.layout()
          })
        },
        addToFrom: function(tag, to, from){
          if(tag.expanded){
              this.destroySingleFlickity(tag.name)
              tag.expanded = false;
          }

          if(to){this.addTo(tag, to)};
          if (from) {this.removeFrom(tag, from)};

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
              this.$refs.contentBin.sort(key);
              this.sortOption = key;
            })
        },
        shuffle: function(key) {
            this.$refs.contentBin.shuffle();
            this.$refs.key.shuffle();
        },
        filter: function(key) {
            this.$refs.contentBin.filter(key);
        },
        layout: function() {
          if(this.$refs.contentBin){
            this.$refs.contentBin.layout('masonry');
            this.$refs.key.layout('masonry');
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
    directives: {
        imagesLoaded
    },
    mounted: function(){

      this.list = videos;

      window.setTimeout(()=>{ // temporary until a better way to layout after things have loaded
        this.layout()
      }, 1000)

      // limit number of initally displayed keys
      for(word in keywords){
        if(keywords[word]['count'] > 20){
          this.words.push(keywords[word])
        }
      }
      // this.words = keywords;
      //alpha warning
      if(!Cookies.get('alpha-warning-seen')){
        console.log('in coooooook')
        Cookies.set('alpha-warning-seen', true, { expires: 7 });
        var $toastContent = $("<span>Hi! Knowlo is pre-alpha right now. There's not a lot to see and what there is will probably break.</span>");
        Materialize.toast($toastContent, 10000);
      } else {
        Cookies.set('alpha-warning-seen', true, { expires: 7 }); // reset expiry
      }
    }
});

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
