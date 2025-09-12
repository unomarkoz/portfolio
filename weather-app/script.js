// script.js
const apiKey = '8d9ba75e0a4ad681d021ed7705a141d5'; // Replace with your OpenWeatherMap API key
document.getElementById('forecastSection').classList.remove('visible');
document.getElementById('forecastSection').classList.add('hidden');

function getWeather() {
  const city = document.getElementById('cityInput').value;

  // Show spinner
  document.getElementById('loader').classList.remove('hidden');
  

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      const weatherHTML = `
        <h2>${data.name}</h2>
        <p>${data.weather[0].main}</p>
        <p>Temp: ${data.main.temp}°C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind: ${data.wind.speed} m/s</p>
      `;
      document.getElementById('weatherDisplay').innerHTML = weatherHTML;

      // Hide spinner
      document.getElementById('loader').classList.add('hidden');
    })
    .catch(() => {
      document.getElementById('weatherDisplay').innerHTML = `<p>City not found.</p>`;
      document.getElementById('loader').classList.add('hidden');
    });

  getForecast(city);
}

function getForecast(city) {
  const apiKey = '8d9ba75e0a4ad681d021ed7705a141d5';
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      const forecastHTML = data.list
        .filter((item, index) => index % 8 === 0)
        .slice(0, 3)
        .map(item => {
          const date = new Date(item.dt_txt).toLocaleDateString();
          return `
            <div class="day">
              <h4>${date}</h4>
              <p>${item.weather[0].main}</p>
              <p>Temp: ${item.main.temp}°C</p>
            </div>
          `;
        })
        .join('');

      // Inject forecast HTML
      document.getElementById('forecastDisplay').innerHTML = forecastHTML;

      // Show the forecast section
      const forecastSection = document.getElementById('forecastSection');
      forecastSection.classList.remove('hidden');
      forecastSection.classList.add('visible');
    })
    .catch(() => {
      document.getElementById('forecastDisplay').innerHTML = `<p>Forecast data not available.</p>`;
    });
}
document.getElementById('toggle-dark-mode').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  document.querySelector('.app').classList.toggle('dark-mode');
});
document.getElementById('back-btn').addEventListener('click', () => {
  window.close();
});
function clearWeather() {
  // Clear input field
  document.getElementById('cityInput').value = '';

  // Clear weather display
  document.getElementById('weatherDisplay').innerHTML = '';

  // Clear forecast display
  document.getElementById('forecastDisplay').innerHTML = '';

  // Hide forecast section
  const forecastSection = document.getElementById('forecastSection');
  forecastSection.classList.remove('visible');
  forecastSection.classList.add('hidden');

  // Optionally hide suggestions if using autocomplete
  const suggestions = document.getElementById('suggestions');
  if (suggestions) suggestions.innerHTML = '';
}



