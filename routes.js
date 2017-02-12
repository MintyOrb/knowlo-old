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
              <h2 class="center light-blue-text"><i class="material-icons">collections</i></h2>
              <h5 class="center">add content</h5>

              <p class="light">Submit and rank the most insightful images, articles, and videos, the internet has to offer on every subject.</p>
            </div>
          </div>

          <div class="col s12 m4">
            <div class="icon-block">
              <h2 class="center light-blue-text"><i class="material-icons">explore</i></h2>
              <h5 class="center">add context</h5>

              <p class="light">Understand the big picture by seeing how the content relates to the time and size scales of the universe.</p>
            </div>
          </div>

          <div class="col s12 m4">
            <div class="icon-block">
              <h2 class="center light-blue-text"><i class="material-icons">group</i></h2>
              <h5 class="center">see futher</h5>

              <p class="light">Test and expand the depth of your understanding by contributing questions, answers, comments, criticims, and insights.</p>
            </div>
          </div>

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
    <button @click="shuffle()" class='btn blue'>Shuffle<i class="material-icons right">shuffle</i></button>
    <button class="btn blue" @click="filter('show all')">show all</button>

    <!-- <div class="center pad">
    				<span class="viewBtn" :click="changeDisplay('list')"></span><i class="material-icons">view_list</i></span>
    				<span class="viewBtn" :click="changeDisplay('card')"></span><i class="material-icons">dashboard</i></span>
    				<span class="viewBtn" :click="changeDisplay('thumb')"></span><i class="material-icons">dialpad</i></span>
    				<br/>
    				<div class="right thin" style="margin-right: 8%;">Showing </div>
    				<br>
		</div> -->

    <div class="button-group">
        <button class="btn blue" :class="[sortOption==='original-order'? 'is-checked' : '']" @click="sort('original-order')">original order</button>
        <button v-for="(key, val) in getSortData" class="btn blue" :class="[key===sortOption? 'is-checked' : '']" @click="sort(key)">{{key}}</button>
    </div>

    <!-- <isotope ref="keywords" id="keywordss" :item-selector="'list-item'" :list="words" :options='getOptions' @filter="filterOption=arguments[2]" @sort="" @layout="currentLayout=arguments[0]">
      <div v-for="element in words" :class='[element.category]'>
        <p>{{element.word}}</p>
        <p>{{element.cound}}</p>
      </div>
    </isotope> -->

    <!-- <div class="fixed-action-btn horizontal click-to-toggle">
    <a class="btn-floating btn-large red">
      <i class="material-icons">menu</i>
    </a>
    <ul>
      <li><a class="btn-floating red"><i class="material-icons">insert_chart</i></a></li>
      <li><a class="btn-floating yellow darken-1"><i class="material-icons">format_quote</i></a></li>
      <li><a class="btn-floating green"><i class="material-icons">publish</i></a></li>
      <li><a class="btn-floating blue"><i class="material-icons">attach_file</i></a></li>
    </ul>
  </div> -->

    <isotope ref="elementBin" :list="list" :options='getOptions()' >
        <div v-for="item in list" class=''>
          <!-- <div class="thumb card-image waves-effect waves-block waves-light z-depth-1 hoverable">
              <a target="blank" :href="item.url">
                <img :src="'thumbs/'+item.videoid+'_SMALL_default.jpg'">
              </a>
          </div> -->
          <!-- <div class="list hoverable waves-effect waves-light" >
               <span class='truncate thin'>{{item.title}}</span>
          </div> -->
          <div class="card hoverable">
            <div class='card-image'>
                <router-link :to="'/c/'+item.videoid">
                <!-- <a target="blank" :href="item.url"> -->
                  <img :src="'thumbs/'+item.videoid+'_SMALL_default.jpg'" class='card-image' alt="Not found">
                  <!-- <img :src= "item.thumb" class='card-image' alt="Not found"> -->
                <!-- </a> -->
               </router-link>
                <!-- <a class="btn-floating halfway-fab waves-effect waves-light red"><i class="material-icons">add</i></a> -->
            </div>
            <div class='card-content'>
                <span class='title'>{{item.title}}</span>
                <p class="truncate">{{item.author}}</p>
            </div>
            <hr />
            <div class=''>
              <span class='left'><i class="small material-icons">visibility</i>{{trimNumber(item.viewcount,1)}}</span>
              <span class='right'>{{item.rating.toString().substring(0,3)}}<i class="small material-icons">star</i></span>
            </div>
          </div>
        </div>
      </isotope>
</div>
  `,
  data: function() {
        return {
            words: [],
            list: videos,
            currentLayout: 'masonry',
            selected: null,
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
                "show all": function() {
                    return true;
                },
                "contains": (el) => {
                    return el.description.toLowerCase().includes(this.searchStr.toLowerCase())
                    // return el.keywords.indexOf(this.searchStr.toLowerCase()) > 0;
                }
            },
        }
    },
    methods: {
        getOptions: function() {
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
              this.$refs.elementBin.sort(key);
              this.sortOption = key;
            })
        },
        shuffle: function(key) {
            this.$refs.elementBin.shuffle();
        },
        filter: function(key) {
            this.$refs.elementBin.filter(key);
        },
        layout () {
            this.$refs.elementBin.layout('masonry');
        },
        trimNumber: function(num, digits) { // from http://stackoverflow.com/a/9462382/2061741
          var si = [
            { value: 1E18, symbol: "E" },
            { value: 1E15, symbol: "P" },
            { value: 1E12, symbol: "T" },
            { value: 1E9,  symbol: "G" },
            { value: 1E6,  symbol: "M" },
            { value: 1E3,  symbol: "k" }
          ], rx = /\.0+$|(\.[0-9]*[1-9])0+$/, i;
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
      videos = videos.concat(videos2) /// combine split json (split becuase it was too large as a single file for simplehttpserver)
      window.setTimeout(()=>{ // temporary
        this.layout()
      }, 500)

    //   for (var video = 0; video < videos.length; video++) { // each video
    //
    //     for (var key = 0; key <   videos[video]['keywords'].length; key++) { // each keyword
    //       console.log(videos[video]['keywords'][key].toLowerCase())
    //       found = false;
    //       for (var word = 0; word < this.words.length; word++) { // each cumulative
    //
    //         if(this.words[word]['word'].toLowerCase() == videos[video]['keywords'][key].toLowerCase()){
    //           found = true;
    //           this.words[word]['count'] +=1;
    //           break
    //         }
    //       }
    //       if(!found){
    //         this.words.push({
    //           'count': 0,
    //           'word': videos[video]['keywords'][key].toLowerCase()
    //         })
    //       }
    //
    //     }
    //   }
    //   console.log('done')
    //   console.log(this.words)
    }
});


const content = Vue.extend({
    template: `
    <div>
      <h1>{{content.title}}</h1>
      <iframe :src="content.url">
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
