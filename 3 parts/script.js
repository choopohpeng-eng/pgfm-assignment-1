// script.js
const emojiMap = {
    'Fair and Warm': '🌤️',
    'Fair (Day)': '🌤️',
    'Fair (Night)': '🌙',
    'Fair': '🌤️',
    'Partly Cloudy (Day)': '⛅',
    'Partly Cloudy (Night)': '☁️🌙',
    'Partly Cloudy': '⛅',
    'Cloudy': '☁️',
    'Hazy': '🌫️',
    'Slightly Hazy': '🌫️',
    'Windy': '💨',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Light Rain': '🌦️',
    'Moderate Rain': '🌧️',
    'Heavy Rain': '⛈️',
    'Passing Showers': '🌦️',
    'Light Showers': '🌦️',
    'Showers': '🌧️',
    'Heavy Showers': '⛈️',
    'Thundery Showers': '⛈️',
    'Heavy Thundery Showers': '🌩️',
    'Heavy Thundery Showers with Gusty Winds': '🌩️💨'
};

function mapForecastToEmoji(forecast) {
  if (!forecast) return '❓';
  for (const key in emojiMap) {
    if (forecast.toLowerCase().includes(key.toLowerCase())) return emojiMap[key];
  }
  return '❓';
}

let areaMeta = [], forecasts = [];
const API_URL = 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast';

window.addEventListener('load', () => fetchNEA());

async function fetchNEA() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) { showError('HTTP ' + res.status); return; }
    const data = await res.json();
    if (!data?.data?.area_metadata || !data?.data?.items?.length) { showError('Unexpected structure'); return; }

    areaMeta = data.data.area_metadata;
    forecasts = data.data.items[0].forecasts;
    document.getElementById('lastUpdated').textContent = 'Last updated: ' + new Date(data.data.items[0].timestamp).toLocaleString();
    document.getElementById('weatherDuration').textContent = data.data.items[0].valid_period?.text || '—';

    buildRegionCards();
    if(areaMeta.length) selectRegion(0);
  } catch (e) {
    showError('Fetch error');
  }
}

function showError(msg) {
  const box = document.getElementById('errorBox');
  box.style.display = 'block';
  box.textContent = msg;
}

function buildRegionCards() {
  const grid = document.getElementById('regionsGrid');
  grid.innerHTML = '';
  areaMeta.forEach((area, i) => {
    const card = document.createElement('button');
    card.className = 'region-card';
    card.dataset.index = i;
    card.textContent = area.name;
    card.onclick = () => selectRegion(i);
    grid.appendChild(card);
  });
}

function selectRegion(i) {
  document.querySelectorAll('.region-card').forEach(x => x.classList.remove('selected'));
  const card = document.querySelector(`.region-card[data-index="${i}"]`);
  if (card) card.classList.add('selected');

  const area = areaMeta[i];
  const forecastObj = forecasts.find(f => f.area === area.name);

  document.getElementById('weatherRegion').textContent = area.name;
  document.getElementById('weatherForecast').textContent = forecastObj?.forecast || '—';
  document.getElementById('weatherEmoji').textContent = mapForecastToEmoji(forecastObj?.forecast);
}
