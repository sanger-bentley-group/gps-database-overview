navInit();
filterInit();
buildContent();


// Enable nav interactivity
function navInit() {
    const summaryViewButton = document.querySelector("#summary-view-button");
    const byCountryViewButton = document.querySelector("#by-country-view-button");
    const summaryView = document.querySelector("#summary-view");
    const byCountryView = document.querySelector("#by-country-view");
    const byCountryViewDetails = document.querySelector("#by-country-view-details");
    const backToMapLink = document.querySelector("#back-to-map-link");

    summaryViewButton.addEventListener("click", function () {
        summaryView.classList.remove("hidden");
        summaryViewButton.classList.add("nav-button-active");
        byCountryView.classList.add("hidden");
        byCountryViewButton.classList.remove("nav-button-active");
        byCountryViewDetails.classList.add("hidden");
    });

    [byCountryViewButton, backToMapLink].forEach(function (elem) {
        elem.addEventListener("click",function () {
            byCountryView.classList.remove("hidden");
            byCountryViewButton.classList.add("nav-button-active");
            byCountryViewDetails.classList.add("hidden");
            summaryView.classList.add("hidden");
            summaryViewButton.classList.remove("nav-button-active");
        });
    });
}


// Enable country list filering
function filterInit() {
    const countryListSearch = document.querySelector("#country-list-search");
    const countryList = document.querySelector("#country-list");

    countryListSearch.addEventListener("keyup", function () {
        const filterValue = countryListSearch.value.toUpperCase();
        const countryListItems = countryList.querySelectorAll("li");

        countryListItems.forEach(function (item) {
            const itemValue = item.innerHTML;
            if (itemValue.toLocaleUpperCase().indexOf(filterValue) !== -1) {
                item.style.display = "";
            } else {
                item.style.display = "none";
            }
        });
    });
}


// Build content based on data
async function buildContent() {
    const mapObject = document.querySelector("#world-map");

    // Await for data.json, alpha2.json and map loaded before proceeding
    const [data, alpha2, map] = await getData("data/data.json", "data/alpha2.json", mapObject);

    buildSummaryLeft(data, alpha2);
    buildSummaryRight(data);
    buildByCountryMap(data, map);
    buildByCountryList(data, alpha2);
    byCountryInit(data, map, alpha2);
}


// Get data.json, alpha2.json and ensure map is loaded
async function getData(dataPath, alpha2Path, mapObject) {
    const [dataResp, alpha2Resp, _ignore] = await Promise.allSettled([
        fetch(dataPath).then((res) => res.json()),
        fetch(alpha2Path).then((res) => res.json()),
        new Promise ((resolve) => mapObject.addEventListener("load", resolve))
    ]);
    return [dataResp.value, alpha2Resp.value, mapObject.contentDocument];
}


// Build Summary View left panel
function buildSummaryLeft(data, alpha2) {
    const totalSampleCount = Object.values(data.summary.country).reduce((a, b) => a + b);
    document.querySelector("#total-sample-count").innerHTML = totalSampleCount;

    const totalCountryCount = Object.keys(data.summary.country).filter((e) => alpha2.hasOwnProperty(e)).length;
    document.querySelector("#total-country-count").innerHTML = totalCountryCount;

    const totalYearValues = Object.keys(data.summary.year_of_collection).filter((e) => e !== "NaN");
    const totalYearValuesMin = Math.min(...totalYearValues);
    const totalYearValuesMax = Math.max(...totalYearValues);
    document.querySelector("#total-year-low-value").innerHTML = `${totalYearValuesMin}`;
    document.querySelector("#total-year-high-value").innerHTML = `${totalYearValuesMax}`;

    document.querySelectorAll('.countup').forEach(animateCountUp);
}


// Build Summary View right panel
function buildSummaryRight(data) {
    ["country", "vaccine_period", "manifestation"].forEach((group) => buildDonutChart(data.summary[group], group));
    ["year_of_collection", "age"].forEach((group) => buildBarChart(data.summary[group], group));
}


