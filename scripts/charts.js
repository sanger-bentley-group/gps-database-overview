function buildDonutChart(data, group) {
    const target = document.querySelector(`#summary-view-${group}-chart`);

    const diameter = 500;
    const radius = diameter / 2;

    const svgContainer = d3.select(target);
    
    const svg = svgContainer.append("svg")
        .attr("viewBox", `0 0 ${diameter} ${diameter}`)
    
    const chart = svg.append("g")
        .attr("transform", `translate(${radius},${radius})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const arcs = d3.pie().value((d) => d[1]);

    chart.selectAll("path")
    .data(arcs(Object.entries(data)))
    .join("path")
        .attr("d", d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius)
        )
        .attr("fill", (d) => color(d.data[0]))
        .attr("stroke", "white")
        .style("stroke-width", "1px")
        .attr("data-country", (d) => d.data[0])
        .attr("data-count", (d) => d.data[1]);
}


function buildBarChart(data, group) {
    const target = document.querySelector(`#summary-view-${group}-chart`);

    const margin = {top: 10, right: 10, bottom: 70, left: 60},
    width = 800 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

    let dataArr = [];

    const dataNums = Object.keys(data).filter((x) => !isNaN(x));
    const dataNumsMin = Math.min(...dataNums);
    const dataNumsMax = Math.max(...dataNums);

    if (Object.keys(data).filter((x) => isNaN(x)).length) {
        dataArr.push({ key: "Unknown", value: data["NaN"] });
    }

    if (group !== "age") {
        for (let i = dataNumsMin; i <= dataNumsMax; i++) {
            dataArr.push({ key: i, value: data[i] ?? 0 });
        }
    } else {
        let ageBins = [0, 1, 2, 3, 4, 5, [6, 10], [11, 20], [21, 30], [31, 40], [41, 50], [51, 60], [61, 70], [71, dataNumsMax]]
        ageBins.forEach(bin => {
            if (!Array.isArray(bin)) {
                dataArr.push({ key: bin, value: data[bin] ?? 0 });
            } else {
                let accum = 0;
                for (let i = bin[0]; i <= bin[1]; i++){
                    accum += data[i] ?? 0; 
                }
                const keyName = bin[1] !== dataNumsMax ? `${bin[0]}-${bin[1]}` : `>${bin[0]-1}`;
                dataArr.push({ key: keyName, value: accum });
            }
        });
    }

    const svgContainer = d3.select(target);

    const svg = svgContainer.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);
    
    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    const xScale = d3.scaleBand()
        .range([ 0, width ])
        .domain(dataArr.map((d) => d.key))
        .padding(0.2);
    
    const yScale = d3.scaleLinear()
        .domain([0, Math.ceil(Math.max(...Object.values(data))/1000) * 1000])
        .range([ height, 0]);

    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("font-size","14px")
            .style("text-anchor", "end");

    chart.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
            .style("font-size","14px");

    chart.selectAll("bar")
    .data(dataArr)
    .join("rect")
        .attr("x", d => xScale(d.key))
        .attr("y", d => yScale(d.value))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.value))
        .attr("fill", "#633AB5");
}