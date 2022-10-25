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
    const target = document.querySelector(`#summary-view-${group}-chart`);

    const margin = {top: 10, right: 10, bottom: 40, left: 40},
    width = 800 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    let dataArr = [];

    const dataNums = Object.keys(data).filter((x) => !isNaN(x));
    const dataNumsMin = Math.min(...dataNums);
    const dataNumsMax = Math.max(...dataNums);

    if (Object.keys(data).filter((x) => isNaN(x)).length) {
        dataArr.push({key: 'Unknown', value: data['NaN']});
    }
    for (let i = dataNumsMin; i <= dataNumsMax; i++) {
        dataArr.push({
            key: i, 
            value: data[i] ?? 0
        });
    }

    const svg = d3.select(target)
    .append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleBand()
        .range([ 0, width ])
        .domain(dataArr.map((d) => d.key))
        .padding(0.2);
    
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");
      
      // Add Y axis
      const y = d3.scaleLinear()
        .domain([0, Math.ceil(Math.max(...Object.values(data))/1000) * 1000])
        .range([ height, 0]);
      svg.append("g")
        .call(d3.axisLeft(y));
      
      // Bars
      svg.selectAll("bar")
        .data(dataArr)
        .join("rect")
          .attr("x", d => x(d.key))
          .attr("y", d => y(d.value))
          .attr("width", x.bandwidth())
          .attr("height", d => height - y(d.value))
          .attr("fill", "#633AB5")
}