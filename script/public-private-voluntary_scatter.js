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
			
		svg.selectAll("rect")
			.data(dataset)
			.enter()
			.append("rect")
			.attr("x", function(d, i) {
				return w - (d * 4);
			})
			.attr("y", function(d, i) {
				return i * (h / dataset.length);
			})
			.attr("height", function(d, i) {
				return h / dataset.length - 4;
			})
			.attr("width", function(d) {
				return d * 4;
			})
			.attr("fill", "green");
			
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
