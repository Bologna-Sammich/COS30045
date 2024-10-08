function init() {

    // Set up margins and dimensions for the SVG chart area
    var margin = { top: 20, right: 20, bottom: 20, left: 20 };
    var w = 900 - margin.left - margin.right;  // Adjust width based on margins
    var h = 600 - margin.top - margin.bottom;  // Adjust height based on margins
    var padding = 60;  // Padding for the chart area

    var formatTime = d3.timeFormat("%Y");  // Date format for the x-axis (year only)
    var dataset;

    // Load the CSV data and map each entry into an object with year, percentage, and country properties
    d3.csv("data/Healthcare coverage total vol.csv", function(d) {
      return {
        year: new Date(d.TIME_PERIOD),  // Convert time period to a JavaScript date object
        percentage: +d.OBS_VALUE,  // Convert percentage to a number
        country: d.Reference_area  // Reference area as the country
      };
    }).then(function(dataset) {

      // Set up the x-scale using the time scale, with domain based on dataset's years
      xScale = d3.scaleTime()
       .domain([
        d3.min(dataset, function(d) { return d.year; }),  // Minimum year
        d3.max(dataset, function(d) { return d.year; })   // Maximum year
      ])
       .range([padding, w - padding - 80]);  // Map to the width of the chart, adjusted by padding

      // Set up the y-scale as a linear scale, with the domain starting from 0 to the max percentage + 10 for padding
      yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, function(d) { return d.percentage + 10; })])
        .range([h - padding, 0]);  // Invert the range so 0 is at the bottom

      // Create the x-axis with formatted ticks (years) and time scale
      xAxis = d3.axisBottom()
       .scale(xScale)
       .ticks(10)
       .tickFormat(formatTime);

      // Create the y-axis with a linear scale and 10 ticks
      yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(10);

      // Define vertical gridlines extending across the chart without labels
      var xGridlines = d3.axisBottom(xScale)
        .tickSize(-h + padding)  // Set gridlines to span the height of the chart
        .tickFormat("")  // Remove tick labels
        .ticks(10);  // Set the number of gridlines

      // Define horizontal gridlines extending across the width of the chart
      var yGridlines = d3.axisLeft(yScale)
        .tickSize(-(w - padding))  // Set gridlines to span the width of the chart
        .tickFormat("")  // Remove tick labels
        .ticks(10);

      // Create the SVG canvas, adding a group element 'g' with margins
      var svg = d3.select("#chart")
        .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Append horizontal gridlines to the chart
       svg.append("g")
         .attr("class", "grid")
         .attr("transform", "translate(" + padding + ",0)")
         .call(yGridlines)  // Call the yGridlines defined earlier
         .selectAll("line")
         .style("stroke", "lightgray")
         .style("stroke-opacity", "0.7")
         .style("shape-rendering", "crispEdges");

       // Append vertical gridlines to the chart
       svg.append("g")
         .attr("class", "grid")
         .attr("transform", "translate(0," + (h - padding) + ")")
         .call(xGridlines)  // Call the xGridlines defined earlier
         .selectAll("line")
         .style("stroke", "lightgray")
         .style("stroke-opacity", "0.7")
         .style("shape-rendering", "crispEdges");

        // Create a line generator using the dataset to map the x and y values
        var line = d3.line()
          .x(function(d) { return xScale(d.year); })  // Use xScale for the year
          .y(function(d) { return yScale(d.percentage); })  // Use yScale for the percentage
          .curve(d3.curveBasis);  // Smooth curve

        // Get a unique list of countries from the dataset
        var countries = Array.from(dataset.map(d => d.country))

        // Set up a colour scale for the lines
        var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

        // Loop through each country and draw the respective line
        countries.forEach(function(country, i) {
          // Draw the line for each country
          svg.append("path")
            .datum(dataset.filter(function(d) {return d.country === country; }))  // Filter data by country
            .attr("class", `line country-${i}`)  // Assign a class based on country index
            .attr("d", line)  // Call the line generator
            .attr("stroke", colorScale(country))  // Colour the line based on the country
            .attr("stroke-width", "2")  // Set line thickness
            .attr("fill", "none");  // No fill for the path

          // Add an invisible hitbox for easier hover detection
          svg.append("path")
            .datum(dataset.filter(function(d) { return d.country === country; }))  // Filter data by country
            .attr("class", `hitbox country-${i}`)  // Assign a class based on country index
            .attr("d", line)  // Call the line generator
            .attr("stroke", "none")  // No visible stroke
            .attr("stroke-width", "7")  // Larger hitbox area
            .attr("fill", "none")
            .style("pointer-events", "stroke")  // Enable hovering on the stroke area
            .on("mouseover", function(event, d) {  // Mouseover event handler
              d3.select(`.line.country-${i}`)  // Highlight the line when hovered
                .attr("stroke", "black");

              var mouseCoords = d3.pointer(event);  // Get mouse coordinates
              var xPosition = mouseCoords[0];  // Get the x-coordinate of the mouse
              var xDate = xScale.invert(xPosition);  // Convert x-position to a date

              // Find the closest data point to the hovered position
              var closestPoint = d.reduce(function(prev, curr) {
                return (Math.abs(curr.year - xDate) < Math.abs(prev.year - xDate) ? curr : prev);
              });

              // Create the tooltip text with country and percentage info
              var tooltipText = `${country} ${closestPoint.year.getFullYear()}: ${closestPoint.percentage}%`;

              // Append tooltip text to the SVG
              var textElement = svg.append("text")
                .attr("id", "tooltip")
                .attr("x", xScale(closestPoint.year))  // Position based on the closest year
                .attr("y", yScale(closestPoint.percentage) - 10)  // Position above the data point
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .text(tooltipText);

              var bbox = textElement.node().getBBox();  // Get bounding box for the text

              // Draw a rectangle behind the text as a background
              svg.append("rect")
                .attr("id", "tooltip-background")
                .attr("x", bbox.x - 4)  // Add padding to the left
                .attr("y", bbox.y - 2)  // Add padding to the top
                .attr("width", bbox.width + 8)  // Add padding to the width
                .attr("height", bbox.height + 4)  // Add padding to the height
                .attr("fill", "white")  // White background
                .attr("stroke", "gray")  // Optional border
                .attr("rx", 4)  // Rounded corners
                .attr("ry", 4);  // Rounded corners

              // Ensure text is always on top by raising it above the rectangle
              textElement.raise();
          })
          .on("mouseout", function(d) {  // Mouseout event to reset the line's colour and remove tooltip
            d3.select(`.line.country-${i}`)
              .attr("stroke", colorScale(country));
            d3.select("#tooltip").remove();  // Remove tooltip text
            d3.select("#tooltip-background").remove();  // Remove tooltip background
          });
      })

      // Draw the x-axis at the bottom of the chart
      svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);

      // Add a label for the x-axis
      svg.append("text")
        .attr("x", w / 2)  // Center the label horizontally
        .attr("y", h + margin.bottom - 20)  // Position below the x-axis
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px")
        .text("Year");

      // Draw the y-axis on the left of the chart
      svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

      // Add a label for the y-axis, rotated to appear vertically
      svg.append("text")
        .attr("transform", "rotate(-90)")  // Rotate the text for vertical orientation
        .attr("y", 0 - margin.left + 20)  // Adjust vertical positioning
        .attr("x", 0 - (h / 2))  // Center the label along the y-axis
        .attr("dy", "1em")  // Adjust text spacing
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", "16px")
        .text("Percentage Value");

    });
}

window.onload = init;  // Initialise the chart when the window loads
