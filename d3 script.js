function init() {

    var w = 800;
    var h = 300;
    var padding = 60;

    var formatTime = d3.timeFormat("%Y");
    var dataset

    d3.csv("Simplified dataset.csv", function(d) {
      return {
        year: new Date(d.TIME_PERIOD),
        percentage: +d.OBS_VALUE,
        country: d.Reference_area
      };
    }).then(function(dataset) {

      xScale = d3.scaleTime()
       .domain([
        d3.min(dataset, function(d) { return d.year; }),
        d3.max(dataset, function(d) { return d.year; })
      ])
       .range([padding, w]);

      yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) { return d.percentage; })])
        .range([h - padding, 0]);

      xAxis = d3.axisBottom()
       .scale(xScale)
       .ticks(10)
       .tickFormat(formatTime);

       yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10);

      line = d3.line()
        .defined(function(d) { return d.country == "Australia";})
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.percentage); });

      line2 = d3.line()
        .defined(function(d) { return d.country == "Austria";})
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.percentage); });

      var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      svg.append("path")
        .datum(dataset)
        .attr("class", "line")
        .attr("d", line);

      svg.append("path")
        .datum(dataset)
        .attr("class", "line2")
        .attr("d", line2);

      svg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + (h - padding) + ")")
				.call(xAxis);

			svg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(" + padding + ",0)")
				.call(yAxis);

    });



}

window.onload = init;
