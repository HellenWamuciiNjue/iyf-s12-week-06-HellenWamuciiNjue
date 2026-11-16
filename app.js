const API_BASE = 'https://api.openweathermap.org/data/2.5';
let searchHistory = [];
try { searchHistory = JSON.parse(localStorage.getItem('weatherHistory') || '[]'); } catch { searchHistory = []; }

const $ = (id) => document.getElementById(id);
const searchForm = $('search-form');
const cityInput = $('city-input');
const loadingIndicator = $('loading-indicator');
const errorDisplay = $('error-display');
const weatherDisplay = $('weather-display');
const historyList = $('history-list');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const city = cityInput.value.trim();
    if (city) fetchWeatherData(city);
});

historyList.addEventListener('click', (event) => {
    const button = event.target.closest('.history-btn');
    if (button) fetchWeatherData(button.dataset.city);
});

async function fetchWeatherData(city) {
    showLoading(true);
    clearStatusDisplays();

    try {
        if (!window.CONFIG || !window.CONFIG.WEATHER_API_KEY) {
            throw new Error('Weather configuration is missing. Please refresh the page and try again.');
        }

        const key = encodeURIComponent(window.CONFIG.WEATHER_API_KEY);
        const query = encodeURIComponent(city);
        const currentUrl = `${API_BASE}/weather?q=${query}&units=metric&appid=${key}`;
        const forecastUrl = `${API_BASE}/forecast?q=${query}&units=metric&appid=${key}`;

        const currentResponse = await fetch(currentUrl);
        if (!currentResponse.ok) throw apiError(currentResponse.status);
        const current = await currentResponse.json();

        // The current conditions remain useful even if the forecast endpoint is temporarily unavailable.
        let forecast = null;
        try {
            const forecastResponse = await fetch(forecastUrl);
            if (forecastResponse.ok) forecast = await forecastResponse.json();
        } catch (forecastError) {
            console.warn('Forecast could not be loaded:', forecastError);
        }

        updateUI(current, forecast);
        saveSearchHistory(current.name);
        cityInput.value = current.name;
    } catch (error) {
        showError(navigator.onLine ? error.message : 'You appear to be offline. Check your connection and try again.');
    } finally {
        showLoading(false);
    }
}

function apiError(status) {
    if (status === 404) return new Error('We could not find that city. Check the spelling and try again.');
    if (status === 401) return new Error('The weather service rejected the API key. Please check the key configuration.');
    if (status === 429) return new Error('The weather service is receiving too many requests. Please try again shortly.');
    return new Error(`The weather service returned an error (${status}). Please try again.`);
}

function updateUI(data, forecast) {
    const weather = data.weather?.[0] || {};
    const main = (weather.main || 'Clear').toLowerCase();
    const description = weather.description || 'Current conditions';
    const temp = Math.round(data.main.temp);

    $('city-name').textContent = `${data.name}, ${data.sys.country}`;
    $('temperature').textContent = temp;
    $('description').textContent = description;
    $('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
    $('humidity').textContent = `${data.main.humidity}%`;
    $('wind').textContent = `${Number(data.wind?.speed || 0).toFixed(1)} m/s`;
    $('pressure').textContent = `${data.main.pressure} hPa`;
    $('visibility').textContent = data.visibility != null ? `${(data.visibility / 1000).toFixed(1)} km` : 'Unavailable';
    $('sunrise').textContent = formatClock(data.sys.sunrise, data.timezone);
    $('sunset').textContent = formatClock(data.sys.sunset, data.timezone);
    $('weather-date').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date());
    $('updated-time').textContent = `Updated ${new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date())}`;
    $('condition-summary').textContent = getShortSummary(main, temp);
    setWeatherScene(main, description);
    renderInsights(data, main);
    renderForecast(forecast);
    weatherDisplay.classList.remove('hidden');
}

function formatClock(timestamp, offsetSeconds) {
    if (!timestamp) return 'Unavailable';
    const date = new Date((timestamp + (offsetSeconds || 0)) * 1000);
    return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }).format(date);
}

