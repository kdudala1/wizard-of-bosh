//= require vue
//= require vendor/lodash.core
//= require vendor/codemirror
//= require vendor/matchbrackets
//= require vendor/closebrackets
//= require vendor/javascript
//= require components/json-textarea

var editor = document.getElementById('editor');
var jsonEditor = CodeMirror(editor, {
  value: 'Rawr',
  lineNumbers: true,
  matchBrackets: true,
  autoCloseBrackets: true,
  mode: { name: "javascript", json: true },
  theme: 'eclipse'
});

var boshviz = new Vue({
  el: '#boshviz'
});
