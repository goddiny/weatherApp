//*Константы
const API_ENDPOINT = "https://api.open-meteo.com/v1";
const HOURLY_SETTINGS =
  "temperature_2m,relativehumidity_2m,precipitation,cloudcover_mid,weathercode,windspeed_10m&windspeed_unit=ms";
const CITY_LATITUDE = "51.672";
const CITY_LONGITUDE = "39.1843";

//*Возвращает форматированное время под поиск в JSON
const getCurrentFormatedTime = () => {
  const date = new Date();
  const month = `${date.getMonth() < 10 ? "0" : ""}${date.getMonth() + 1}`;
  const day = `${date.getDate() < 10 ? "0" : ""}${date.getDate()}`;
  const hours = `${date.getHours() < 10 ? "0" : ""}${date.getHours()}`;

  return `${date.getFullYear()}-${month}-${day}T${hours}:00`;
};

//*Получает текущее время
const getCurrentTime = () => {
  const date = new Date();
  const hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
  const minutes =
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();

  return `${hours}:${minutes}`;
};

//*Средняя "дельта" за каждую секунду между данными о погоде за текущий час и за следующий
const getAverageDelta = (data, idx, precision) => {
  const currentSecond = getCurrentSecond();
  return (
    data[idx] +
    Number(
      (
        (Number(Math.abs(data[idx] - data[idx + 1]).toFixed(precision)) /
          3600) *
        currentSecond
      ).toFixed(precision)
    )
  ).toFixed(precision);
};

//*Получает текущую секунду текущего часа
const getCurrentSecond = () => {
  const date = new Date();
  const minutes = date.getMinutes();
  return minutes * 60 + date.getSeconds();
};

//*Получает имя для картинки по коду погоды
const getWeatherName = (data, idx) => {
  let weatherName;
  //ясно
  if (data.hourly.weathercode[idx] === 0) {
    weatherName = "sunny";
  }
  //почти ясно
  else if (data.hourly.weathercode[idx] === 1 || 2 || 3) {
    weatherName = "cloudly";
  }
  //туман
  else if (
    data.hourly.weathercode[idx] === 45 ||
    48 ||
    51 ||
    53 ||
    55 ||
    56 ||
    57
  ) {
    weatherName = "fog";
  }
  //дождь
  else if (data.hourly.weathercode[idx] === 61 || 63 || 65 || 66 || 67) {
    weatherName = "rain";
  }
  //снег
  else if (data.hourly.weathercode[idx] === 71 || 73 || 75 || 77 || 85 || 86) {
    weatherName = "snow";
  }
  //ливни
  else if (data.hourly.weathercode[idx] === 80 || 81 || 82) {
    weatherName = "shower";
  } else {
    weatherName = "err";
  }

  return weatherName;
};

//*Добавляет ссылку на картику по имени погоды в HTML
const renderWeatherPic = (name) => {
  const weatherCodeLink = `images/weathercode/${name}.gif`;
  document.querySelector(".weathercode").src = weatherCodeLink;
};

//*Получает данные из даты и сопоставляет их с показателем
const getWeatherData = (data, idx) => {
  return [
    {
      key: "temperature",
      value: `${getAverageDelta(data.hourly.temperature_2m, idx, 1)}${
        data.hourly_units.temperature_2m
      }`,
    },
    {
      key: "windspeed",
      value: `${getAverageDelta(data.hourly.windspeed_10m, idx, 1)}${
        data.hourly_units.windspeed_10m
      }`,
    },
    {
      key: "humidity",
      value: `${getAverageDelta(data.hourly.relativehumidity_2m, idx, 1)}${
        data.hourly_units.relativehumidity_2m
      }`,
    },
    {
      key: "cloudcover",
      value: `${getAverageDelta(data.hourly.cloudcover_mid, idx, 1)}${
        data.hourly_units.cloudcover_mid
      }`,
    },
    {
      key: "precipitation",
      value: `${getAverageDelta(data.hourly.precipitation, idx, 0)}${
        data.hourly_units.precipitation
      }`,
    },
  ];
};

//*Рендерит полученные данные в HTML файл
const renderWeatherData = (data) => {
  document.querySelector(".time").innerHTML = getCurrentTime();
  data.forEach(({ key, value }) => {
    document.querySelector(`.${key}`).innerHTML = value;
  });
};

//*Тело приложения, получает дату по ссылке, выполняет все функции выше
const getMeteoData = async (latitude, longitude) => {
  try {
    const resp = await fetch(
      `${API_ENDPOINT}/forecast?latitude=${latitude}&longitude=${longitude}&hourly=${HOURLY_SETTINGS}`
    );
    const data = await resp.json();
    console.log(data);
    const currentTime = getCurrentFormatedTime();
    const time = currentTime.split("T")[1];
    const timeArr = data.hourly.time;
    const timeIndex = timeArr.indexOf(currentTime);
    const weatherData = getWeatherData(data, timeIndex);
    const weatherName = getWeatherName(data, timeIndex);

    renderWeatherPic(weatherName);
    renderWeatherData(weatherData, time);
  } catch (err) {
    return console.error(err);
  }
};

getMeteoData(CITY_LATITUDE, CITY_LONGITUDE);

//*Кнопка обновления
const refreshButton = document.querySelector(".refresh");
refreshButton.addEventListener("click", () => {
  getMeteoData(CITY_LATITUDE, CITY_LONGITUDE);
});