function getShortSummary(main, temp) {
    if (main.includes('thunder')) return 'Stormy skies — take extra care outdoors';
    if (main.includes('rain') || main.includes('drizzle')) return 'Wet weather — keep your umbrella close';
    if (main.includes('snow')) return 'Snowy conditions — wrap up warm';
    if (main.includes('cloud')) return 'Clouds are sharing the sky today';
    if (main.includes('clear') && temp >= 29) return 'Bright and hot — remember to hydrate';
    if (main.includes('clear')) return 'A clearer sky is making an appearance';
    if (main.includes('mist') || main.includes('fog') || main.includes('haze')) return 'Reduced visibility — take care on the roads';
    return 'Here is what is happening outside';
}

function setWeatherScene(main, description) {
    const scene = $('weather-scene');
    const symbol = $('weather-symbol');
    scene.className = 'weather-scene';
    let type = 'clear';
    let emoji = '☀️';

    if (main.includes('thunder')) { type = 'storm'; emoji = '⛈️'; }
    else if (main.includes('snow')) { type = 'snow'; emoji = '❄️'; }
    else if (main.includes('rain') || main.includes('drizzle')) { type = 'rain'; emoji = '🌧️'; }
    else if (main.includes('cloud')) { type = 'clouds'; emoji = '☁️'; }
    else if (main.includes('mist') || main.includes('fog') || main.includes('haze') || main.includes('smoke')) { type = 'clouds'; emoji = '🌫️'; }
    else if (description.includes('sun')) { type = 'sunny'; emoji = '🌤️'; }

    scene.classList.add(type);
    symbol.textContent = emoji;
    scene.setAttribute('aria-label', `${description} animated weather scene`);
}

function renderInsights(data, main) {
    const insights = [];
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const wind = data.wind?.speed || 0;
    const rain = data.rain?.['1h'] ?? data.rain?.['3h'] ?? 0;
    const visibility = data.visibility ?? 10000;

    if (main.includes('thunder')) {
        insights.push(['⛈️', 'Thunderstorm caution', 'Postpone exposed outdoor activities. If thunder is audible, move indoors and stay away from open areas.']);
        insights.push(['🚗', 'Take extra care travelling', 'Heavy showers and sudden gusts can make driving difficult. Slow down and leave extra space.']);
    } else if (main.includes('rain') || main.includes('drizzle') || rain > 0) {
        insights.push(['☔', 'Rain in the area', 'Carry an umbrella or raincoat. Protect electronics and allow a little extra time for your journey.']);
        insights.push(['🚗', 'Wet-road reminder', 'Drive gently, increase your following distance and avoid sudden braking. Watch for slippery surfaces.']);
    } else if (main.includes('snow')) {
        insights.push(['🧣', 'Keep warm', 'Layer up before heading outside and wear footwear with a good grip.']);
        insights.push(['🚗', 'Travel carefully', 'Check local road conditions and allow extra stopping distance where surfaces are slippery.']);
    } else if (main.includes('mist') || main.includes('fog') || main.includes('haze')) {
        insights.push(['👀', 'Visibility may be reduced', 'Give yourself more time on the road. Use appropriate lights and keep a safe distance.']);
    } else if (temp >= 30) {
        insights.push(['🥤', 'Hot-weather reminder', 'Drink water regularly, seek shade during the hottest part of the day and take breaks outdoors.']);
        insights.push(['🧴', 'Protect yourself from the sun', 'Consider sunscreen, a hat and lightweight clothing if you will be outside.']);
    } else if (temp <= 12) {
        insights.push(['🧥', 'A cooler day', 'A warm layer may make your morning or evening more comfortable.']);
    } else {
        insights.push(['🌿', 'A chance to get outside', 'Conditions look relatively comfortable for a walk or everyday outdoor plans. Check again before longer trips.']);
    }

    if (wind >= 10) insights.push(['💨', 'Breezy conditions', 'Secure loose outdoor items and take care around exposed areas or tall trees.']);
    if (humidity >= 80) insights.push(['💧', 'High humidity', 'It may feel muggy. Take breaks if you are active outdoors and keep water nearby.']);
    if (visibility < 5000 && !main.includes('mist') && !main.includes('fog')) insights.push(['🚘', 'Check visibility', 'Visibility is lower than usual. Be alert and give other road users extra space.']);

    $('insights-list').innerHTML = insights.slice(0, 4).map(([icon, title, text]) => `
        <article class="insight-item"><span class="insight-icon" aria-hidden="true">${icon}</span><div><strong>${title}</strong><p>${text}</p></div></article>
    `).join('');
}

