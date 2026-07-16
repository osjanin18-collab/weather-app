// OpenWeatherMap API Key (free tier)
// Регистрируйтесь на https://openweathermap.org/api для получения API ключа
const API_KEY = 'YOUR_API_KEY_HERE'; // Замените на ваш API ключ

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherContainer = document.getElementById('weatherContainer');
const errorMessage = document.getElementById('errorMessage');

// Event listeners
searchBtn.addEventListener('click', () => searchWeather());
locationBtn.addEventListener('click', () => getLocationWeather());
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWeather();
});

// Поиск погоды по названию города
async function searchWeather() {
    const city = searchInput.value.trim();
    
    if (!city) {
        showError('Пожалуйста, введите название города');
        return;
    }

    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('⚠️ Пожалуйста, установите API ключ OpenWeatherMap в script.js');
        return;
    }

    try {
        clearError();
        const weatherData = await fetchWeatherByCity(city);
        displayWeather(weatherData);
    } catch (error) {
        showError('Город не найден. Пожалуйста, проверьте название.');
        console.error(error);
    }
}

// Получить погоду по геолокации
async function getLocationWeather() {
    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('⚠️ Пожалуйста, установите API ключ OpenWeatherMap в script.js');
        return;
    }

    if (!navigator.geolocation) {
        showError('Геолокация не поддерживается вашим браузером');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                clearError();
                const { latitude, longitude } = position.coords;
                const weatherData = await fetchWeatherByCoords(latitude, longitude);
                displayWeather(weatherData);
            } catch (error) {
                showError('Ошибка при получении погоды');
                console.error(error);
            }
        },
        (error) => {
            showError('Не удалось получить ваше местоположение');
            console.error(error);
        }
    );
}

// Получить данные погоды по названию города
async function fetchWeatherByCity(city) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&lang=ru&units=metric`
    );

    if (!response.ok) {
        throw new Error('City not found');
    }

    return await response.json();
}

// Получить данные погоды по координатам
async function fetchWeatherByCoords(lat, lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=ru&units=metric`
    );

    if (!response.ok) {
        throw new Error('Weather data not found');
    }

    return await response.json();
}

// Отобразить информацию о погоде
function displayWeather(data) {
    const current = data.list[0];
    const city = data.city.name;
    const country = data.city.country;

    // Текущая погода
    document.getElementById('cityName').textContent = `${city}, ${country}`;
    document.getElementById('date').textContent = new Date().toLocaleDateString('ru-RU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const temp = Math.round(current.main.temp);
    document.getElementById('temperature').textContent = `${temp}°C`;

    const description = current.weather[0].description;
    document.getElementById('description').textContent = description;

    const iconCode = current.weather[0].icon;
    document.getElementById('weatherIcon').src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

    // Детали
    document.getElementById('humidity').textContent = `${current.main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${current.wind.speed} м/с`;
    document.getElementById('pressure').textContent = `${current.main.pressure} гПа`;
    document.getElementById('visibility').textContent = `${(current.visibility / 1000).toFixed(1)} км`;

    // Прогноз на 5 дней (один раз в день)
    displayForecast(data.list);

    // Показать контейнер с погодой
    weatherContainer.classList.remove('hidden');
    searchInput.value = '';
}

// Отобразить прогноз на 5 дней
function displayForecast(weatherList) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';

    // Группируем данные по дням (берём один прогноз в день)
    const dailyForecasts = [];
    const seenDates = new Set();

    for (let i = 0; i < weatherList.length; i++) {
        const forecast = weatherList[i];
        const date = new Date(forecast.dt * 1000);
        const dateStr = date.toLocaleDateString('ru-RU');

        if (!seenDates.has(dateStr) && dailyForecasts.length < 5) {
            seenDates.add(dateStr);
            dailyForecasts.push(forecast);
        }
    }

    // Создаём карточки прогноза
    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short', month: 'short', day: 'numeric' });
        const temp = Math.round(forecast.main.temp);
        const icon = forecast.weather[0].icon;
        const description = forecast.weather[0].description;

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="Погода" class="forecast-icon">
            <div class="forecast-temp">${temp}°C</div>
            <div class="forecast-desc">${description}</div>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}

// Показать ошибку
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

// Очистить ошибку
function clearError() {
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
}