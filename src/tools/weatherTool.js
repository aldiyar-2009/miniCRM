const https = require("https");

class WeatherTool {
  async execute(params) {
    const { city, units = "celsius" } = params || {};

    if (!city || String(city).trim().length === 0) {
      return { success: false, error: "Город не указан" };
    }

    const apiKey = process.env.WEATHERAPI_KEY;
    if (!apiKey) {
      console.warn("WEATHERAPI_KEY не задан — возвращаю заглушку");
    }

    try {
      const location = await this.geocodeCity(String(city).trim());
      if (!location) {
        console.warn(
          `geocodeCity: не найдено место для '${city}', возвращаю заглушку`,
        );
      }

      const url = `https://api.weather.yandex.ru/v2/forecast?lat=${location.lat}&lon=${location.lon}`;
      const result = await this.fetchJson(url, {
        headers: {
          "X-Yandex-Weather-Key": apiKey,
        },
      });

      if (!result || !result.fact) {
        console.warn(
          "Yandex Weather вернул неправильный ответ, возвращаю заглушку",
        );
      }

      const fact = result.fact;
      const condition = fact.condition || "";
      const temp =
        units === "fahrenheit"
          ? this.celsiusToFahrenheit(fact.temp)
          : fact.temp;

      return {
        success: true,
        data: {
          city: location.name,
          lat: Number(location.lat),
          lon: Number(location.lon),
          temperature: temp,
          units: units === "fahrenheit" ? "F" : "C",
          condition,
          humidity: fact.humidity,
          raw: result,
        },
      };
    } catch (error) {}
  }

  stubWeather() {
    return {
      success: true,
      data: {
        city: "Астана",
        lat: 51.1694,
        lon: 71.4491,
        temperature: 20,
        units: "C",
        condition: "Ясно (заглушка)",
        humidity: null,
        stub: true,
      },
    };
  }

  geocodeCity(city) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    return this.fetchJson(url).then((data) => {
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }
      const place = data[0];
      return {
        name: place.display_name || city,
        lat: place.lat,
        lon: place.lon,
      };
    });
  }

  fetchJson(url, options = {}) {
    return new Promise((resolve, reject) => {
      const req = https.request(url, options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            return reject(
              new Error(
                `Weather API error ${res.statusCode}: ${data.substring(0, 200)}`,
              ),
            );
          }
          try {
            resolve(JSON.parse(data));
          } catch (err) {
            reject(
              new Error(
                `Невалидный JSON из Weather API: ${data.substring(0, 200)}`,
              ),
            );
          }
        });
      });
      req.on("error", (err) => reject(err));
      req.end();
    });
  }

  celsiusToFahrenheit(value) {
    return Math.round((value * 9) / 5 + 32);
  }
}

module.exports = new WeatherTool();