function renderForecast(forecast) {
    const hourly = $('hourly-forecast');
    const daily = $('daily-forecast');
    if (!forecast?.list?.length) {
        hourly.innerHTML = '<p class="empty-history">Hourly forecast is temporarily unavailable.</p>';
        daily.innerHTML = '<p class="empty-history">The 5-day forecast is temporarily unavailable.</p>';
        return;
    }

    hourly.innerHTML = forecast.list.slice(0, 8).map(item => {
        const time = new Date(item.dt * 1000);
        const label = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).format(time);
        const icon = weatherEmoji(item.weather?.[0]?.main);
        return `<article class="hour-card"><span>${label}</span><span class="hour-icon">${icon}</span><strong class="hour-temp">${Math.round(item.main.temp)}°</strong></article>`;
    }).join('');

    const days = new Map();
    forecast.list.forEach(item => {
        const date = item.dt_txt.slice(0, 10);
        if (!days.has(date)) days.set(date, []);
        days.get(date).push(item);
    });
    daily.innerHTML = Array.from(days.entries()).slice(0, 5).map(([date, entries], index) => {
        const representative = entries.reduce((best, item) => Math.abs(new Date(item.dt_txt).getHours() - 12) < Math.abs(new Date(best.dt_txt).getHours() - 12) ? item : best, entries[0]);
        const high = Math.round(Math.max(...entries.map(item => item.main.temp_max)));
        const low = Math.round(Math.min(...entries.map(item => item.main.temp_min)));
        const day = index === 0 ? 'Today' : new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(`${date}T12:00:00`));
        return `<div class="day-row"><span class="day-name">${day}</span><span class="hour-icon">${weatherEmoji(representative.weather?.[0]?.main)}</span><span class="day-condition">${representative.weather?.[0]?.description || ''}</span><span class="day-temperatures">${high}° <span>${low}°</span></span></div>`;
    }).join('');
}

function weatherEmoji(main = '') {
    const value = main.toLowerCase();
    if (value.includes('thunder')) return '⛈️';
    if (value.includes('snow')) return '❄️';
    if (value.includes('rain') || value.includes('drizzle')) return '🌧️';
    if (value.includes('cloud')) return '☁️';
    if (value.includes('mist') || value.includes('fog') || value.includes('haze')) return '🌫️';
    return '☀️';
}

function saveSearchHistory(city) {
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== city.toLowerCase());
    searchHistory.unshift(city);
    searchHistory = searchHistory.slice(0, 5);
    try { localStorage.setItem('weatherHistory', JSON.stringify(searchHistory)); } catch (error) { console.warn('Could not save search history:', error); }
    renderHistory();
}

function renderHistory() {
    if (!searchHistory.length) {
        historyList.innerHTML = '<span class="empty-history">Your searched cities will appear here.</span>';
        return;
    }
    historyList.innerHTML = '';
    searchHistory.forEach(city => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'history-btn';
        button.dataset.city = city;
        button.textContent = city;
        historyList.appendChild(button);
    });
}

function showLoading(loading) {
    loadingIndicator.classList.toggle('hidden', !loading);
    if (loading) weatherDisplay.classList.add('hidden');
}

function showError(message) {
    errorDisplay.textContent = message;
    errorDisplay.classList.remove('hidden');
}

function clearStatusDisplays() {
    errorDisplay.classList.add('hidden');
    errorDisplay.textContent = '';
}

renderHistory();
