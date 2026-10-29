const scatterContainer = d3.select("#scatter-plot");
const scatterSvg = scatterContainer
  .append("svg")
  .attr("class", "scatter-svg")
  .attr("role", "img")
  .attr("aria-label", "TV star rating compared with annual energy consumption");

const scatterTooltip = scatterContainer
  .append("div")
  .attr("class", "scatter-tooltip")
  .attr("role", "status")
  .style("opacity", 0);

d3.csv("Ex5/Ex5_TV_energy.csv", (row) => ({
  ...row,
  screensize: +row.screensize,
  energy_consumpt: +row.energy_consumpt,
  star2: +row.star2,
  count: +row.count
}))
  .then((data) => {
    console.log("Loaded TV energy data:", data);

    const width = scatterContainer.node().clientWidth;
    const height = scatterSvg.node().clientHeight;
    const margin = { top: 16, right: 18, bottom: 58, left: 62 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain(d3.extent(data, (d) => d.star2))
      .nice()
      .range([0, plotWidth]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.energy_consumpt)])
      .nice()
      .range([plotHeight, 0]);

    const technologies = Array.from(new Set(data.map((d) => d.screen_tech)));
    const color = d3.scaleOrdinal()
      .domain(technologies)
      .range(d3.schemeTableau10);

    const plot = scatterSvg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    plot.append("g")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(x));

    plot.append("g")
      .call(d3.axisLeft(y).ticks(6));

    plot.append("text")
      .attr("class", "axis-label")
      .attr("x", plotWidth / 2)
      .attr("y", plotHeight + 48)
      .attr("text-anchor", "middle")
      .text("Star rating");

    plot.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -plotHeight / 2)
      .attr("y", -46)
      .attr("text-anchor", "middle")
      .text("Annual energy consumption (kWh/year)");

    scatterContainer
      .append("div")
      .attr("class", "scatter-legend")
      .selectAll("span")
      .data(technologies)
      .join("span")
      .attr("class", "scatter-legend-item")
      .each(function (technology) {
        d3.select(this)
          .append("span")
          .attr("class", "scatter-legend-swatch")
          .style("background-color", color(technology));
        d3.select(this)
          .append("span")
          .text(technology);
      });

    plot.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", (d) => x(d.star2))
      .attr("cy", (d) => y(d.energy_consumpt))
      .attr("r", 5)
      .attr("fill", (d) => color(d.screen_tech))
      .attr("fill-opacity", 0.78)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.2)
      .on("mouseenter", (event, d) => {
        scatterTooltip
          .style("opacity", 1)
          .text(
            `TV model: ${d.brand} ${d.screensize}"\n` +
            `Screen size: ${d.screensize}"\n` +
            `Star rating: ${d.star2}\n` +
            `Energy consumption: ${d.energy_consumpt} kWh/year`
          );
      })
      .on("mousemove", (event) => {
        const [pointerX, pointerY] = d3.pointer(event, scatterContainer.node());
        scatterTooltip
          .style("left", `${pointerX + 12}px`)
          .style("top", `${pointerY + 12}px`);
      })
      .on("mouseleave", () => {
        scatterTooltip.style("opacity", 0);
      });
  })
  .catch((error) => {
    console.error("Failed to load TV energy data:", error);
  });