// Build By Country View Map
function buildByCountryMap(data, map) {
    const countries = Object.keys(data.country);

    // Loop through countries with available data
    countries.forEach(function (country) {
        const countryGroup = map.querySelector(`#${country}`);
        // Highlight country
        countryGroup.classList.add("country-available");
    });
}


// Build By Country View List
function buildByCountryList(data, alpha2) {
    const countries = Object.keys(data.country);
    const countryList = document.querySelector("#country-list");

    // Loop through countries with available data
    countries.forEach(function (country) {
        // Populate By Country View List
        const listItem = document.createElement("li");
        listItem.appendChild(document.createTextNode(alpha2[country]));
        listItem.setAttribute("id", `${country}-li`);
        countryList.appendChild(listItem);
    });
}


// Enable By Country View interactivity
function byCountryInit(data, map, alpha2) {
    const countries = Object.keys(data.country);
    const countryTooltipInstruction = document.querySelector("#by-country-view-tooltip-instruction");
    const countryTooltipDisplay = document.querySelector("#by-country-view-tooltip-display");
    const countryTooltipValue = document.querySelector("#by-country-view-tooltip-value");
    const byCountryView = document.querySelector("#by-country-view");
    const byCountryViewDetails = document.querySelector("#by-country-view-details");

    // Loop through countries with available data
    countries.forEach(function (country) {
        const countryGroup = map.querySelector(`#${country}`);
        const countryLabel = map.querySelector(`#${country}-label`);
        const countryListItem = document.querySelector(`#${country}-li`);

        // Highlight country and show tooltip when mouseover from map element or list element
        [countryGroup, countryListItem].forEach(function (elem) {
            elem.addEventListener("mouseover", function () {
                countryGroup.classList.add("country-active");
                countryLabel.classList.add("country-label-available");
                countryTooltipValue.innerHTML = `${Number(data.country[country].total).toLocaleString()} Samples`;
                countryTooltipInstruction.classList.add("hidden");
                countryTooltipDisplay.classList.remove("hidden");
            });
        });

        // Un-highlight country and hide tooltip when mouseout from map element or list element
        [countryGroup, countryListItem].forEach(function (elem) {
            elem.addEventListener("mouseout", function () {
                countryGroup.classList.remove("country-active");
                countryLabel.classList.remove("country-label-available");
                countryTooltipInstruction.classList.remove("hidden");
                countryTooltipDisplay.classList.add("hidden");
            });
        });

        // Enter details view when mouseclick from map element or list element
        [countryGroup, countryListItem].forEach(function (elem) {
            elem.addEventListener("click", function (e) {
                byCountryView.classList.add("hidden");
                byCountryViewDetails.classList.remove("hidden");

                const countryAlpha2 = getAlpha2(e.target);
                buildByCountryDetails(countryAlpha2, alpha2);
            });
        });
    });
}


// Count up animation
function animateCountUp(elem) {
    // frame duration = 1000ms / fps
    const frameDuration = 1000 / 60;
    // total frames = total duration / frame duration
    const frames = Math.round(1000 / frameDuration);
    const easeOut = t => t * (2 - t);

    let frame = 0;
    const countTo = parseInt(elem.innerHTML);
    
    const counter = setInterval( function() {
        frame++;
        let currentCount = Math.round(countTo * easeOut(frame / frames));

        // Update value to localeString format if element has .localeString class
        if (elem.classList.contains('localeString')) {
            currentCount = currentCount.toLocaleString();
        }

        elem.innerHTML = currentCount;

        if (frame === frames) {
            clearInterval(counter);
        }
    }, frameDuration);
}


// Extract country alpha2 code from different elements
function getAlpha2(elem) {
    if (elem.nodeName === "LI") {
        return elem.id.split("-")[0];
    } else {
        while (elem.nodeName !== "g") {
            elem = elem.parentNode;
        }
        return elem.id;
    }
}


// Build By Country Details
function buildByCountryDetails(countryAlpha2, alpha2) {
    const byCountryViewTitle = document.querySelector("#by-country-view-details-title");
    byCountryViewTitle.innerHTML = alpha2[countryAlpha2];
    // TODO
}