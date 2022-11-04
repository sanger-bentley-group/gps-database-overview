// Selection Transition Time for All Charts
const selectTransitTime = 100;


// Build donut charts in Summary View
function buildDonutChart(data, group) {
    const container = document.querySelector(`#summary-view-${group}-chart`);

    // Set dimension of the chart
    const diameter = 500;
    const radius = diameter / 2;

    // Prepare data structure
    let dataArr = [];

    for (const key in data) {
        // Comment out below line to include unknown data
        if (key === "NaN") { continue; }
        dataArr.push({ key: key !== "NaN" ? key : "Unknown" , value: data[key] });
    }

    // Select svg container
    const svgContainer = d3.select(container);
    
    // Add svg into container
    const svg = svgContainer.append("svg")
        .attr("viewBox", `0 0 ${diameter} ${diameter}`);
    
    // Add chart area in svg
    const chart = svg.append("g")
        .attr("transform", `translate(${radius},${radius})`);

    // Setup color scale
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Pie generator
    const pieGenerator = d3.pie().value((d) => d.value);
    
    // Data of arcs generated by pie generator
    const arcData = pieGenerator(dataArr);

    // Arc generator
    const arcGenerator = d3.arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius);

    // Interpolate from start angle to end angle of the pieGenerator
    const angleInterpolate = d3.interpolate(pieGenerator.startAngle()(), pieGenerator.endAngle()());

    // Draw arcs with load animations
    chart.selectAll("path")
    .data(arcData)
    .join("path")
        .attr("fill", (d) => color(d.data.key))
        .attr("stroke", "white")
        .style("stroke-width", "1px")
        .on("mouseenter", function (_ignore, d) {
            chart.selectAll("path")
                .filter((e) => d.data.key !== e.data.key)
                .transition("arc")
                .duration(selectTransitTime)
                .ease(d3.easeLinear)
                    .attr("opacity", 0.2);
            chart.selectAll(`.${group}-${d.data.key.replace(/[\W]+/g,"_")}`)
            .transition("text")
            .duration(selectTransitTime)
            .ease(d3.easeLinear)
                .attr("opacity", 1);
        })
        .on("mouseleave", function (_ignore, d) {
            chart.selectAll("path")
            .filter((e) => d.data.key !== e.data.key)
            .transition("arc")
            .duration(selectTransitTime)
            .ease(d3.easeLinear)
                .attr("opacity", 1);
            chart.selectAll(`.${group}-${d.data.key.replace(/[\W]+/g,"_")}`)
            .transition("text")
            .duration(selectTransitTime)
            .ease(d3.easeLinear)
                .attr("opacity", 0);
        })
        .transition("arcBuilding")
        .ease(d3.easeCubicOut)
        .duration(1000)
            .attrTween("d", function(d) {
                const endAngle = d.endAngle;
                return function(t) {
                    let currentAngle = angleInterpolate(t);
                    if (currentAngle < d.startAngle) {
                        return "";
                    }
                    d.endAngle = Math.min(currentAngle, endAngle);
                    return arcGenerator(d);
                };
            });
    
    // Add hidden key texts
    chart.selectAll("key")
        .data(arcData)
        .join("text")
            .text((d) => d.data.key)
            .attr("transform", `translate(0 -${radius / 10})`)
            .style("text-anchor", "middle")
            .style("font-size", "36px")
            .attr("opacity", 0)
            .attr("class", (d) => `${group}-${d.data.key.replace(/[\W]+/g,"_")}`);
    
    // Add hidden value texts
    chart.selectAll("key")
    .data(arcData)
    .join("text")
        .text((d) => d.value.toLocaleString())
        .attr("transform", `translate(0 ${radius / 5})`)
        .style("text-anchor", "middle")
        .style("font-size", "48px")
        .attr("opacity", 0)
        .attr("class", (d) => `${group}-${d.data.key.replace(/[\W]+/g,"_")}`);
}


