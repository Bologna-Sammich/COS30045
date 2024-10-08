// set the dimensions and margins of the graph
const margin = {top: 50, right: 100, bottom: 100, left: 40};
const width = 350 - margin.left - margin.right;
const height = 280 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#barChart")
  .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 350 280")
    .attr("preserveAspectRatio", "xMinYMin")
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// parse the Data
d3.csv("data/public-primary-voluntary_1995-2023-new.csv").then(function(data){

// data wrangling
const dataRollup = d3.rollup(data, v => d3.sum(v, d => +d.OBS_VALUE), d => d.REFERENCE_AREA, d => d.TIME_PERIOD)
const countryKeys = Array.from(dataRollup).map(d => d[0])
const yearKey = Array.from(Array.from(dataRollup)[0][1]).map(d=>d[0])
const yearKey_sorted = yearKey.sort(d3.ascending)

// add options to the filter
d3.select("#filterChecks")
  .selectAll("filterOptions")
	.data(countryKeys)
  .enter()
	.append("input")
	  .attr("type", "checkbox")
	  .attr("value", function(d) {
		  return d;
	  });

// X scale and Axis
const xScale = d3.scaleBand()
  .domain(countryKeys)
  .range([0, width])
  .padding(.2);
svg
  .append('g')
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(xScale).tickSize(0).tickPadding(8))
  .selectAll("text")
  .attr("transform", "rotate(45)")
  .style("text-anchor", "start");

// Y scale and Axis
const formater =  d3.format(".1s")
const yScale = d3.scaleLinear()
    .domain([0, d3.max(data.map(d => +d.OBS_VALUE))])
    .range([height, 0]);
svg
  .append('g')
  .call(d3.axisLeft(yScale).ticks(5).tickSize(0).tickPadding(6).tickFormat(function(d) { return formater(d) + "%"; }))
  .call(d => d.select(".domain").remove());

// set subgroup sacle
const xSubgroups = d3.scaleBand()
  .domain(yearKey_sorted)
  .range([0, xScale.bandwidth()])
  .padding([0.05])

// color palette
const color = d3.scaleOrdinal()
  .domain(yearKey_sorted)
  .range(["#e41a1c","#377eb8","#4daf4a","#984ea3"])

// set horizontal grid line
const GridLine = () => d3.axisLeft().scale(yScale);
svg
  .append("g")
    .attr("class", "grid")
  .call(GridLine()
    .tickSize(-width,0,0)
    .tickFormat("")
);

// tooltip events
// create tooltip
const mouseover = function(event, d) {
	var mousePos = d3.pointer(event);
	var xPos = mousePos[0];
	var yPos = mousePos[1];
    svg.append("text")
		.attr("id", "tooltip")
		.attr("x", xPos + 10)
		.attr("y", yPos + 10)
		.text(d + "%")
    d3.select(this)
      .style("opacity", .5)
}
// remove tooltip
const mouseleave = function(d) {
    svg.select("#tooltip")
		.remove();
    d3.select(this)
      .style("opacity", 1)
}

// create bars
bars = svg.append("g")
  .selectAll("g")
  .data(dataRollup)
  .join("g")
     .attr("transform", d => "translate(" + xScale(d[0]) +", 0)")
  .selectAll("rect")
  .data(d => { return d[1] })
  .join("rect")
     .attr("x", d => xSubgroups(d[0]))
     .attr("y", d => yScale(d[1]))
     .attr("width", xSubgroups.bandwidth())
     .attr("height", d => height - yScale(d[1]))
     .attr("fill", d=>color(d[0]))
	 .transition()
	 .duration(1200)
  .on("mouseover", mouseover)
  .on("mouseleave", mouseleave);

// set title
svg
  .append("text")
    .attr("class", "chart-title")
    .attr("x", -(margin.left)*0.6)
    .attr("y", -(margin.top)/1.5)
    .attr("text-anchor", "start")
  .text("Public & primary voluntary health insurance as per population percentage")

//set legend
svg
.append("rect")
    .attr("x", -(margin.left)*0.6)
    .attr("y", -(margin.top/2))
    .attr("width", 13)
    .attr("height", 13)
    .style("fill", "#e41a1c");
svg
    .append("text")
        .attr("class", "legend")
        .attr("x", -(margin.left)*0.6+20)
        .attr("y", -(margin.top/3.1))
    .text("1999")
	
svg
    .append("rect")
        .attr("x", 26)
        .attr("y", -(margin.top/2))
        .attr("width", 13)
        .attr("height", 13)
        .style("fill", "#377eb8")
svg
    .append("text")
        .attr("class", "legend")
        .attr("x", 46)
        .attr("y", -(margin.top/3.1))
    .text("2005")
	
svg
    .append("rect")
        .attr("x", 76)
        .attr("y", -(margin.top/2))
        .attr("width", 13)
        .attr("height", 13)
        .style("fill", "#4daf4a")
svg
    .append("text")
        .attr("class", "legend")
        .attr("x", 96)
        .attr("y", -(margin.top/3.1))
    .text("2014")
	
svg
    .append("rect")
        .attr("x", 126)
        .attr("y", -(margin.top/2))
        .attr("width", 13)
        .attr("height", 13)
        .style("fill", "#984ea3")
svg
    .append("text")
        .attr("class", "legend")
        .attr("x", 146)
        .attr("y", -(margin.top/3.1))
    .text("2021")	

})