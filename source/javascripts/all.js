//= require vue
//= require vendor/element
//= require vendor/lodash.core
//= require vendor/codemirror
//= require vendor/matchbrackets
//= require vendor/closebrackets
//= require vendor/javascript
//= require components/json-textarea

var boshVue = new Vue({
  el: '#boshviz',
  components: [
    'json-textarea'
  ],
  data: {
    json: ''
  },
  methods: {
    setData: function(data) {
      this.json = data;
    },
    checkJsonLength: function() {
      return true;
    }
  }
});