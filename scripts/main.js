navInit();
filterInit();
buildContent();


// Enable nav interactivity
function navInit() {
    const summaryViewButton = document.querySelector('#summary-view-button');
    const byCountryViewButton = document.querySelector('#by-country-view-button');
    const summaryView = document.querySelector('.summary-view');
    const byCountryView = document.querySelector('.by-country-view');

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


// Enable country list filering
function filterInit() {
    const countryListSearch = document.querySelector('#country-list-search')
    const countryList = document.querySelector('#country-list')
    
    countryListSearch.addEventListener('keyup', () => {
        const filterValue = countryListSearch.value.toUpperCase();
        const countryListItems = countryList.querySelectorAll('li');

        countryListItems.forEach(item => {
            const itemValue = item.innerHTML;
            if (itemValue.toLocaleUpperCase().indexOf(filterValue) != -1) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
}


// Building content from data.json
async function buildContent() {
    const mapObject = document.querySelector('#world-map');

    // Await for data.json, alpha2.json and map loaded before proceeding
    const [data, alpha2, map] = await getData('data/data.json', 'data/alpha2.json', mapObject);

    // Build Summary View left panel
    buildSummaryLeft(data);
    buildByCountryMap(data, map);
    buildByCountryList(data, alpha2, map);
};


// Supporting functions of buildContent()
async function getData(dataPath, alpha2Path, mapObject) {
    const [dataResp, alpha2Resp, ] = await Promise.allSettled([
        fetch(dataPath).then(res => res.json()),
        fetch(alpha2Path).then(res => res.json()),
        new Promise ((resolve) => {mapObject.addEventListener('load', resolve);})
    ]);
    return [dataResp.value, alpha2Resp.value, mapObject.contentDocument]
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


function buildByCountryList(data, alpha2, map) {
    const countries = Object.keys(data['country']);
    const countryList = document.querySelector('#country-list');

    countries.forEach(country => {
        const listItem = document.createElement('li');
        listItem.appendChild(document.createTextNode(alpha2[country]));

        const countryGroup = map.querySelector(`#${country}`);
        const countryLabel = map.querySelector(`#${country}-label`);


        Array(countryGroup, listItem).forEach(elem => (elem.addEventListener('mouseover', () => {
            // Highlight country
            countryGroup.classList.add('country-active');
            countryLabel.classList.add('country-label-available');
        })));

        Array(countryGroup, listItem).forEach(elem => (elem.addEventListener('mouseout', () => {
            const countryGroup = map.querySelector(`#${country}`);
            // Un-highlight country
            countryGroup.classList.remove('country-active');
            countryLabel.classList.remove('country-label-available');
        })));

        countryList.appendChild(listItem);
    });
};