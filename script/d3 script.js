function init() {

    var margin = { top: 20, right: 20, bottom: 20, left: 20 };
    var w = 900 - margin.left - margin.right;  // Adjusted width
    var h = 600 - margin.top - margin.bottom;  // Adjusted height
    var padding = 60;

    var formatTime = d3.timeFormat("%Y");
    var dataset

    d3.csv("data/Healthcare coverage total vol.csv", function(d) {
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
       .range([padding, w - padding - 80]);

      yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) { return d.percentage + 10; })])
        .range([h - padding, 0]);

      xAxis = d3.axisBottom()
       .scale(xScale)
       .ticks(10)
       .tickFormat(formatTime);

      yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10);

      var xGridlines = d3.axisBottom(xScale)
        .tickSize(-h + padding)  // Negative height makes them extend across the chart
        .tickFormat("")  // Remove tick labels, just keep the lines
        .ticks(10);

      var yGridlines = d3.axisLeft(yScale)
        .tickSize(-(w - padding))  // Extend across the width of the chart
        .tickFormat("")
        .ticks(10);

      var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Add horizontal gridlines
       svg.append("g")
         .attr("class", "grid")
         .attr("transform", "translate(" + padding + ",0)")
         .call(yGridlines)
         .selectAll("line")
         .style("stroke", "lightgray")
         .style("stroke-opacity", "0.7")
         .style("shape-rendering", "crispEdges");

       // Add vertical gridlines
       svg.append("g")
         .attr("class", "grid")
         .attr("transform", "translate(0," + (h - padding) + ")")
         .call(xGridlines)
         .selectAll("line")
         .style("stroke", "lightgray")
         .style("stroke-opacity", "0.7")
         .style("shape-rendering", "crispEdges");

        var line = d3.line()
          .x(function(d) { return xScale(d.year); })
          .y(function(d) { return yScale(d.percentage); })
          .curve(d3.curveBasis);

        var countries = Array.from(dataset.map(d => d.country))

        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        countries.forEach(function(country, i) {
          //Draw actual line
          svg.append("path")
            .datum(dataset.filter(function(d) {return d.country === country; }))
            .attr("class", `line country-${i}`)
            .attr("d", line)
            .attr("stroke", colorScale(country))
            .attr("stroke-width", "2")
            .attr("fill", "none");

          //Invisible line with bigger hitbox for hovering
          svg.append("path")
            .datum(dataset.filter(function(d) { return d.country === country; }))
            .attr("class", `hitbox country-${i}`)
            .attr("d", line)
            .attr("stroke", "none")
            .attr("stroke-width", "7")  // Larger hitbox (10px width)
            .attr("fill", "none")
            .style("pointer-events", "stroke")
            .on("mouseover", function(event, d) {
              d3.select(`.line.country-${i}`)
                .attr("stroke", "black");

              var mouseCoords = d3.pointer(event);
              var xPosition = mouseCoords[0];
              // var yPosition = mouseCoords[1];
              var xDate = xScale.invert(xPosition);

              var countryData = dataset.filter(function(d) { return d.country == country; });
              var closestPoint = d.reduce(function(prev, curr) {
                return (Math.abs(curr.year - xDate) < Math.abs(prev.year - xDate) ? curr : prev);
              });

              // Tooltip text
              var tooltipText = `${country} ${closestPoint.year.getFullYear()}: ${closestPoint.percentage}%`;

              var textElement = svg.append("text")
                .attr("id", "tooltip")
                .attr("x", xScale(closestPoint.year))
                .attr("y", yScale(closestPoint.percentage) - 10)
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .text(tooltipText);

              var bbox = textElement.node().getBBox();  // Get text's bounding box

                // Append a rectangle behind the text
              svg.append("rect")
                .attr("id", "tooltip-background")
                .attr("x", bbox.x - 4)  // Add some padding
                .attr("y", bbox.y - 2)  // Adjust for vertical padding
                .attr("width", bbox.width + 8)  // Add horizontal padding
                .attr("height", bbox.height + 4)  // Add vertical padding
                .attr("fill", "white")  // Background color
                .attr("stroke", "gray")  // Optional border to highlight it more
                .attr("rx", 4)  // Rounded corners
                .attr("ry", 4);

              // Re-append the text so it's on top of the rectangle
              textElement.raise();
          })
          .on("mouseout", function(d) {
            d3.select(`.line.country-${i}`)
              .attr("stroke", colorScale(country));
            d3.select("#tooltip").remove();
            d3.select("#tooltip-background").remove();
          });
      })


      svg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(0," + (h - padding) + ")")
				.call(xAxis);

      svg.append("text")
        .attr("x", w / 2)  // Center the label horizontally
        .attr("y", h + margin.bottom - 20)  // Position below the X-axis
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px")
        .text("Year");


			svg.append("g")
				.attr("class", "axis")
				.attr("transform", "translate(" + padding + ",0)")
				.call(yAxis);

      // Y-axis label with correct positioning
       svg.append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 0 - margin.left + 20)  // Adjust Y position
         .attr("x", 0 - (h / 2))  // Center the label vertically
         .attr("dy", "1em")  // Offset for better spacing
         .attr("text-anchor", "middle")
         .attr("font-family", "sans-serif")
         .attr("font-size", "16px")
         .text("Percentage Value");

    });



}

window.onload = init;
