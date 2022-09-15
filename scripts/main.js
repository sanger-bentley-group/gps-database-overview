const summaryViewButton = document.querySelector("#summary-view-button");
const byCountryViewButton = document.querySelector("#by-country-view-button");
const summaryView = document.querySelector("#summary-view");
const byCountryView = document.querySelector("#by-country-view");

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