Vue.component('vm-detail', {
	template: '#vm-detail',
	props: ['vm'],
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