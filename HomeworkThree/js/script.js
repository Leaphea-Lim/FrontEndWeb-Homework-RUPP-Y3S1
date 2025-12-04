const API_KEY = "8aee842bb8502e742cb33331d56749b8";

// Search function
function searchWeather() {
  const cityInput = document.getElementById("cityInput");
  const city = cityInput.value.trim();
  const currentEl = document.getElementById("currentWeather");
  const forecastEl = document.getElementById("forecast");

  if (!city) {
    currentEl.innerHTML = '<p class="error">Please enter a city name.</p>';
    forecastEl.innerHTML = "";
    cityInput.focus();
    return;
  }

  // show loading states
  currentEl.innerHTML = "<p>Loading current weather...</p>";
  forecastEl.innerHTML = "<p>Loading forecast...</p>";

  getCurrentWeather(city);
  getForecast(city);
}

// Small helper to show a transient status message in the search box
function showStatus(message, type = "info", timeout = 3000) {
  const container = document.querySelector(".search-box");
  if (!container) return;

  const existing = container.querySelector(".status");
  if (existing) existing.remove();

  const el = document.createElement("div");
  el.className = "status status-" + (type || "info");
  el.textContent = message;
  container.insertBefore(el, container.firstChild);

  setTimeout(() => {
    el.remove();
  }, timeout);
}

// Fetch current weather data
function getCurrentWeather(city) {
  fetch(
    "https://api.openweathermap.org/data/2.5/weather?q=" +
      encodeURIComponent(city) +
      "&appid=" +
      API_KEY +
      "&units=metric"
  )
    .then(function (res) {
      return res.json().then(function (json) {
        if (!res.ok) {
          // API returns JSON with message when error
          throw new Error(json.message || "Unable to fetch current weather");
        }
        return json;
      });
    })
    .then(function (data) {
      // Collect current weather into an array object
      const currentWeatherArray = [
        {
          city: data.name,
          temperature: data.main.temp,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          feelsLike: data.main.feels_like,
          pressure: data.main.pressure,
        },
      ];

      // Display weather
      document.getElementById("currentWeather").innerHTML =
        "<h3>" +
        data.name +
        "</h3>" +
        "<p>Temperature: " +
        data.main.temp +
        "°C</p>" +
        "<p>Weather: " +
        data.weather[0].description +
        "</p>" +
        "<p>Humidity: " +
        data.main.humidity +
        "%</p>";
      // validation: success with array logging
      console.log("Current weather loaded:", currentWeatherArray);
      showStatus("Current weather loaded", "success");
    })
    .catch(function (err) {
      document.getElementById("currentWeather").innerHTML =
        '<p class="error">' + (err.message || "City not found") + "</p>";
      console.warn("Current weather error:", err.message || err);
      showStatus(err.message || "City not found", "error");
    });
}

// Get 5-day forecast
function getForecast(city) {
  fetch(
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
      encodeURIComponent(city) +
      "&appid=" +
      API_KEY +
      "&units=metric"
  )
    .then(function (res) {
      return res.json().then(function (json) {
        if (!res.ok) {
          throw new Error(json.message || "Unable to fetch forecast");
        }
        return json;
      });
    })
    .then(function (data) {
      if (!data.list || !data.list.length) {
        document.getElementById("forecast").innerHTML =
          '<p class="error">No forecast data available.</p>';
        return;
      }

      let output = "<h3>5-Day Forecast</h3>";
      const forecastArray = [];

      //Note: API gives 40 items (every 3 hours), but we only want one per day
      for (let i = 0; i < data.list.length; i += 8) {
        let day = data.list[i];
        forecastArray.push({
          date: day.dt_txt.split(" ")[0],
          temperature: day.main.temp,
          description: day.weather[0].description,
          humidity: day.main.humidity,
          feelsLike: day.main.feels_like,
        });
        output +=
          "<div class='day'>" +
          "<strong>" +
          day.dt_txt.split(" ")[0] +
          "</strong><br>" +
          "Temp: " +
          day.main.temp +
          "°C<br>" +
          "Weather: " +
          day.weather[0].description +
          "</div>";
      }

      document.getElementById("forecast").innerHTML = output;
      // validation: success with array logging
      console.log("Forecast loaded for " + city + ":", forecastArray);
      showStatus("Forecast loaded", "success");
    })
    .catch(function (err) {
      document.getElementById("forecast").innerHTML =
        '<p class="error">' +
        (err.message || "Forecast not available") +
        "</p>";
      console.warn("Forecast error:", err.message || err);
      showStatus(err.message || "Forecast not available", "error");
    });
}