// Build bar charts in Summary View
function buildBarChart(data, group) {
    const container = document.querySelector(`#summary-view-${group}-chart`);

    // Set dimension of the chart
    const margin = {top: 30, right: 10, bottom: 70, left: 60},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


    // For year of collection, build bars for the whole range and fill in missing ones
    // For age, build bars according to ageBins
    let dataArr = [];

    if (group === "year_of_collection") {
        const dataNums = Object.keys(data).filter((x) => !isNaN(x));
        const dataNumsMin = Math.min(...dataNums);
        const dataNumsMax = Math.max(...dataNums);

        for (let i = dataNumsMin; i <= dataNumsMax; i++) {
            dataArr.push({ key: i, value: data[i] ?? 0 });
        }

        // Uncomment below to show unknown year of collection
        // if (Object.keys(data).filter((x) => isNaN(x)).length) {
        //     dataArr.push({ key: "Unknown", value: data["NaN"] });
        // }
    } else if (group === "age"){
        for (const [key, val] of Object.entries(data)) {
            // Comment below to show unknown age
            if (key === "NaN") { continue; }

            dataArr.push({ key: key.toString().replace(">", "gt"), value: val });
        }
    }


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
        .range([0, width])
        .domain(dataArr.map((d) => d.key))
        .padding(0.1);
    
    // Setup Y-axis linear scale, the upper limit is round up to closest 1000s
    const yScale = d3.scaleLinear()
        .domain([0, Math.ceil(Math.max(...Object.values(data))/1000) * 1000])
        .range([height, 0]);

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
    
    // Draw bars with load animations
    chart.selectAll("bar")
    .data(dataArr)
    .join("rect")
        .attr("x", (d) => xScale(d.key))
        .attr("width", xScale.bandwidth())
        .attr("fill", "#633AB5")
        .attr("class", (d) => `bar-${group} ${group}-${d.key}`)
        .transition("growBar")
        .delay((_ignore,i) => i*1000/dataArr.length)
        .ease(d3.easeCubicOut)
        .duration(300)
            .attrTween("y", function (d) {
                return function (t) {
                    const yInterpolate = d3.interpolate(yScale(0), yScale(d.value));
                    return yInterpolate(t);
                };
            })
            .attrTween("height", function (d) {
                return function (t) {
                    const heightInterpolate = d3.interpolate(height - yScale(0), height - yScale(d.value));
                    return heightInterpolate(t);
                };
            });

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
    
    // Add selection zones for the whole height. Add interactivity and animations to the zones
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
                .filter((e) => e.key !== d.key)
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
                .filter((e) => e.key !== d.key)
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
                    .attr("opacity", 0);
        });
}

