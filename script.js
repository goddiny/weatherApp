fetch('https://api.open-meteo.com/v1/forecast?latitude=51.672&longitude=39.1843&hourly=temperature_2m,relativehumidity_2m,precipitation,cloudcover')
//температура, относительная влажность, осадки, облачность
	.then(function (resp) {
		return resp.json();
	})
	.then(function (data) {
		console.log(data);

		const date = new Date;
		const month = date.getMonth() < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
		const day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
		const hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
		const minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
		const currentTime = `${date.getFullYear()}-${month}-${day}T${hours}:00`;
		const timeArr = data.hourly.time;


		let currentArrayPosition = 0;
		for (let time of timeArr) {
			if (time === currentTime) {
				currentArrayPosition = timeArr.indexOf(time);
			}
		}

		document.querySelector('.time').innerHTML = `${hours}:${minutes}`;
		document.querySelector('.temperature').innerHTML = `${data.hourly.temperature_2m[currentArrayPosition]}${data.hourly_units.temperature_2m}`;
		document.querySelector('.humidity').innerHTML = `${data.hourly.relativehumidity_2m[currentArrayPosition]}${data.hourly_units.relativehumidity_2m}`;
		document.querySelector('.cloudcover').innerHTML = `${data.hourly.cloudcover[currentArrayPosition]}${data.hourly_units.cloudcover}`;
		document.querySelector('.precipitation').innerHTML = `${data.hourly.precipitation[currentArrayPosition]}${data.hourly_units.precipitation}`;
		

	})
	.catch(function (){})
