var INITIAL_EDITOR_VALUE = '// $ bosh instances --ps --vitals --details --json';

var jsonTextarea = Vue.component('json-textarea', {
  template: '#json-textarea',
  data: function() {
    return {
      editor: '',
      editorValue: INITIAL_EDITOR_VALUE
    }
  },
  methods: {
    needsJson: function() {
      return this.editorValue == INITIAL_EDITOR_VALUE || this.editorValue.length == 0;
    },
    visualize: function() {
      boshVue.visualize();
    },
    useSample: function() {
      var self = this;

      aja()
        .url('/javascripts/cf-vitals.json')
        .on('success', function(data) {
          var stringified = JSON.stringify(data, null, '\t');
          self.editor.setValue(stringified);
          self.setParentData(stringified);
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
      value: INITIAL_EDITOR_VALUE,
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      mode: { name: "javascript", json: true },
      theme: 'eclipse'
    });

    self.editor = jsonEditor;

    self.editor.on('changes', function() {
      var val = jsonEditor.getValue();
      self.editorValue= val;
      self.setParentData(val);
    });
  }
});