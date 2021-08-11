// GLOBAL VARIABLES
var previousSearches = [];
const key = "bf8fdf4df2703a2cb6877aab03ab9192";
var currentDate = moment().format("l");

// Call init function to initialize page content
init();

// get weather data from the OpenWeather API using the city name that the user entered by passing in the parameter from the function call triggered by the event listener on the "search" button
function getCurrentWeather(getCity) {
  invalidAPIRequest = false;
  var currentWeatherURL = `https://api.openweathermap.org/data/2.5/forecast?q=${getCity}&units=imperial&appid=${key}`;
  var cityLon;
  var cityLat;
  $.ajax({
    url: currentWeatherURL,
    method: "GET",
  }).then(function (data) {
    $(".current-weather").append(
      `<div class="d-flex">
            <h3 class="align-self-center">${data.city.name} (${currentDate})</h3>
            <img src=http://openweathermap.org/img/w/${data.list[0].weather[0].icon}.png>
        </div>`
    );
    $(".current-weather").append(`<p>Temp: ${data.list[0].main.temp}&#176 F</p>`);
    $(".current-weather").append(`<p>Wind: ${data.list[0].wind.speed} MPH</p>`);
    $(".current-weather").append(`<p>Humidity: ${data.list[0].main.humidity}%</p>`);
    cityLon = data.city.coord.lon;
    cityLat = data.city.coord.lat;
    // call UVIndex function passing in the cityLat & cityLon
    getUVIndex(cityLat, cityLon);
    // call 5 day forecast function passing in the currentWeatherURL
    getFiveDayForecast(currentWeatherURL);
  });
}

// function to perform API call to get 5-day forecast
function getFiveDayForecast(currentWeatherURL) {
  var currentFiveDayURL = currentWeatherURL;
  $.ajax({
    url: currentFiveDayURL,
    method: "GET",
  }).then(function (data) {
    // loop through 5 day return API values and create cards for each
    for (i = 0; i < data.list.length; i++) {
      if (data.list[i].dt_txt.search("18:00:00") != -1) {
        var rawForecastDate = data.list[i].dt_txt;
        var forecastDate = moment(rawForecastDate).format("l");
        $(".forecast-container").append(
          `<div class="col mb-3">
                <div class="card h-100">          
                    <div class="card-body">
                        <h4 class="card-title">${forecastDate}</h4>
                        <div class="card-text">
                            <img src="http://openweathermap.org/img/w/${data.list[i].weather[0].icon}.png">
                            <p class="card-text">Temp: ${data.list[i].main.temp} &degF</p>
                            <p class="card-text">Wind: ${data.list[i].wind.speed} MPH</p>
                            <p class="card-text">Humidity: ${data.list[i].main.humidity} %</p>
                        </div>
                    </div>
                </div>
            </div>`
        );
      }
    }
  });
}

// get the UV Index data from Weather OneCall API using parameters from the "getCurrentWeatherURL" function
function getUVIndex(cityLat, cityLon) {
  var currentUVIndexURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&appid=${key}`;
  $.ajax({
    url: currentUVIndexURL,
    method: "GET",
  }).then(function (data) {
    var uvRating;
    // tests to see what color the tag should be based on the UVI level
    if (data.current.uvi <= 2.9) {
      uvRating = `<p>UV Index: <span class="badge bg-success p-2">${data.current.uvi}</span></p>`;
    } else if (data.current.uvi >= 3 && data.current.uvi <= 5.9) {
      uvRating = `<p>UV Index: <span class="badge bg-warning p-2">${data.current.uvi}</span></p>`;
    } else if (data.current.uvi >= 6 && data.current.uvi <= 10.9) {
      uvRating = `<p>UV Index: <span class="badge bg-danger p-2">${data.current.uvi}</span></p>`;
    } else if (data.current.uvi >= 11) {
      uvRating = `<p>UV Index: <span class="badge bg-danger">${data.current.uvi}</span></p>`;
    }
    $(".current-weather").append(uvRating);
  });
}

// populate the search history elements and tag each with an attribute to use for previous search lookups
function searchHistoryList() {
  $(".searchHistory").empty();
  previousSearches.forEach((thisCity) => {
    $(".searchHistory").prepend(
      $(`<button class="btn btn-outline-secondary text-capitalize" data-city=${thisCity}>${thisCity}</button>`)
    );
  });
}

// save previous searches to local storage
function saveCities() {
  localStorage.setItem("cities", JSON.stringify(previousSearches));
}

// display city weather stored in local storage
function displayCities() {
  previousSearches.forEach((thisCity) => {
    $(".searchHistory").prepend(
      $(`<button class="btn btn-outline-secondary text-capitalize" data-city=${thisCity}>${thisCity}</button>`)
    );
  });
}

// Function to initialize page conent
function init() {
  var loadPreviousCities = JSON.parse(localStorage.getItem("cities"));

  if (loadPreviousCities !== null) {
    previousSearches = loadPreviousCities;
  }
  saveCities();
  displayCities();
  $(".current-weather").empty();
  $("#container-today").hide();
}

// when a historical search button is clicked, get the data-city attribute and send it to the getCurrentWeather function. Also clears out the weather and 5-day display elements
$(".searchHistory").on("click", function (event) {
  var getCity = event.target.getAttribute("data-city");
  console.log(getCity);
  $(".current-weather").empty();
  $(".forecast-container").empty();
  $("#container-today").show();
  $(".forecast-container").show();
  getCurrentWeather(getCity);
});

//event listener for search button to add the new city to the search history array
$("#searchBtn").on("click", function (event) {
  event.preventDefault();
  var getCity = $("#text-searchbox").val();
  // clear searchbox input
  $(".current-weather").empty();
  $(".forecast-container").empty();
  // check to see that the searchbox has valid input
  if (getCity === "" || !isNaN(getCity)) {
    $("#text-searchbox").val("");
    $("#container-today").hide();
    $(".forecast-container").hide();
    return;
  }
  // prepend previous search list with the new city
  previousSearches.push(getCity);
  $("#container-today").show();
  $("#text-searchbox").val("");
  getCurrentWeather(getCity);
  saveCities();
  searchHistoryList();
  $("#container-today").show();
  $(".forecast-container").show();
});
