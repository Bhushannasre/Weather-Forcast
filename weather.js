const apiKey = '10e4de2cbcb861fa56762298af244d7f';

const searchButton = document.getElementById('searchButton');
const locationButton = document.getElementById('locationButton');
const cityInput = document.getElementById('cityInput');
const recentCities = document.getElementById('recentCities');

const cityNameEl = document.getElementById('cityName');
const temperatureEl = document.getElementById('temperature');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');
const weatherIconEl = document.getElementById('weatherIcon');
const forecastContainer = document.getElementById('forecastContainer');

// Fetch weather by city
async function getWeatherByCity(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();
    displayCurrentWeather(data);
    addRecentCity(city);
    getForecast(city);
  } catch (err) {
    alert(err.message);
  }
}

// Fetch weather by location 
function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
        );
        if (!res.ok) throw new Error('Unable to fetch location weather.');
        const data = await res.json();
        displayCurrentWeather(data);
        getForecast(data.name);
        addRecentCity(data.name);
      } catch (err) {
        alert(err.message);
      }
    });
  } else {
    alert("Geolocation is not supported.");
  }
}

//Display current weather
function displayCurrentWeather(data) {
  cityNameEl.textContent = `City: ${data.name}`;
  temperatureEl.textContent = `Temperature: ${data.main.temp}°C`;
  humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeedEl.textContent = `Wind Speed: ${data.wind.speed} m/s`;
  weatherIconEl.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

//Fetch and display 5-day forecast
async function getForecast(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
    if (!res.ok) throw new Error('Forecast not found.');
    const data = await res.json();
    displayForecast(data);
  } catch (err) {
    console.error(err);
  }
}

//Display forecast cards
function displayForecast(data) {
  forecastContainer.innerHTML = '';

  const dailyData = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData[date]) {
      dailyData[date] = item;
    }
  });

  Object.keys(dailyData).slice(0, 5).forEach(date => {
    const item = dailyData[date];
    const card = document.createElement('div');
    card.className = 'bg-sky-200 p-4 rounded-lg flex flex-col items-center';

    card.innerHTML = `
      <p class="font-bold">${date}</p>
      <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" class="w-12 h-12 my-2" />
      <p>Temp: ${item.main.temp}°C</p>
      <p>Wind: ${item.wind.speed} m/s</p>
      <p>Humidity: ${item.main.humidity}%</p>
    `;

    forecastContainer.appendChild(card);
  });
}

//Add recent city to dropdown
function addRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  if (!cities.includes(city)) {
    cities.push(city);
    localStorage.setItem('recentCities', JSON.stringify(cities));
    updateRecentCities();
  }
}

//Update recent cities dropdown
function updateRecentCities() {
  let cities = JSON.parse(localStorage.getItem('recentCities')) || [];
  recentCities.innerHTML = '<option value="">Select</option>';
  cities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    recentCities.appendChild(option);
  });
}

//Event Listeners
searchButton.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) getWeatherByCity(city);
  else alert("Enter a city name.");
});

locationButton.addEventListener('click', getWeatherByLocation);

recentCities.addEventListener('change', (e) => {
  if (e.target.value) getWeatherByCity(e.target.value);
});

//Initialize
updateRecentCities();
