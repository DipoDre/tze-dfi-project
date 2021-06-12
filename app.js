// VARIABLES - SELECTORS
let cityInput = document.querySelector('#city-input');
let submitButton = document.querySelector('#get-weather');
let city = document.querySelector('#w-city');
let icon = document.querySelector('#w-icon');
let desc = document.querySelector('#w-desc');
let temp = document.querySelector('#w-temp');
let alertBox = document.querySelector('.alert');
let dateEl = document.querySelector('#date');
let timeEl = document.querySelector('#time');

let humidity = document.querySelector('#c-humidity');
let pressure = document.querySelector('#c-pressure');
let speed = document.querySelector('#c-speed');
let sunrise = document.querySelector('#c-sunrise');
let sunset = document.querySelector('#c-sunset');

let day1 = document.querySelector('.day1');
let day2 = document.querySelector('.day2');
let day3 = document.querySelector('.day3');
let day4 = document.querySelector('.day4');
let day5 = document.querySelector('.day5');
let day6 = document.querySelector('.day6');
let day7 = document.querySelector('.day7');


// VARIABLES - OTHERS
let defaultCity = 'lagos';

let forecastDays = [day1, day2, day3, day4, day5, day6, day7];

let dayNight = null;
let lon = null;
let lat = null;

let weatherIcons = {
    thunderstorm: "wi-day-thunderstorm",
    drizzle: "wi-day-sleet",
    rain: "wi-day-storm-showers",
    snow: "wi-day-snow",
    atmosphere: "wi-day-fog",
    clear: "wi-day-sunny",
    clouds: "wi-day-fog",

    nightThunderstorm: "wi-night-thunderstorm",
    nightDrizzle: "wi-night-sleet",
    nightRain: "wi-night-storm-showers",
    nightSnow: "wi-night-snow",
    nightAtmosphere: "wi-night-fog",
    nightClear: "wi-night-clear",
    nightClouds: "wi-night-fog"
};


// FUNCTIONS

// Get the appriopriate weather illustration
function getWeatherIcon(icons, rangeId, dayHour=55) {
    if((6 <= dayHour && dayHour <= 18) || dayHour == 55){
        switch(true){
            case rangeId >= 200 && rangeId <= 232:
                return weatherIcons.thunderstorm;
            case rangeId >= 300 && rangeId <= 321:
                return weatherIcons.drizzle;
            case rangeId >= 500 && rangeId <= 531:
                return weatherIcons.rain;
            case rangeId >= 600 && rangeId <= 622:
                return weatherIcons.snow;
            case rangeId >= 701 && rangeId <= 781:
                return weatherIcons.atmosphere;
            case rangeId === 800:
                return weatherIcons.clear;
            case rangeId >= 801 && rangeId <= 804:
                return weatherIcons.clouds;
            default:
                return weatherIcons.clear;
        }
    } else{
        switch(true){
            case rangeId >= 200 && rangeId <= 232:
                return weatherIcons.nightThunderstorm;
            case rangeId >= 300 && rangeId <= 321:
                return weatherIcons.nightDrizzle;
            case rangeId >= 500 && rangeId <= 531:
                return weatherIcons.nightRain;
            case rangeId >= 600 && rangeId <= 622:
                return weatherIcons.nightSnow;
            case rangeId >= 701 && rangeId <= 781:
                return weatherIcons.nightAtmosphere;
            case rangeId === 800:
                return weatherIcons.nightClear;
            case rangeId >= 801 && rangeId <= 804:
                return weatherIcons.nightClouds;
            default:
                return weatherIcons.nightClear;
        }
    }

}

// Create icon for current weather
function createNewIcon(icons, rangeId, dayHour) {
    let newIcon = getWeatherIcon(icons, rangeId, dayHour);
    icon.removeChild(icon.firstChild);
    return `<i class="wi ${newIcon} display-1"></i>`
}

// Clear the cityInput text
function clearCityInput() {
    cityInput.value = "";
}

// Show error message
function showError(errorMessage) {
    alertBox.innerHTML = errorMessage;
    alertBox.classList.remove("d-none");
    setTimeout(function(){
        alertBox.classList.add("d-none");
    }, 5000);
}

