function buildDonutChart(data, group) {
    const container = document.querySelector(`#summary-view-${group}-chart`);

    const diameter = 500;
    const radius = diameter / 2;

    const svgContainer = d3.select(container);
    
    const svg = svgContainer.append("svg")
        .attr("viewBox", `0 0 ${diameter} ${diameter}`)
    
    const chart = svg.append("g")
        .attr("transform", `translate(${radius},${radius})`);

    
    let dataArr = [];

    for (key in data) {
        // Comment out below to include unknown data
        if (key === "NaN") { continue; }
        dataArr.push({ key: key, value: data[key] });
    }

    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const arcs = d3.pie().value((d) => d.value);

    chart.selectAll("path")
    .data(arcs(dataArr))
    .join("path")
        .attr("d", d3.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius)
        )
        .attr("fill", (d) => color(d.data.key))
        .attr("stroke", "white")
        .style("stroke-width", "1px")
        .attr("data-country", (d) => d.data.key)
        .attr("data-count", (d) => d.value);
    
    chart.append("text")
        .text("KEY")
            .attr("transform", `translate(0 -${radius / 5})`)
            .style("text-anchor", "middle")
            .style("font-size", "36px")
            .attr("class", `key-${group}`);
    
    chart.append("text")
        .text("Value")
            .attr("transform", `translate(0 ${radius / 5})`)
            .style("text-anchor", "middle")
            .style("font-size", "48px")
            .attr("class", `value-${group}`);
}


