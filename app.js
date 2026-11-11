// State Arrays
let searchHistory = JSON.parse(localStorage.getItem('weatherHistory')) || [];

// DOM Bindings
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const loadingIndicator = document.getElementById('loading-indicator');
const errorDisplay = document.getElementById('error-display');
const weatherDisplay = document.getElementById('weather-display');
const historyList = document.getElementById('history-list');

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    if (city) fetchWeatherData(city);
});

// Event delegation pattern for search history links
historyList.addEventListener('click', (e) => {
    if (e.target.classList.contains('history-btn')) {
        fetchWeatherData(e.target.textContent);
    }
});

// Central async data handling logic pipeline matching marker checks
async function fetchWeatherData(city) {
    showLoading(true);
    clearStatusDisplays();

    try {
        if (!window.CONFIG || !window.CONFIG.WEATHER_API_KEY) {
            throw new Error("API Key initialization config missing or unresolved.");
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${window.CONFIG.WEATHER_API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found. Please check your spelling.");
            }

            if (response.status === 401) {
                throw new Error("Invalid API key. Check your OpenWeatherMap API key.");
            }

            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        updateUI(data);
        saveSearchHistory(data.name);

    } catch (error) {
        showError(
            navigator.onLine
                ? error.message
                : "Network disconnected. Please check your internet connection."
        );
    } finally {
        showLoading(false);
    }
}

function updateUI(data) {
    document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('weather-icon').src = `https://openweathermap.org{data.weather[0].icon}@2x.png`;
    document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.getElementById('description').textContent = data.weather[0].description;
    document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind').textContent = `${data.wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    weatherDisplay.classList.remove('hidden');

    // Get the weather icon code from the API
const iconCode = data.weather[0].icon;

// Display the corresponding weather icon
const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

const weatherIcon = document.getElementById("weather-icon");

weatherIcon.src = iconUrl;
weatherIcon.alt = data.weather[0].description;
}

function saveSearchHistory(cityName) {
    // Keep history clean of exact duplicates
    searchHistory = searchHistory.filter(item => item.toLowerCase() !== cityName.toLowerCase());
    searchHistory.unshift(cityName);
    
    // Strict storage cap limit rule constraint matching (last 5 records)
    if (searchHistory.length > 5) searchHistory.pop();
    
    localStorage.setItem('weatherHistory', JSON.stringify(searchHistory));
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = '';
    searchHistory.forEach(city => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'history-btn';
        btn.textContent = city;
        historyList.appendChild(btn);
    });
}

function showLoading(isLoading) {
    loadingIndicator.classList.toggle('hidden', !isLoading);
    if (isLoading) weatherDisplay.classList.add('hidden');
}

function showError(msg) {
    errorDisplay.textContent = msg;
    errorDisplay.classList.remove('hidden');
}

function clearStatusDisplays() {
    errorDisplay.classList.add('hidden');
    errorDisplay.textContent = '';
}

// Initializing application draw vectors on load
renderHistory();
