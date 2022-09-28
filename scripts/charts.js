function buildDonutChart(data, group) {
    const target = document.querySelector(`#summary-view-${group}-chart`);

    const diameter = 500;
    const radius = diameter / 2;

    const svg = d3.select(target)
    .append("svg")
        .attr("viewBox", `0 0 ${diameter} ${diameter}`)
    .append("g")
        .attr("transform", `translate(${radius},${radius})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const arcs = d3.pie().value((d) => d[1]);

    svg
    .selectAll('path')
    .data(arcs(Object.entries(data)))
    .join('path')
        .attr('d', d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius)
        )
        .attr('fill', (d) => color(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "1px")
        .attr("data-country", (d) => d.data[0])
        .attr("data-count", (d) => d.data[1]);
}

function buildBarChart(data, group) {
// TODO
}