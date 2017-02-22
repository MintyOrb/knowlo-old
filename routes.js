const landing = {
    template: `
  <main>
    <div class="section no-pad-bot" id="index-banner">
      <div class="container">
        <br>
        <br>
        <h1 class="header center blue-text thin">knowlo</h1>
        <div class="row center">
          <h5 class="header col s12 light">condensed insight.</h5>
        </div>
        <div class="row center">
          <router-link to="/e" class="btn-large waves-effect waves-light blue">expore</router-link>
        </div>
        <br>
        <br>

      </div>
    </div>
    <div class="container">
      <div class="section">

        <!--   Icon Section   -->
        <div class="row">
          <div class="col s12 m4">
            <div class="icon-block">
              <h2 class="center light-blue-text"><i class="material-icons large">collections</i></h2>
              <h5 class="center">excellent content</h5>

              <p class="light">Gather and rank the most insightful images, articles, and videos the internet has to offer on every subject.</p>
            </div>
          </div>

          <div class="col s12 m4">
            <div class="icon-block">
              <h2 class="center light-blue-text"><i class="material-icons large">explore</i></h2>
              <h5 class="center">universal context</h5>

              <p class="light">Understand the big picture by seeing how the media and ideas they teach relate to the time and size scales of the universe.</p>
            </div>
          </div>

          <div class="col s12 m4">
            <div class="icon-block">
              <h2 class="center light-blue-text"><i class="material-icons large">group</i></h2>
              <h5 class="center">see futher</h5>

              <p class="light">Test and expand the depth of your knowledge by contributing questions, answers, comments, criticims, and insights.</p>
            </div>
          </div>

        </div>

        <div class="row">
          <ul class="collapsible" data-collapsible="accordion">
              <li>
                <div class="collapsible-header active"><i class="material-icons">filter_drama</i>What is Knowlo?</div>
                <div class="collapsible-body">
                  <span>
                    <p>Right now? Not much more than a collection of interesting videos. However, the intention is for knowlo to become the best place to stand on the shoulder of giants.</p>
                    <p>Thanks to the internet, the sum of human knowedge is at our fingertips. But, there is no guide and it's difficult to search for something if you don't know that it exists.</p>
                    <p>Knowlo wants to provide a map of human knowledge. To show the best paths to the highest summits and to illustrate the current edges while provide the tools to expand them.</p>
                    <p>This map across all of time and size provides context for how our best insights relate to one another and are fundamentally part of the same fabric.</p>
                    <p>The goal is to make this map personal. To help you in identiying the current limits of your knowledge and how to push them.</p>
                </span>
                </div>
              </li>
            </ul>
        </div>

      </div>
      <br>
      <br>

    </div>
  </main>
  `
}

