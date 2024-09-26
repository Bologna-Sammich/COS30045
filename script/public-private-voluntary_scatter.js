function init() {
	var w = 1000;
	var h = 600;
	var padding = 50;
	
	var dataset, yScale, xScale, yAxis, xAxis;
	
	d3.csv("data/public-primary-voluntary_1995-2023.csv", function(d) {
		return {
			year: +d.TIME_PERIOD,
			value: +d.OBS_VALUE,
			country: d.REFERENCE_AREA
		};
	}).then(function(dataset) {
		xScale = d3.scaleLinear()
			.domain([
				d3.min(dataset, function(d) { return d.year; }),
				d3.max(dataset, function(d) { return d.year; })
			])
			.range([padding, w]);
			
		yScale = d3.scaleLinear()
			.domain([0, d3.max(dataset, function(d) { return d.value; })])
			.range([h - padding, 0]);
			
		xAxis = d3.axisBottom()
			.scale(xScale)
			.ticks(15);
			
		yAxis = d3.axisLeft()
			.scale(yScale)
			.ticks(10)
			.tickFormat(function(tickVal) {
				return tickVal + "%";
			});
			
		var svg = d3.select("#chart")
			.append("svg")
			.attr("width", w)
			.attr("height", h);
			
		svg.selectAll("circle")
			.data(dataset)
			.enter()
			.append("circle")
			.attr("cx", function(d) {
				return xScale(d.year);
			})
			.attr("cy", function(d) {
				return yScale(d.value);
			})
			.attr("r", 5)
			.attr("fill", "green");
	});
}

window.onload = init;
