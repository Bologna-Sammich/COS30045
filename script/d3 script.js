function init() {

    var w = 800;
    var h = 300;
    var padding = 60;

    var formatTime = d3.timeFormat("%Y");
    var dataset

    d3.csv("data/Simplified dataset.csv", function(d) {
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

      australia = d3.line()
        .defined(function(d) { return d.country == "Australia";})
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.percentage); });

      austria = d3.line()
        .defined(function(d) { return d.country == "Austria";})
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.percentage); });

      brazil = d3.line()
        .defined(function(d) { return d.country == "Brazil";})
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.percentage); });

      var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      svg.append("path")
        .datum(dataset)
        .attr("class", "line")
        .attr("d", australia);

      svg.append("path")
        .datum(dataset)
        .attr("class", "line2")
        .attr("d", austria);

      svg.append("path")
        .datum(dataset)
        .attr("class", "line3")
        .attr("d", brazil)
        .attr("stroke", "blue")
        .attr("stroke-width", "3")
        .attr("fill", "none")
        .on("mouseover", function(d) {
          d3.select(this)
            .attr("stroke", "orange");

          var xPosition = parseFloat(d3.select(this).attr('x'));
          var yPosition = parseFloat(d3.select(this).attr('y'));
          svg.append("text")
            .attr("id", "tooltip")
            .attr("x", xPosition)
            .attr("y", yPosition)
            .attr("text-anchor", "middle")
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text(d.country);
        })
        .on("mouseout", function(d) {
          d3.select(this)
            .attr("stroke", "blue");

          d3.select("#tooltip").remove();
        })

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
