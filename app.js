const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const card = document.querySelector(".card");

const apiKey = "ae62abc3e12453b9cfdba9073707eab5";

// --- Weather background themes ---
const weatherThemes = {
  Clear:        "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  Clouds:       "linear-gradient(135deg, #8e9eab 0%, #c0c8cf 100%)",
  Rain:         "linear-gradient(135deg, #4b6cb7 0%, #182848 100%)",
  Drizzle:      "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
  Thunderstorm: "linear-gradient(135deg, #1f1c2c 0%, #928dab 100%)",
  Snow:         "linear-gradient(135deg, #d7e8f5 0%, #f0f4f8 100%)",
  Mist:         "linear-gradient(135deg, #bdc3c7 0%, #d9dfe3 100%)",
  Fog:          "linear-gradient(135deg, #bdc3c7 0%, #d9dfe3 100%)",
  Haze:         "linear-gradient(135deg, #f3904f 0%, #7c7575 100%)",
  Smoke:        "linear-gradient(135deg, #6b6b6b 0%, #a0a0a0 100%)",
  Dust:         "linear-gradient(135deg, #c8a96e 0%, #e8d5a3 100%)",
};

function applyTheme(condition) {
  const bg = weatherThemes[condition] || "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
  document.body.style.background = bg;
  document.body.style.transition = "background 0.8s ease";
  document.body.style.minHeight = "100vh";
}

// --- Search history (localStorage) ---
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem("wx_history") || "[]");
  } catch {
    return [];
  }
}

function saveToHistory(city) {
  // Remove duplicate (case-insensitive), add to front, keep max 5
  let history = loadHistory().filter(
    (c) => c.toLowerCase() !== city.toLowerCase()
  );
  history.unshift(city);
  history = history.slice(0, 5);
  try {
    localStorage.setItem("wx_history", JSON.stringify(history));
  } catch {}
  renderHistory();
}

function clearHistory() {
  try {
    localStorage.removeItem("wx_history");
  } catch {}
  renderHistory();
}

function renderHistory() {
  const history = loadHistory();
  let container = document.getElementById("search-history");

  // Create the container if it doesn't exist in the HTML
  if (!container) {
    container = document.createElement("div");
    container.id = "search-history";
    searchBtn.parentElement.insertAdjacentElement("afterend", container);
  }

  if (!history.length) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML =
    history
      .map(
        (city) =>
          `<button class="history-chip" onclick="getWeatherData('${city.replace(/'/g, "\\'")}')">
          🕐 ${city}
        </button>`
      )
      .join("") +
    `<button class="history-chip history-chip--clear" onclick="clearHistory()">✕ Clear</button>`;
}

// --- Main weather fetch ---
async function getWeatherData(city) {
  if (!city) return;

  card.innerHTML = `<h2>Loading...</h2>`;
  searchBtn.disabled = true;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("City not found");

    const data = await response.json();
    const icon = data.weather[0].icon;

    // Apply background theme and save to history
    applyTheme(data.weather[0].main);
    saveToHistory(data.name); // use official name from API, not raw input

    card.innerHTML = `
      <img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${data.weather[0].description}" />
      <h2 class="temperature">${Math.round(data.main.temp)}<small>°c</small></h2>
      <p class="city-name">${data.name}, ${data.sys.country}</p>
      <p class="condition">${data.weather[0].main}</p>
      <p class="overcast">${data.weather[0].description}</p>

      <div class="readings">
        <div class="cols">
          <h3>${(data.wind.speed * 3.6).toFixed(1)} km/h</h3>
          <p>Wind Flow</p>
        </div>
        <div class="cols">
          <h3>${data.main.pressure}</h3>
          <p>Pressure</p>
        </div>
        <div class="cols">
          <h3>${data.main.humidity}%</h3>
          <p>Humidity</p>
        </div>
      </div>
    `;
  } catch (error) {
    card.innerHTML = `<h2>${error.message}</h2>`;
  } finally {
    // Always re-enable the button whether fetch succeeded or failed
    searchBtn.disabled = false;
  }
}

function cityData() {
  const city = searchInput.value.trim();
  if (!city) {
    searchInput.focus(); // less jarring than alert()
    return;
  }
  getWeatherData(city);
  searchInput.value = "";
}

searchBtn.addEventListener("click", () => {
  cityData();
});

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    cityData();
  }
});

// Render history chips on page load
renderHistory();