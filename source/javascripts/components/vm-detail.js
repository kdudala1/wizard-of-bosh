Vue.component('vm-detail', {
	template: '#vm-detail',
	props: ['vm'],
  data: function() {
    return {
      activeTab: 'metrics'
    }
  },
  methods: {
    closeDetail: function() {
      boshVue.closeDetail();
    }
  },
	computed: {
		sortedMetrics: function() {
      var filteredMetrics = _.filter(this.vm.metrics, function(metric) {
        return metric.value !== -1;
      });

      return filteredMetrics.sort(function(a,b) {
        return b.value - a.value;
      })
    }
	}
});