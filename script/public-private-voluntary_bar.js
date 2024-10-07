function init() {
	
	var w = 700;
	var h = 400;
	var padding = 60;
	
	var svg = d3.select("#chart")
		.append("svg")
		.attr("width", w)
		.attr("height", h);

	
		
	d3.csv("data/public-primary-voluntary_1995-2023.csv", function(d) {
		return {
			year: new Date(d.TIME_PERIOD),
			value: +d.OBS_VALUE,
			country: d.REFERENCE_AREA
		};
	}).then(function(dataset) {
		var countries = Array.from(dataset.map(d => d.country));			
		
		var xScale = d3.scaleLinear()
			.domain([0, (countries.length + padding)])
			.range([padding, w]);
			
		var yScale = d3.scaleLinear()
			.domain([0, d3.max(dataset, function(d) { return d.value + padding; })])
			.range([h - padding, 0]);
			
		var yAxis = d3.axisLeft()
			.scale(yScale)
			.ticks(10);
			
		var fx = d3.scaleBand()
			.domain(new Set(dataset.map(d => d.country)))
			.rangeRound([40, w - 10])
			.paddingInner(0.1);
			
		var years = new Set(dataset.map(d => d.year));
		
		var x = d3.scaleBand()
			.domain(years)
			.rangeRound([0, fx.bandwidth()])
			.padding(0.05);
		
		var colour = d3.scaleOrdinal()
			.domain(years)
			.range(d3.schemeSpectral[years.size])
			.unknown("#ccc");
		
		var y = d3.scaleLinear()
			.domain([0, d3.max(dataset, d => d.value)]).nice()
			.rangeRound([h - 20, 10]);
		
		svg.append("g")
			.selectAll()
			.data(d3.group(dataset, d => d.country))
			.join("g")
				.attr("transform", ([country]) => `translate(${xScale(country)},0)`)
			.selectAll()
			.data(([,d]) => d)
			.join("rect")
				.attr("x", d => x(d.year))
				.attr("y", d => y(d.value))
				.attr("width", x.bandwidth())
				.attr("height", d => y(0) - y(d.value))
				.attr("fill", d => colour(d.year));
				
		svg.append("g")
			.attr("transform", `translate(0,${h - 20})`)
			.call(d3.axisBottom(fx).tickSizeOuter(0))
			.call(g => g.selectAll(".domain").remove());
			
		svg.append("g")
			.attr("transform", `translate(${40},0`)
			.call(d3.axisLeft(y).ticks(null, "s"))
			.call(g => g.selectAll(".domain").remove());
	});
}

window.onload = init;