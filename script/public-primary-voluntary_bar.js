// set the dimensions and margins of the graph
const margin = {top: 100, right: 20, bottom: 50, left: 40};
const width = 450 - margin.left - margin.right;
const height = 350 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#chart")
  .append("svg")
    .attr("width", "50%")
    .attr("height", "50%")
    //.attr("viewBox", "0 0 450 350")
    .attr("preserveAspectRatio", "xMinYMin")
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// parse the Data
d3.csv("data/public-primary-voluntary_1995-2023-new.csv").then(function(data){

// data wrangling
const dataRollup = d3.rollup(data, v => d3.sum(v, d => +d.OBS_VALUE), d => d.TIME_PERIOD, d => d.REFERENCE_AREA)
const countryKeys = Array.from(dataRollup).map(d => d[0])
const yearKey = Array.from(Array.from(dataRollup)[0][1]).map(d=>d[0])
const yearKey_sorted = yearKey.sort(d3.ascending)

// X scale and Axis
const xScale = d3.scaleBand()
  .domain(countryKeys)
  .range([0, width])
  .padding(.2);
svg
  .append('g')
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(xScale).tickSize(0).tickPadding(8));

// Y scale and Axis
const formater =  d3.format(".1s")
const yScale = d3.scaleLinear()
    .domain([0, d3.max(data.map(d => +d.refugee_number))])
    .range([height, 0]);
svg
  .append('g')
  .call(d3.axisLeft(yScale).ticks(5).tickSize(0).tickPadding(6).tickFormat(formater))
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

// create a tooltip
const tooltip = d3.select("body")
  .append("div")
    .attr("id", "chart")
    .attr("class", "tooltip");

// tooltip events
const mouseover = function(d) {
    tooltip
      .style("opacity", .8)
    d3.select(this)
      .style("opacity", .5)
}
const mousemove = function(event, d) {
  const formater =  d3.format(",")
    tooltip
      .html(formater(d[1]))
      .style("top", event.pageY - 10 + "px")
      .style("left", event.pageX + 10 + "px");
}
const mouseleave = function(d) {
    tooltip
      .style("opacity", 0)
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
  .data(d => { return d[0] })
  .join("rect")
     .attr("x", d => xSubgroups(d[0]))
     .attr("y", d => yScale(d[1]))
     .attr("width", xSubgroups.bandwidth())
     .attr("height", d => height - yScale(d[1]))
     .attr("fill", d=>color(d[0]))
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseleave", mouseleave);

// set Y axis label
svg
  .append("text")
    .attr("class", "chart-label")
    .attr("x", -(margin.left)*0.6)
    .attr("y", -(margin.top/15))
    .attr("text-anchor", "start")
  .text("Percentage of population")

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
        .attr("y", -(margin.top/2.5))
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
        .attr("y", -(margin.top/2.5))
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
        .attr("y", -(margin.top/2.5))
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
        .attr("y", -(margin.top/2.5))
    .text("2021")	

})