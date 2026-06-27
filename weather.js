const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const weatherDataContainer = document.getElementById('weatherData');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');

// Elements to update
const cityNameEl = document.getElementById('cityName');
const weatherIconEl = document.getElementById('weatherIcon');
const temperatureEl = document.getElementById('temperature');
const conditionEl = document.getElementById('condition');
const windSpeedEl = document.getElementById('windSpeed');
const humidityEl = document.getElementById('humidity');
const feelsLikeEl = document.getElementById('feelsLike');

// Map WMO Weather codes to descriptions and emojis
function getWeatherCondition(code, isDay) {
  const weatherMap = {
    0: { desc: 'Clear Sky', icon: isDay ? '☀️' : '🌙' },
    1: { desc: 'Mainly Clear', icon: isDay ? '🌤️' : '☁️' },
    2: { desc: 'Partly Cloudy', icon: '⛅' },
    3: { desc: 'Overcast', icon: '☁️' },
    45: { desc: 'Fog', icon: '🌫️' },
    48: { desc: 'Depositing Rime Fog', icon: '🌫️' },
    51: { desc: 'Light Drizzle', icon: '🌧️' },
    53: { desc: 'Moderate Drizzle', icon: '🌧️' },
    55: { desc: 'Dense Drizzle', icon: '🌧️' },
    61: { desc: 'Slight Rain', icon: '🌦️' },
    63: { desc: 'Moderate Rain', icon: '🌧️' },
    65: { desc: 'Heavy Rain', icon: '🌧️' },
    71: { desc: 'Slight Snow', icon: '🌨️' },
    73: { desc: 'Moderate Snow', icon: '❄️' },
    75: { desc: 'Heavy Snow', icon: '❄️' },
    95: { desc: 'Thunderstorm', icon: '⛈️' },
    96: { desc: 'Thunderstorm & Hail', icon: '⛈️' },
    99: { desc: 'Heavy Thunderstorm', icon: '⛈️' }
  };
  
  return weatherMap[code] || { desc: 'Unknown', icon: '❓' };
}

async function fetchWeather(city) {
  // Reset UI
  weatherDataContainer.classList.add('hidden');
  errorMessage.classList.remove('active');
  loader.classList.add('active');

  try {
    // 1. Get Coordinates from City Name
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error('City not found');
    }

    const location = geoData.results[0];
    const lat = location.latitude;
    const lon = location.longitude;
    const resolvedName = location.name;

    // 2. Get Weather Data using Coordinates
    const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m`);
    const data = await weatherResponse.json();

    const current = data.current;
    const conditionInfo = getWeatherCondition(current.weather_code, current.is_day);

    // Update DOM
    cityNameEl.textContent = resolvedName;
    weatherIconEl.textContent = conditionInfo.icon;
    temperatureEl.textContent = `${Math.round(current.temperature_2m)}°C`;
    conditionEl.textContent = conditionInfo.desc;
    
    windSpeedEl.textContent = `${current.wind_speed_10m} km/h`;
    humidityEl.textContent = `${current.relative_humidity_2m}%`;
    feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;

    // Show Data
    loader.classList.remove('active');
    weatherDataContainer.classList.remove('hidden');

  } catch (error) {
    console.error('Error fetching weather:', error);
    loader.classList.remove('active');
    errorMessage.classList.add('active');
  }
}

// Event Listeners
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
  }
});

cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const city = cityInput.value.trim();
    if (city) {
      fetchWeather(city);
    }
  }
});

// Load default city on start
fetchWeather('London');
