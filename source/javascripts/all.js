//= require vue
//= require vendor/element
//= require vendor/d3.v4.min
//= require vendor/lodash.core
//= require vendor/codemirror
//= require vendor/matchbrackets
//= require vendor/closebrackets
//= require vendor/javascript
//= require vendor/aja.min
//= require components/json-textarea
//= require components/visualization
//= require components/vm-detail

function getMetricFromString(str) {
  if(str.length > 0) {
    return parseInt(str.split('%')[0]);
  } else {
    return -1;
  }
}

var boshVue = new Vue({
  el: '#boshviz',
  components: [
    'json-textarea'
  ],
  data: {
    json: '',
    vm: {},
    visualizationLoaded: false,
    detailShowing: false
  },
  methods: {
    setData: function(data) {
      this.json = data;
    },
    checkJsonLength: function() {
      return true;
    },
    visualize: function() {
      this.visualizationLoaded = true;
    },
    show: function(vm) {
      var detailedVm = {
        name: vm.details[0].split('/')[0],
        state: vm.details[1],
        instance: vm.details[0].split('/')[1],
        az: vm.details[2],
        ips: vm.details[3],
        cid: vm.details[4],
        type: vm.details[5],
        metrics: [
          { label: 'CPU Total', value: getMetricFromString(vm.details[16]) },
          { label: 'CPU User', value: getMetricFromString(vm.details[17]) },
          { label: 'CPU Sys', value: getMetricFromString(vm.details[18]) },
          { label: 'CPU Wait', value: getMetricFromString(vm.details[19]) },
          { label: 'Memory', value: getMetricFromString(vm.details[20]) },
          { label: 'Swap', value: getMetricFromString(vm.details[21]) },
          { label: 'System Disk', value: getMetricFromString(vm.details[22]) },
          { label: 'Ephemeral Disk', value: getMetricFromString(vm.details[23]) },
          { label: 'Persistent Disk', value: getMetricFromString(vm.details[24]) }
        ],
        processes: vm.processes
      };

      this.detailShowing = true;
      this.vm = detailedVm;

    }
  }
});