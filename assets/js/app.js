// GLOBAL VARIABLES
var previousSearches = [];
const key = "bf8fdf4df2703a2cb6877aab03ab9192";
var currentDate = moment().format("l");

// get weather data from the OpenWeather API using the city name that the user entered by passing in the parameter from the function call triggered by the event listener on the "search" button
function getCurrentWeather(newCity) {
  var currentWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${newCity}&units=imperial&appid=${key}`;
  var cityLon;
  var cityLat;

  $.ajax({
    url: currentWeatherURL,
    method: "GET",
  }).then(function (data) {
    $(".current-weather").append(
      `<div class="d-flex">
            <h3 class="align-self-center">${data.name} (${currentDate})</h3>
            <img src=http://openweathermap.org/img/wn/${data.weather[0].icon}.png>
        </div>`
    );
    $(".current-weather").append(`<p>Temp: ${data.main.temp}&#176 F</p>`);
    $(".current-weather").append(`<p>Wind: ${data.wind.speed} MPH</p>`);
    $(".current-weather").append(`<p>Humidity: ${data.main.humidity}%</p>`);
    cityLon = data.coord.lon;
    cityLat = data.coord.lat;
    getUVIndex(cityLat, cityLon);
  });
}

// get the UV Index data from Weather OneCall API using parameters from the "getCurrentWeatherURL" function
function getUVIndex(cityLat, cityLon) {
  var currentUVIndexURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&appid=${key}`;
  console.log(currentUVIndexURL);
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

// populate the search history elements
function searchHistoryList() {
  $(".searchHistory").empty();
  previousSearches.forEach((thisCity) => {
    $(".searchHistory").prepend(
      $(`<button class="btn btn-outline-secondary" data-city=${thisCity}>${thisCity}</button>`)
    );
  });
}

//event listener for search button to add the new city to the search history array
$("#searchBtn").on("click", function (event) {
  event.preventDefault();
  var newCity = $("#text-searchbox").val();
  // prepend previous search list with the new city
  previousSearches.push(newCity);
  // clear searchbox input
  $("#text-searchbox").val("");
  getCurrentWeather(newCity);
  searchHistoryList();
});
