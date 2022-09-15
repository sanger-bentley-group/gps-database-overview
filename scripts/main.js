// Enable nav bar interactivity

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


// Building content from data.json
(async () => {
    const getData = async () => {
        const resp = await fetch('data/data.json');
        return await resp.json();
    };

    const data = await getData();

    const totalSampleCount = Object.values(data['summary']['country']).reduce((a, b) => a + b);
    document.querySelector('#total-sample-count').innerHTML = Number(totalSampleCount).toLocaleString();

    const totalCountryCount = Object.keys(data['summary']['country']).filter(e => e !== 'NaN').length;
    document.querySelector('#total-country-count').innerHTML = Number(totalCountryCount).toLocaleString();

    const totalYearValues = Object.keys(data['summary']['year_of_collection']).filter(e => e !== 'NaN');
    const totalYearValuesMin = Math.min(...totalYearValues);
    const totalYearValuesMax = Math.max(...totalYearValues);
    document.querySelector('#total-year-range-value').innerHTML = `${totalYearValuesMin} - ${totalYearValuesMax}`;
})();