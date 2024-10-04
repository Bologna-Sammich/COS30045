function init() {

    var w = 800;
    var h = 300;
    var padding = 60;

    var formatTime = d3.timeFormat("%Y");
    var dataset

    d3.csv("data/Healthcare Coverage dataset.csv", function(d) {
      return {
        year: new Date(d.TIME_PERIOD),
        percentage: +d.OBS_VALUE,
        insuranceType: d.Insurance_type,
        unitMeasure: d.Unit_of_measure,
        country: d.Reference_area
      };
    }).then(function(dataset) {

      var filteredData = dataset.filter(function(d) {
      return d.insuranceType === "TPRIBASI" &&
             d.unitMeasure === "Percentage of population";
    });

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

      var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

      var line = d3.line()
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.percentage); });

      var countries = Array.from(new Set(filteredData.map(function(d) { return d.country; })));

      var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      countries.forEach(function(country, i) {

        var countryData = filteredData.filter(function(d) { return d.country === country; });

        svg.append("path")
          .datum(countryData)
          .attr("class", `line country-${i}`)
          .attr("d", line)
          .attr("stroke", colorScale(country))
          .attr("stroke-width", "3")
          .attr("fill", "none")
          .on("mouseover", function(event, d) {
            d3.select(this)
              .attr("stroke", "orange");

            var mouseCoords = d3.pointer(event);
            var xPosition = mouseCoords[0];
            // var yPosition = mouseCoords[1];
            var xDate = xScale.invert(xPosition);

            // Find closest data point for Brazil
            var closestPoint = d.reduce(function(prev, curr) {
              return (Math.abs(curr.year - xDate) < Math.abs(prev.year - xDate) ? curr : prev);
            });

            svg.append("text")
              .attr("id", "tooltip")
              .attr("x", xScale(closestPoint.year))
              .attr("y", yScale(closestPoint.percentage) - 10)
              .attr("text-anchor", "middle")
              .attr("font-family", "sans-serif")
              .attr("font-size", "11px")
              .attr("font-weight", "bold")
              .attr("fill", "black")
              .text(`${country} ${closestPoint.year.getFullYear()}: ${closestPoint.percentage}%`);
          })
          .on("mouseout", function(d) {
            d3.select(this)
              .attr("stroke", colorScale(country));
            d3.select("#tooltip").remove();
          });
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
