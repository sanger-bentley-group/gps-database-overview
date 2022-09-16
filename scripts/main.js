navInit();
buildContent();


// Enable nav interactivity
function navInit() {
    const summaryViewButton = document.querySelector("#summary-view-button");
    const byCountryViewButton = document.querySelector("#by-country-view-button");
    const summaryView = document.querySelector(".summary-view");
    const byCountryView = document.querySelector(".by-country-view");

    summaryViewButton.addEventListener('click', () => {
        summaryView.classList.remove('hidden')
        summaryViewButton.classList.add('nav-button-active')
        byCountryView.classList.add('hidden')
        byCountryViewButton.classList.remove('nav-button-active')
    });

    byCountryViewButton.addEventListener('click', () => {
        byCountryView.classList.remove('hidden')
        byCountryViewButton.classList.add('nav-button-active')
        summaryView.classList.add('hidden')
        summaryViewButton.classList.remove('nav-button-active')
    });
};


// Building content from data.json
async function buildContent() {
    const mapObject = document.querySelector('#world-map');

    // Await for both data.json and map loaded before proceeding
    const [data, map] = await getDataAndMap('data/data.json', mapObject);

    // Build Summary View left panel
    buildSummaryLeft(data);
    buildByCountryMap(data, map);
};


// Supporting functions of buildContent()
async function getDataAndMap(dataPath, mapObject) {
    const [dataResp, ] = await Promise.allSettled([
        fetch(dataPath).then(res => res.json()),
        new Promise ((resolve) => {mapObject.addEventListener('load', resolve);})
    ]);
    return [dataResp.value, mapObject.contentDocument]
};

function buildSummaryLeft(data) {
    const totalSampleCount = Object.values(data['summary']['country']).reduce((a, b) => a + b);
    document.querySelector('#total-sample-count').innerHTML = Number(totalSampleCount).toLocaleString();

    const totalCountryCount = Object.keys(data['summary']['country']).filter(e => e !== 'NaN').length;
    document.querySelector('#total-country-count').innerHTML = Number(totalCountryCount).toLocaleString();

    const totalYearValues = Object.keys(data['summary']['year_of_collection']).filter(e => e !== 'NaN');
    const totalYearValuesMin = Math.min(...totalYearValues);
    const totalYearValuesMax = Math.max(...totalYearValues);
    document.querySelector('#total-year-range-value').innerHTML = `${totalYearValuesMin} - ${totalYearValuesMax}`;
};

function buildByCountryMap(data, map) {
    const countries = Object.keys(data['country']);

    countries.forEach(country => {
        const countryGroup = map.querySelector(`#${country}`);

        // Highlight country
        countryGroup.classList.add('country-available');
    });
};