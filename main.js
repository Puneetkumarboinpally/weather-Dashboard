const searchInput = document.querySelector(".search-input");
const searchBtn = document.querySelector(".search-btn");
const card = document.querySelector(".card");

const apiKey = "ae62abc3e12453b9cfdba9073707eab5";

async function getWeatherData(city) {
  if (!city) return;
  card.innerHTML = `<h2>Loading...</h2>`;
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("City not found");
    }
    const data = await response.json();
    console.log(data);

    const icon = data.weather[0].icon;

    card.innerHTML = `
     <img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="weather icon" />
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
      </div>
`;
  } catch (error) {
    card.innerHTML = `<h2>${error.message}</h2>`;
  }
}

searchBtn.addEventListener("click", () => {
  const city = searchInput.value.trim();
  if (!city) {
    alert("Please enter a city");
    return;
  }
  getWeatherData(city);
  searchInput.value = "";
});
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const city = searchInput.value.trim();

    if (!city) {
      alert("Please enter a city");
      return;
    }
    getWeatherData(city);
    searchInput.value = "";
  }
});
getWeatherData();