// Display basic current weather information
function displayCurrentWeatherDetails(basicData) {
    city.innerHTML = `${basicData.name}, ${basicData.sys.country}`
    temp.innerHTML = `${basicData.main.temp}&#8451;`
    desc.innerHTML = `${basicData.weather[0].main}`

    dayNight = parseInt(`${moment.unix(basicData.dt).utcOffset(basicData.timezone / 60).hour()}`);

    icon.innerHTML = createNewIcon(weatherIcons, `${basicData.weather[0].id}`, dayNight)

    lon = basicData.coord.lon;
    lat = basicData.coord.lat;

    clearCityInput();
}

// Display secondary current weather information and basic weather forecast for next 7 days
function displaySecondaryWeatherDetails(secondaryData) {
    let timezoneInMinutes = secondaryData.timezone_offset / 60;
    
    dateEl.innerHTML = `${moment.unix(secondaryData.current.dt).utcOffset(timezoneInMinutes).format('dddd, Do MMMM')}`;
    timeEl.innerHTML = `${moment.unix(secondaryData.current.dt).utcOffset(timezoneInMinutes).format('LT')}`;

    humidity.innerHTML = `${secondaryData.current.humidity}&#37;`
    pressure.innerHTML = `${secondaryData.current.pressure} hPa`
    speed.innerHTML = `${secondaryData.current.wind_speed} m/s`
    sunrise.innerHTML = `${moment.unix(secondaryData.current.sunrise).utcOffset(timezoneInMinutes).format('LT')}`
    sunset.innerHTML = `${moment.unix(secondaryData.current.sunset).utcOffset(timezoneInMinutes).format('LT')}`
    
    secondaryData.daily.forEach((day, idx) => {
        if (idx > 0) {
            forecastDays[idx-1].innerHTML = `<div class="box"><div class="day">${moment.unix(secondaryData.daily[idx].dt).format('ddd')}</div></div>
            <div class="box boxIcon"><i class="wi ${getWeatherIcon(weatherIcons, secondaryData.daily[idx].weather[0].id)} h1"></i></div>
            <div class="box"><div class="temp">${secondaryData.daily[idx].temp.min}&#8451; - ${secondaryData.daily[idx].temp.max}&#8451;</div></div>
            <div class="box boxDesc"><div class="fdesc mt-4">${secondaryData.daily[idx].weather[0].description}</div></div>`
        }
    })
}

// Get secondary current weather information and basic weather forecast for next 7 days
function getAdvancedWeatherDetails(latitude, longitude) {
    fetch(`${API.baseUrl}onecall?lat=${latitude}&lon=${longitude}&exclude=hourly,minutely&units=metric&appid=${API.key}`)
    .then(response => response.json())
    .then(response => {
        displaySecondaryWeatherDetails(response)
    })
    .catch(error => {
        console.log(error)
        showError("An Error Occured, Kindly Refresh The Page");
        
    });
}

// Get basic current weather information
function getWeatherDetails(city) {
    fetch(`${API.baseUrl}weather?q=${city}&units=metric&appid=${API.key}`)
        .then(response => response.json())
        .then(response => {            
            if (response.cod === "404") {
                clearCityInput();
                showError("Please Enter A Valid City");                
            }
            else {
                displayCurrentWeatherDetails(response);
                getAdvancedWeatherDetails(lat, lon);
            }
        })
        .catch(error => {
            console.log(error);
            showError("An Error Occured, Kindly Retry");
            
        });
}

// Get and display current weather and weather forecast of default city
window.onload = function() {
    getWeatherDetails(defaultCity)
}

// Get and display current weather and weather forecast of desired city
function getCity(event) {
    event.preventDefault();
    let searchedCity = cityInput.value;
    if(searchedCity.length > 0) {
        getWeatherDetails(searchedCity)
    } else {        
        showError("Please Enter A Valid City");    
    }
}


// EVENT LISTENERS

cityInput.addEventListener("keyup", function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitButton.click();
    }
});

submitButton.addEventListener("click", getCity);

