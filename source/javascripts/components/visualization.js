function buildD3(json) {
  // if(adminVue.isLoaded) {
  //   destroyD3();
  //   adminVue.clear();
  // }

  // adminVue.isLoaded = true;

  setTimeout(function() {
    var svg = d3.select("svg"),
      diameter = +svg.attr("width"),
      g = svg.append("g").attr("transform", "translate(1,1)"),
      format = d3.format(",d");

    var bod = d3.select('#vis-wrap')
      .call(d3.zoom().on('zoom', function() {
        g.attr('transform', d3.event.transform)
      }))

    var pack = d3.pack()
      .padding(35)
      .size([diameter - 4, diameter - 4]);

    var root = json;

    root = d3.hierarchy(root)
        .sum(function(d) { return d.size; })
        .sort(function(a, b) { return b.value - a.value; });

    var node = g.selectAll(".node")
      .data(pack(root).descendants())
      .enter().append("g")
        .attr("class", function(d) { return d.children ? "node" : "leaf node"; })
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("title")
      .text(function(d) { return d.data.name + "\n" + format(d.value); });

    node.append("circle")
    .attr("r", function(d) { return (d.r); })
    .attr("class", function(d) {
      return d.data.status
    });

    d3.selectAll(".leaf.node circle").on("click", function (d) {
      boshVue.show(d.data);
      var activeClass = "active";
      var alreadyIsActive = d3.select(this.parentNode).classed(activeClass);
      svg.selectAll(".leaf.node")
        .classed(activeClass, false);
      d3.select(this.parentNode).classed(activeClass, !alreadyIsActive);
    });

    node.filter(function(d) { return !d.children; }).append("text")
        .attr("dy", "0.3em")
        .text(function(d) { return d.data.name.substring(0, d.r / 3); });
  })
}

Vue.component('visualization', {
	template: '#visualization',
	props: ['deployment'],
	mounted: function() {
		var self = this;
    try {
      var parsedJson = JSON.parse(this.deployment);
      var d3Json = {
        name: 'vms',
        children: []
      };

      function pullProcesses(rows) {
        var processes = [];

        _.each(rows, function(row) {
          if( row[1].length > 0 ) {
            processes.push({
              instance: row[0],
              process: row[1],
              uptime: row[14],
              processState: row[2],
              memory: getMetricFromString(row[20]),
              az: row[3],
              ips: row[4]
            });
          }
        });

        return processes;
      }

      _.each(parsedJson.Tables, function(table) {
        var processes = pullProcesses(table.Rows);
        var vms = [];

        _.each(table.Rows, function(row) {
          if(row[1].length == '') {
            var rowProcesses = _.filter(processes, function(process) {
              return process.instance == row[0];
            });

            vms.push({
              name: row[0].split('/')[0],
              status: row[2],
              details: row,
              processes: rowProcesses,
              size: 200
            });

          }
        });

        d3Json.children.push({
          name: 'depl',
          children: vms
        });
      });

      buildD3(d3Json);
    }

    catch(err) {
      console.log(err);
      self.$message.error('Oops, we couldn\'t parse your JSON.');
    }

	}
});