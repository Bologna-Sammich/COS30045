chart = {
  // Specify the chart’s dimensions.
  var width = 928;
  var height = 600;
  var marginTop = 10;
  var marginRight = 10;
  var marginBottom = 20;
  var marginLeft = 40;

  // Prepare the scales for positional and color encodings.
  // Fx encodes the state.
  var fx = d3.scaleBand()
      .domain(new Set(data.map(d => d.country)))
      .rangeRound([marginLeft, width - marginRight])
      .paddingInner(0.1);

  // Both x and color encode the age class.
  var years = new Set(data.map(d => d.year));

  var x = d3.scaleBand()
      .domain(years)
      .rangeRound([0, fx.bandwidth()])
      .padding(0.05);

  var color = d3.scaleOrdinal()
      .domain(years)
      .range(d3.schemeSpectral[years.size])
      .unknown("#ccc");

  // Y encodes the height of the bar.
  var y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)]).nice()
      .rangeRound([height - marginBottom, marginTop]);

  // A function to format the value in the tooltip.
  var formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  // Create the SVG container.
  var svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

  // Append a group for each state, and a rect for each age.
  svg.append("g")
    .selectAll()
    .data(d3.group(data, d => d.country))
    .join("g")
      .attr("transform", ([country]) => `translate(${fx(country)},0)`)
    .selectAll()
    .data(([, d]) => d)
    .join("rect")
      .attr("x", d => x(d.year))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.value))
      .attr("fill", d => color(d.year));

  // Append the horizontal axis.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(fx).tickSizeOuter(0))
      .call(g => g.selectAll(".domain").remove());

  // Append the vertical axis.
  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call(g => g.selectAll(".domain").remove());

  // Return the chart with the color scale as a property (for the legend).
  return Object.assign(svg.node(), {scales: {color}});
}

data = {
  let data = await FileAttachment("data/public-private-voluntary_1995-2023.csv").csv({typed: true});
  var ages = data.columns.slice(1);
  data = d3.sort(data, d => -d3.sum(year, TIME_PERIOD => d[year])).slice(0, 6);
  return ages.flatMap((TIME_PERIOD) => data.map((d) => ({REFERENCE_AREA: d.name, TIME_PERIOD, OBS_VALUE: d[year]})));
}

import {legend} from "@d3/color-legend"
Plot.plot({
  x: {axis: null},
  y: {tickFormat: "s"},
  fx: {label: null},
  color: {scheme: "spectral"},
  marks: [
    Plot.barY(data, {fx: "country", x:"year", y: "value", fill: "year", sort: {color: null, x: null, fx: {value: "-y", reduce: "sum"}}}),
    Plot.ruleY([0])
  ]
})