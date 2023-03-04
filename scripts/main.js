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

    // For Summary Button: On click, go to summary view
    summaryViewButton.addEventListener("click", function () {
        summaryView.classList.remove("hidden");
        summaryViewButton.classList.add("nav-button-active");
        byCountryView.classList.add("hidden");
        byCountryViewButton.classList.remove("nav-button-active");
        byCountryViewDetails.classList.add("hidden");
    });

    // For By Country Button and Back to Map button: On click, go to map view
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

    // Filter the list after every key entry
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
    const loadingOverlay = document.querySelector("#loading-overlay");

    // Detect whole page is loaded to represent map is loaded
    // then await for data.json and alpha2.json before proceeding
    window.addEventListener("load", () => {
        getData("data/data.json", "data/alpha2.json")
        .then( ([data, alpha2]) => {
            const map = mapObject.contentDocument

            // Remove loading overlay once all files are loaded
            loadingOverlay.classList.add('hidden');
            
            buildSummaryLeft(data);
            buildSummaryRight(data);
            buildByCountryMap(data, map);
            buildByCountryList(data, alpha2);
            byCountryInit(data, map, alpha2);

        });
    });
}


// Return promise on both fetching of data.json and alpha2.json
async function getData(dataPath, alpha2Path) {
    return Promise.all(
        [
            fetch(dataPath).then((res) => res.json()),
            fetch(alpha2Path).then((res) => res.json()),
        ]);
}


// Build Summary View left panel
function buildSummaryLeft(data) {
    // Show total sample count
    const totalSampleCount = Object.values(data.summary.country).reduce((a, b) => a + b);
    document.querySelector("#total-sample-count").innerHTML = totalSampleCount;

    // Show total countries/regions count except unknown
    const totalCountryCount = Object.keys(data.summary.country).filter((e) => e !== "NaN").length;
    document.querySelector("#total-country-count").innerHTML = totalCountryCount;

    // Show minimum and maximum year of collection of samples
    const totalYearValues = Object.keys(data.summary.year_of_collection).filter((e) => e !== "NaN");
    const totalYearValuesMin = Math.min(...totalYearValues);
    const totalYearValuesMax = Math.max(...totalYearValues);
    document.querySelector("#total-year-low-value").innerHTML = `${totalYearValuesMin}`;
    document.querySelector("#total-year-high-value").innerHTML = `${totalYearValuesMax}`;

    // Run count up animation for all values in this panel
    document.querySelectorAll('.countup').forEach(animateCountUp);
}


// Build Summary View right panel
function buildSummaryRight(data) {
    // Build donut charts for upper row
    ["country", "vaccine_period", "manifestation"].forEach((group) => buildDonutChart(data.summary[group], group));
    // Build bar charts for lower row
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
    const countryInfobox = document.querySelector("#by-country-view-infobox");
    const countryInfoboxInstruction = document.querySelector("#by-country-view-infobox-instruction");
    const countryInfoboxDisplay = document.querySelector("#by-country-view-infobox-display");
    const countryInfoboxValue = document.querySelector("#by-country-view-infobox-value");
    const byCountryView = document.querySelector("#by-country-view");
    const byCountryViewDetails = document.querySelector("#by-country-view-details");

    // Loop through countries with available data
    countries.forEach(function (country) {
        const countryGroup = map.querySelector(`#${country}`);
        const countryLabel = map.querySelector(`#${country}-label`);
        const countryListItem = document.querySelector(`#${country}-li`);

        // Highlight country, change infobox to show value and hide instruction when mouseover from map element or list element
        [countryGroup, countryListItem].forEach(function (elem) {
            elem.addEventListener("mouseover", function () {
                countryGroup.classList.add("country-active");
                countryLabel.classList.add("country-label-available");
                countryInfobox.classList.add("infobox-active");
                countryInfoboxValue.innerHTML = `${Number(data.country[country].total).toLocaleString()} Samples`;
                countryInfoboxInstruction.classList.add("hidden");
                countryInfoboxDisplay.classList.remove("hidden");
            });
        });

        // Un-highlight country, change infobox to hide value and show instruction when mouseout from map element or list element
        [countryGroup, countryListItem].forEach(function (elem) {
            elem.addEventListener("mouseout", function () {
                countryGroup.classList.remove("country-active");
                countryLabel.classList.remove("country-label-available");
                countryInfobox.classList.remove("infobox-active");
                countryInfoboxInstruction.classList.remove("hidden");
                countryInfoboxDisplay.classList.add("hidden");
            });
        });

        // Enter details view when mouseclick from map element or list element, and build content
        [countryGroup, countryListItem].forEach(function (elem) {
            elem.addEventListener("click", function (e) {
                byCountryView.classList.add("hidden");
                byCountryViewDetails.classList.remove("hidden");

                const countryAlpha2 = getAlpha2(e.target);
                buildByCountryDetails(data.country[countryAlpha2], countryAlpha2, alpha2);
            });
        });
    });
}


// Count up animation
function animateCountUp(elem) {
    // Frame duration = 1000ms / fps
    const frameDuration = 1000 / 60;
    // Total frames = total duration / frame duration
    const frames = Math.round(1000 / frameDuration);
    // Ease out function when approaching 1
    const easeOut = (t) => t * (2 - t);

    // Get target value
    let frame = 0;
    const countTo = parseInt(elem.innerHTML);
    
    // Count from 0 to target value with ease out
    const counter = setInterval(function() {
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


// Extract country alpha2 code from different elements of map / country list
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
function buildByCountryDetails(countryData, countryAlpha2, alpha2) {
    const byCountryViewTitle = document.querySelector("#by-country-view-details-title");
    const byAgeButton = document.querySelector("#by-age-button");
    const byManifestationButton = document.querySelector("#by-manifestation-button");

    // Set title
    byCountryViewTitle.innerHTML = alpha2[countryAlpha2];

    // Build stacked chart by age or by manifestation based on active button
    const activeButton = document.querySelector(".country-button-active");
    if (activeButton === byAgeButton) {
        buildStackedChart(countryData, "age");
    } else if (activeButton === byManifestationButton) {
        buildStackedChart(countryData, "manifestation");
    }

    // Enable interactivity of By Age button
    byAgeButton.addEventListener("click", function() {
        byAgeButton.classList.add("country-button-active");
        byAgeButton.setAttribute("disabled", "");
        byManifestationButton.classList.remove("country-button-active");
        byManifestationButton.removeAttribute("disabled");
        buildStackedChart(countryData, "age");
    });

    // Enable interactivity of By Manifestation button
    byManifestationButton.addEventListener("click", function() {
        byAgeButton.classList.remove("country-button-active");
        byAgeButton.removeAttribute("disabled");
        byManifestationButton.classList.add("country-button-active");
        byManifestationButton.setAttribute("disabled", "");
        buildStackedChart(countryData, "manifestation");
    });
}