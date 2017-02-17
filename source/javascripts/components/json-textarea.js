var jsonTextarea = Vue.component('json-textarea', {
  template: '#json-textarea',
  data: function() {
    return {
      editor: ''
    }
  },
  methods: {
    visualize: function() {
      boshVue.setData('rawr');
    },
    useSample: function() {
      var self = this;
      console.log(aja);

      aja()
        .url('/javascripts/cf-vitals.json')
        .on('success', function(data) {
          self.editor.setValue(JSON.stringify(data, null, '\t'));
          self.setParentData(data);
        })
        .go();
    },
    setParentData: function(val) {
      boshVue.setData(val);
    }
  },
  mounted: function() {
    var self = this;
    var editor = document.getElementById('editor');
    var jsonEditor = CodeMirror(editor, {
      value: '// $ bosh instances --ps --vitals --details --json',
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      mode: { name: "javascript", json: true },
      theme: 'eclipse'
    });

    self.editor = jsonEditor;

    self.editor.on('changes', function() {
      var val = jsonEditor.getValue();
      self.setParentData(val);
    });
  }
});