Vue.component('json-textarea', {
  template: '#json-textarea',
  mounted: function() {
    var editor = document.getElementById('editor');
    var jsonEditor = CodeMirror(editor, {
      value: '// $ bosh instances --ps --vitals --details --json',
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      mode: { name: "javascript", json: true },
      theme: 'eclipse'
    });
  }
})