const explore = Vue.extend({
    template: `
<div>
    <div class='row'>
     <div style="height:100px"></div>   <!---temporary filler -->
      <div class="input-field col s10 offset-s1">
        <input type='text' id='search'  @keyup="filter('contains')" v-model="searchStr">
        <label for='search'>search</label>
      </div>
    </div>

    <div>
        <isotope style="min-height:80px" ref="selected" :list="selected" :options='getSelectedOptions()' >
          <div  v-for="word in selected"  class='selected'>
            <div @click="addToFrom(word, words, selected)"  class="hoverable chip">
                  {{word.name}} {{word.count}}
            </div>
          </div>
        </isotope>
    </div>

    <div>
        <isotope ref="key" :list="words" :options='getSuggestionOptions()' >
          <div v-for="word in words"  class='suggestion'>
            <div @click="addToFrom(word, selected, words)" class="hoverable chip">
                  {{word.name}} {{word.count}}
            </div>
          </div>
        </isotope>
    </div>
    <button @click="shuffle()" class='btn blue'>Shuffle<i class="material-icons right">shuffle</i></button>
    <button class="btn blue" @click="filter('show all')">show all</button>

    <div class="center pad">
    				<span class="viewBtn" @click="changeDisplay('list')"><i class="material-icons">view_list</i></span>
    				<span class="viewBtn" @click="changeDisplay('card')"><i class="material-icons">dashboard</i></span>
    				<span class="viewBtn" @click="changeDisplay('thumb')"><i class="material-icons">dialpad</i></span>
    				<br/>
		</div>

    <div class="button-group">
        <button class="btn blue" :class="[sortOption==='original-order'? 'is-checked' : '']" @click="sort('original-order')">original order</button>
        <button v-for="(key, val) in getSortData" class="btn blue" :class="[key===sortOption? 'is-checked' : '']" @click="sort(key)">{{key}}</button>
    </div>
    <isotope ref="contentBin" :list="list" :options='getContentOptions()' >
        <div v-for="item in list" class='element-item'>
          <div v-if="display == 'thumb'" class="thumb card-image waves-effect waves-block waves-light z-depth-1 hoverable">
              <a target="blank" :href="item.url">
                <img :src="'thumbs/'+item.videoid+'_SMALL_default.jpg'">
              </a>
          </div>
         <div  v-if="display == 'list'" class="list hoverable waves-effect waves-light" >
               <span class='truncate thin'>{{item.title}}</span>
          </div>
          <div v-if="display == 'card'" class="card hoverable">
            <div class='card-image'>
                <router-link :to="'/c/'+item.videoid">
                  <img :src= "item.thumb" class='card-image' alt="Not found">
               </router-link>
            </div>
            <div class='card-content'>
                <span class='title'>{{item.title}}</span>
                <p class="truncate">{{item.author}}</p>
            </div>
            <div class='card-action'>
              <span class='left card-bottom'><i class="tiny material-icons">visibility</i>{{trimNumber(item.viewcount,1)}}</span>
              <span class='right card-bottom'>{{item.rating.toString().substring(0,3)}}<i class="tiny material-icons">star</i></span>
            </div>
        </div>
      </isotope>
</div>
  `,
  data: function() {
        return {
            displayed: "",
            words: [],
            list: [],
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
                  if(this.selected.length === 0){
                    found = true
                  } else {
                    found = false
                  }
                  for (var keyIndex = 0; keyIndex < this.selected.length; keyIndex++) {
                    el.keywords.some((element, i) =>{
                      if (this.selected[keyIndex]['name'].toLowerCase().trim() === element.toLowerCase().trim()) {
                          found = true;
                      }
                    })
                  }
                  return found
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
      // getFilterString: function(content) {
      //     var filtString = "";
      //     for (var filter = this.filterFields.length - 1; filter >= 0; filter--) {
      //       if (content[this.filterFields[filter]]) {
      //         if (content[this.filterFields[filter]].indexOf(',') > -1) {
      //           var filties = content[this.filterFields[filter]].split(',');
      //           for (var filt in filties) {
      //             filtString += filties[filt].replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}).trim().replace(/\W+/g, "_") + " ";
      //           }
      //         } else {
      //           filtString += content[this.filterFields[filter]].trim().replace(/\W+/g, "_") + " ";
      //         }
      //       }
      //     }
      //     return filtString
      //   },
        addToFrom: function(name, to, from){
          this.addTo(name, to)
          this.removeFrom(name, from)
          this.filter('keywords')
        },
        addTo: function(item, theArray){
          theArray.push(item)
        },
        removeFrom: function(item, theArray){
          // this.selected = this.selected.filter(function(el) { // returns new array
          //     return el.name !== item.name;
          // });
          for( i=theArray.length-1; i>=0; i--) { // used same array
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
        getContentOptions: function() {
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
          this.$refs.contentBin.layout('masonry');
          this.$refs.key.layout('masonry');
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
      videos = videos.concat(videos2) // combine split json (split becuase it was too large as a single file for simplehttpserver)
      this.list = videos;
      window.setTimeout(()=>{ // temporary until a better way to determine when the page is ready is found
        this.layout()
      }, 1000)

      // limit number of initally displayed keys
      for(word in keywords){
        if(keywords[word]['count'] > 20){
          this.words.push(keywords[word])
        }
      }
      // this.words = keywords;
    }

});


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