// Build stacked bar charts in Country View
function buildStackedChart(data, type) {
    const container = document.querySelector("#by-country-view-details-content-chart");

    container.innerHTML = "";

    // Set dimension of the chart
    const margin = {top: 80, right: 200, bottom: 70, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // Select svg container
    const svgContainer = d3.select(container);

    // Add svg into container
    const svg = svgContainer.append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);
    
    // Add chart area in svg
    const chart = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    // Setup color scale
    const color = d3.scaleOrdinal(d3.schemeTableau10);

    let groupSet = new Set();
    let keySet = new Set();

    let dataArr = [];
    let maxSum = 0;
    for (const [group, keys] of Object.entries(data[type])) {
        // Comment out below "if block" to include samples with unknown collection year
        if (group === "NaN") { continue; }

        groupSet.add(group);
        let dataArrEle = {group: group};
        let curSum = 0;
        for (let [key, val] of Object.entries(keys)) {
            if (key === "NaN") {
                key = "Unknown";
            }
            keySet.add(key);
            dataArrEle[key] = val;
            curSum += val;
        }
        dataArr.push(dataArrEle);
        maxSum = Math.max(maxSum, curSum);
    }

    // Early termination for country without sample 
    if (dataArr.length === 0) {
        chart.append("text")             
            .attr("transform", `translate(${width/2}, ${height/2})`)
            .style("text-anchor", "middle")
            .text("No samples with a known collection year");
        return;
    }

    // Setup X-axis band scale
    const xScale = d3.scaleBand()
        .range([0, width])
        .domain(groupSet)
        .padding(0.1);
    
    // Round up to nearest tens/hundreds/thousnds of the same magnitude, or at least 10
    const maxSumUp = Math.max(Math.pow(10, Math.floor(Math.log10(maxSum))) * (Number(String(maxSum)[0]) + 1), 10);

    // Setup Y-axis linear scale
    const yScale = d3.scaleLinear()
        .domain([0, maxSumUp])
        .range([height, 0]);

    // Add X-axis and labels
    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0))
        .selectAll("text")
            .style("font-size", "12px")
            .attr("class", `label-${type}`);

    // Add data-specific class for X-axis labels
    document.querySelectorAll(`.label-${type}`).forEach(function(textNode) {
        textNode.classList.add(`${type}-${textNode.innerHTML}`);
    });
    
    // Add X-axis label
    chart.append("text")             
        .attr("transform", `translate(${width/2}, ${height + margin.top - 20})`)
        .style("text-anchor", "middle")
        .text("Year of Collection");

    // Add Y-axis grid lines and labels
    chart.append("g")
        .call(d3.axisLeft(yScale).ticks(5).tickSize(-width));
    
    // Remove domain lines 
    chart.selectAll(".domain").remove();

    // Add hint
    let hint = chart.append("text")             
        .attr("transform", `translate(${width + margin.right/2}, ${height/2})`)
        .style("text-anchor", "middle")
        .style("fill", "#D3D3D3")
        .text("Hover for details");

    // Stack Generator
    let stackGenerator = d3.stack()
        .keys(keySet)
        .value((d, key) => d[key] ?? 0);

    // Pass dataArr into Stack Generator
    let stackData = stackGenerator(dataArr);

    // Draw bars
    chart.append("g")
        .selectAll("g")
        .data(stackData)
        .join("g")
            .attr("fill", (d) => color(d.key))
        .selectAll("rect")
        .data((d) => d)
        .join("rect")
            .attr("x", (d) => xScale(d.data.group))
            .attr("width",xScale.bandwidth())
            .attr("class", `subbar-${type}`)
            .transition("growStackBar")
            .delay((_ignore,i) => i*1000/dataArr.length)
            .ease(d3.easeCubicOut)
            .duration(300)
                .attrTween("y", function (d) {
                    return function (t) {
                        const yInterpolate = d3.interpolate(height, yScale(d[1]));
                        return yInterpolate(t);
                    };
                })
                .attrTween("height", function (d) {
                    return function (t) {
                        const heightInterpolate = d3.interpolate(0, yScale(d[0]) - yScale(d[1]));
                        return heightInterpolate(t);
                    };
                });
    
    // Add selection zones for the whole height. Add interactivity and animations to the zones
    chart.append("g")
        .selectAll("g")
        .data(stackData)
        .join("g")
            .attr("opacity", 0)
        .selectAll("selectionZone")
        .data((d) => d)
        .join("rect")
            .attr("x", (d) => xScale(d.data.group))
            .attr("y", 0)
            .attr("width",xScale.bandwidth() + 10)
            .attr("height",height + 20)
            .on("mouseenter", function (_ignore, d) {
                chart.selectAll(`.subbar-${type}`)
                    .filter((e) => e.data.group !== d.data.group)
                        .transition(`subbar${type}`)
                        .duration(selectTransitTime)
                        .ease(d3.easeLinear)
                            .attr("opacity", 0.2);
                chart.selectAll(`.label-${type}`)
                    .filter((e) => e !== (d.data.group))
                        .transition(`label${type}opacity`)
                        .duration(selectTransitTime)
                        .ease(d3.easeLinear)
                            .attr("opacity", 0.2);
                chart.selectAll(`.label-${type}`)
                    .filter((e) => e === (d.data.group))
                        .transition(`label${type}size`)
                        .duration(selectTransitTime)
                        .ease(d3.easeLinear)
                            .style("font-size", "16px");

                hint
                    .transition("hint")
                    .duration(selectTransitTime)
                    .style("opacity", 0);
                
                chart.append("text")             
                    .attr("transform", `translate(${width + margin.right/2}, 0)`)
                    .attr("class", "legend")
                    .style("text-anchor", "middle")
                    .style("opacity", 0)
                    .text(d.data.group)
                    .transition("legend")
                    .duration(selectTransitTime)
                        .style("opacity", 1);

                let i = 1;
                for (const key of Object.keys(d.data).reverse()) {
                    const val = d.data[key];
                    if (key === "group" | val === 0) { continue; }
                    
                    chart.append("circle")
                        .attr("r", 5)
                        .attr("cx", width + 20)
                        .attr("cy", i * 20)
                        .attr("fill", color(key))
                        .attr("class", "legend")
                        .style("opacity", 0)
                        .transition("legend")
                        .duration(selectTransitTime)
                            .style("opacity", 1);
                    
                    chart.append("text")
                        .attr("transform", `translate(${width + 40}, ${i * 20 + 5})`)
                        .attr("class", "legend")
                        .style("opacity", 0)
                        .style("font-size", "14px")
                        .text(key)
                        .transition("legend")
                        .duration(selectTransitTime)
                            .style("opacity", 1);
                    
                    chart.append("text")
                        .attr("transform", `translate(${width + margin.right}, ${i * 20 + 5})`)
                        .attr("class", "legend")
                        .style("opacity", 0)
                        .style("text-anchor", "end")
                        .style("font-size", "14px")
                        .text(val.toLocaleString())
                        .transition("legend")
                        .duration(selectTransitTime)
                            .style("opacity", 1);

                    i += 1;
                }
            })
            .on("mouseleave", function (_ignore, d) {
                chart.selectAll(`.subbar-${type}`)
                    .filter((e) => e.data.group !== d.data.group)
                    .transition(`subbar${type}`)
                    .duration(selectTransitTime)
                    .ease(d3.easeLinear)
                        .attr("opacity", 1);
                chart.selectAll(`.label-${type}`)
                    .filter((e) => e !== (d.data.group))
                        .transition(`label${type}opacity`)
                        .duration(selectTransitTime)
                        .ease(d3.easeLinear)
                            .attr("opacity", 1);
                chart.selectAll(`.label-${type}`)
                    .filter((e) => e === (d.data.group))
                        .transition(`label${type}size`)
                        .duration(selectTransitTime)
                        .ease(d3.easeLinear)
                            .style("font-size", "12px");

                hint
                    .transition("hint")
                    .duration(selectTransitTime)
                        .style("opacity", 1);

                chart.selectAll(".legend")
                    .transition("legend")
                    .duration(selectTransitTime)
                        .style("opacity", 0)
                        .remove();
            });

    // Setup color scale for vaccine period highlights
    const labelBGColor = d3.scaleOrdinal()
        .domain(["Pre-PCV", "Post-PCV7", "Post-PCV10", "Post-PCV13"])
        .range(d3.schemeSet3);

    // Add vaccine period labels and separators
    for (const [i, [range, period]] of Object.entries(data.vaccine_period).entries()) {
        const rangeArr = range.split(",");

        // Interpolate from left to right of chart
        const lineInterpolate = d3.interpolate(0, width);

        // Add vaccine period
        chart.append("text")
            .text(period)
            .style("font-size", "12px")
            .style("text-anchor", "start")
            .attr("transform", `translate(${xScale(rangeArr[0]) + 5},-15)rotate(-20)`)
            .transition("showPeriodLabel")
            .duration(1000)
                .attrTween("opacity", function() {
                    return function(t) {
                        let current = lineInterpolate(t);
                        if (current < xScale(rangeArr[0])) {
                            return 0;
                        } else {
                            return Math.min((current - xScale(rangeArr[0])) / xScale.bandwidth(), 1);
                        }
                    };
                });

        // Add vaccine period highlight
        chart.append("line")
            .attr("x1", xScale(rangeArr[0]))
            .attr("y1", -10)
            .attr("x2", xScale(rangeArr[1]) + xScale.bandwidth())
            .attr("y2", -10)
            .style("stroke-width", 3)
            .style("stroke", labelBGColor(period))
            .transition("growPeriodLine")
            .duration(1000)
                .attrTween("x2", function() {
                    return function(t) {
                        let current = lineInterpolate(t);
                        if (current < xScale(rangeArr[0])) {
                            return xScale(rangeArr[0]);
                        } else {
                            return Math.min(current, xScale(rangeArr[1]) + xScale.bandwidth());
                        }
                    };
                });

        // Skip adding separator if this is the last period
        if (i === Object.keys(data.vaccine_period).length - 1) { continue; }
        
        // Add separator at the end of period
        const paddingSize = xScale.padding() * xScale.step();
        chart.append("line")
            .attr("x1", xScale(rangeArr[1]) + xScale.bandwidth() + paddingSize / 2)
            .attr("y1", -margin.top/4)
            .attr("x2", xScale(rangeArr[1]) + xScale.bandwidth() + paddingSize / 2)
            .attr("y2", height)
            .style("stroke-width", 1)
            .style("stroke-dasharray", ("3,3"))
            .style("stroke", "black")
            .transition("showPeriodSeparator")
            .duration(1000)
                .attrTween("opacity", function() {
                    return function(t) {
                        let current = lineInterpolate(t);
                        if (current < xScale(rangeArr[1])) {
                            return 0;
                        } else {
                            return Math.min((current - xScale(rangeArr[1])) / xScale.bandwidth(), 0.5);
                        }
                    };
                });

    }
}