// Build bar charts in Summary View
function buildBarChart(data, group) {
    const container = document.querySelector(`#summary-view-${group}-chart`);

    // Set dimension of the chart
    const margin = {top: 30, right: 10, bottom: 70, left: 60},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // Get known data and range
    const dataNums = Object.keys(data).filter((x) => !isNaN(x));
    const dataNumsMin = Math.min(...dataNums);
    const dataNumsMax = Math.max(...dataNums);

    // Except age, build bars for the whole range and fill in missing ones
    // For age, build bars according to ageBins
    let dataArr = [];

    if (group !== "age") {
        for (let i = dataNumsMin; i <= dataNumsMax; i++) {
            dataArr.push({ key: i, value: data[i] ?? 0 });
        }
    } else {
        // In ageBins, Int for single value, 2-element array for range. Last item must be an array with dataNumsMax as the second element
        let ageBins = [0, 1, 2, 3, 4, 5, [6, 10], [11, 20], [21, 30], [31, 40], [41, 50], [51, 60], [61, 70], [71, dataNumsMax]]
        ageBins.forEach(bin => {
            if (!Array.isArray(bin)) {
                dataArr.push({ key: bin, value: data[bin] ?? 0 });
            } else {
                let accum = 0;
                for (let i = bin[0]; i <= bin[1]; i++){
                    accum += data[i] ?? 0; 
                }
                // "gt" is used instead of ">" to avoid class/id name issues
                const keyName = bin[1] !== dataNumsMax ? `${bin[0]}-${bin[1]}` : `gt${bin[0]-1}`;
                dataArr.push({ key: keyName, value: accum });
            }
        });
    }

    // Uncomment below to show unknown data
    // if (Object.keys(data).filter((x) => isNaN(x)).length) {
    //     dataArr.push({ key: "Unknown", value: data["NaN"] });
    // }


    // Select svg container
    const svgContainer = d3.select(container);

    // Add svg into container
    const svg = svgContainer.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);
    
    // Add chart area in svg
    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Setup X-axis band scale
    const xScale = d3.scaleBand()
        .range([ 0, width ])
        .domain(dataArr.map((d) => d.key))
        .padding(0.1);
    
    // Setup Y-axis linear scale, the upper limit is round up to closest 1000s
    const yScale = d3.scaleLinear()
        .domain([0, Math.ceil(Math.max(...Object.values(data))/1000) * 1000])
        .range([ height, 0]);

    // Add X-axis and labels, replace "gt" to ">" in labels
    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickFormat((d) => d.toString().replace("gt", ">")))
        .selectAll("text")
            .style("font-size", "16px")
            .style("text-anchor", "end")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .attr("class", `label-${group} text-${group}`);

    // Add data-specific class for X-axis labels, replace "&gt;" to "gt" in class name
    document.querySelectorAll(`.label-${group}`).forEach(function(textNode) {
        textNode.classList.add(`${group}-${textNode.innerHTML.replace("&gt;", "gt")}`);
    });

    // Add Y-axis grid lines and labels
    chart.append("g")
        .call(d3.axisLeft(yScale).ticks(5).tickSize(-width))
        .selectAll("text")
            .style("font-size", "16px");

    // Change Y-axis grid line opacity
    chart.selectAll(".tick line")
    .attr("opacity", 0.5);

    // Remove domain lines 
    chart.selectAll(".domain").remove();
    
    // Add bars, zero height to allow animation
    chart.selectAll("bar")
    .data(dataArr)
    .join("rect")
        .attr("x", (d) => xScale(d.key))
        .attr("y", yScale(0))
        .attr("width", xScale.bandwidth())
        .attr("height", height - yScale(0))
        .attr("fill", "#633AB5")
        .attr("opacity", 1)
        .attr("class", (d) => `bar-${group} ${group}-${d.key}`);

    // Bar animation to target height
    chart.selectAll(`.bar-${group}`)
        .transition("growBar")
        .duration(300)
        .attr("y", function(d) { return yScale(d.value); })
        .attr("height", function(d) { return height - yScale(d.value); })
        .delay((_ignore,i) => i*1000/dataArr.length)

    // Add hidden values at the top of bars
    chart.selectAll("value")
    .data(dataArr)
    .join("text")
        .text((d) => d.value)
        .style("font-size", "16px")
        .style("text-anchor", "middle")
        .attr("x", (d) => xScale(d.key) + xScale.bandwidth() / 2)
        .attr("y", (d) => yScale(d.value) - 15)
        .attr("opacity", 0)
        .attr("class", (d) => `value-${group} text-${group} ${group}-${d.key}`);
    
    // Add selection zones for the whole height. Add interactivity and animations to the zones. 
    const selectTransitTime = 100;

    chart.selectAll("selectionZone")
    .data(dataArr)
    .join("rect")
        .attr("x", (d) => xScale(d.key))
        .attr("y", 0)
        .attr("width", xScale.bandwidth() + 10)
        .attr("height", height + margin.bottom)
        .attr("opacity", 0)
        .on("mouseenter", function (_ignore, d) {
            chart.selectAll(`.bar-${group},.label-${group}`)
                .filter((e) => e.key != d.key)
                    .transition("barLabel")
                    .duration(selectTransitTime)
                    .ease(d3.easeLinear)
                        .attr("opacity", 0.2);
            chart.selectAll(`.${group}-${d.key}`)
                .filter(`.text-${group}`)
                .transition("text")
                .duration(selectTransitTime)
                .ease(d3.easeLinear)
                    .attr("opacity", 1)
                    .style("font-size", "24px");
        })
        .on("mouseleave", function (_ignore, d) {
            chart.selectAll(`.bar-${group},.label-${group}`)
                .filter((e) => e.key != d.key)
                .transition("barLabel")
                .duration(selectTransitTime)
                .ease(d3.easeLinear)
                    .attr("opacity", 1);
            chart.selectAll(`.${group}-${d.key}`)
                .filter(`.text-${group}`)
                .transition("text")
                .duration(selectTransitTime)
                .ease(d3.easeLinear)
                    .style("font-size", "16px");
            chart.selectAll(`.${group}-${d.key}`)
                .filter(`.value-${group}`)
                .transition("value")
                .duration(selectTransitTime)
                .ease(d3.easeLinear)
                    .attr("opacity", 0)
        });
}