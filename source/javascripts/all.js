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

var boshVue = new Vue({
  el: '#boshviz',
  components: [
    'json-textarea'
  ],
  data: {
    isCollapsed: false,
    activeNames: ['1'],
    json: '',
    vm: {},
    visualizationLoaded: false,
    detailShowing: false
  },
  methods: {
    clear: function() {
      var svg = d3.select("svg");
      svg.select("g").remove();
      this.vm = {};
      this.detailShowing = false;
    },
    closeDetail: function() {
      this.detailShowing = false;
      var svg = d3.select("svg");
      svg.selectAll(".leaf.node")
        .classed('active', false);
    },
    setData: function(data) {
      this.json = data;
    },
    checkJsonLength: function() {
      return true;
    },
    visualize: function() {
      this.activeNames = [];

      var self = this;
      if(this.visualizationLoaded) {
        this.clear();
      }

      try {
        var d3Json = transformBoshJson(this.json);
        buildD3(d3Json);
      }

      catch(err) {
        console.log(err);
        self.$message.error('Oops, we couldn\'t parse your JSON.');
      }

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
        type: vm.details[7],
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

function buildD3(json) {
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
        .attr("dy", function(d) { return d.r + 15})
        .text(function(d) { return d.data.name.substring(0, d.r / 3); });
  })
}

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

function getSizeFromVmType(type) {
  var size;

  switch(type) {
    case 't2.small':
      size = 1;
      break;
    case 'm3.medium':
      size = 2;
      break;
    case 'm3.large':
      size = 3;
      break;
    case 'c3.large':
      size = 5;
      break;
    case 'r3.xlarge':
      size = 8;
      break;
  }

  return size;
}

function transformBoshJson(json) {
  var parsedJson = JSON.parse(json);
  var d3Json = {
    name: 'vms',
    children: []
  };

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
          size: getSizeFromVmType(row[7])
        });

      }
    });

    var grouped = _.groupBy(vms, 'name');
    var split = [];
    _.forIn(grouped, function(key, value) {
      var obj = {};
      var vmName = value;
      var d3Obj = key;
      obj.name = vmName;
      obj.children = d3Obj;
      split.push(obj);
    });

    d3Json.children.push({
      name: 'depl',
      children: split
    });
  });

  return d3Json;
}

function getMetricFromString(str) {
  if(str.length > 0) {
    return parseInt(str.split('%')[0]);
  } else {
    return -1;
  }
}