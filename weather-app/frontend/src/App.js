import { useState } from "react";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);

  const fetchWeather = async () => {
    try {
      const res = await fetch(`http://localhost:5000/weather/${city}`);
      const data = await res.json();
      setWeather(data);
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  return (
  <div style={{ textAlign: "center", fontFamily: "Arial, sans-serif", marginTop: "50px" }}>
    <h1 style={{ fontSize: "2.5rem" }}>🌤 Weather App</h1>

    <input
      type="text"
      placeholder="Enter city..."
      value={city}
      onChange={(e) => setCity(e.target.value)}
      style={{ padding: "10px", fontSize: "1rem", width: "200px", marginRight: "10px" }}
    />
    <button
      onClick={fetchWeather}
      style={{ padding: "10px 20px", fontSize: "1rem", cursor: "pointer" }}
    >
      Get Weather
    </button>

    {weather && (
      <div style={{
        marginTop: "30px",
        display: "inline-block",
        textAlign: "left",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
        backgroundColor: "#f0f8ff"
      }}>
        <h2 style={{ textAlign: "center" }}>{weather.name}</h2>
        <p>🌡 Temperature: {weather.main.temp} °C</p>
        <p>☁ Condition: {weather.weather[0].description}</p>
        <p>💧 Humidity: {weather.main.humidity}%</p>
        <p>🌬 Wind Speed: {weather.wind.speed} m/s</p>
      </div>
    )}
  </div>
)

}
export default App;
