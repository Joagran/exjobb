const base_url = 'https://api.spotify.com/v1/search';
const auth_header = "Bearer BQAu2Z2cxvnc2L8eP4cDNj4CUwJpk4DkMRP35t4G2LuAmnOuAXpjIosWVx5hfhOC2GGjn7nNPKEe0UShsg54dbZfJQ0OuLRy6WtW4qk1xoIvYTcpIV690NmLQrS57wvbH_PUbgPl-0BC";

const headers = new Headers();
headers.append("Accept", "application/json");
headers.append("Authorization", auth_header);

const myOptions = {
    method: 'GET',
    headers: headers,
    mode: 'cors',
    cache: 'default'
};
let playUrl = "";
let title = "";
let artist = "";
let album = "";
let imageUrl = "";
const formElement = document.getElementById("searchForm");

formElement.addEventListener("submit", e => {
  document.getElementById('searchForm').style.width = "50%";

  var steps = jQuery(".step");

  jQuery.each( steps, function( i ) {
        if (!jQuery(steps[i]).hasClass('current') && !jQuery(steps[i]).hasClass('done')) {
          jQuery(steps[i]).addClass('current');
          jQuery(steps[i - 1]).removeClass('current').addClass('done');
          return false;
        }
      });
  const searchTitle = e.target.elements.search.value.split(' ').join('+');
  const searchType = e.target.elements.searchtype.value;

  if (searchType === "dateTime") {
    document.getElementById('scheduleFormWithoutWeather').style.display = "block";
    document.getElementById('scheduleForm').style.display = "none";
  } else {
    document.getElementById('scheduleForm').style.display = "block";
    document.getElementById('scheduleFormWithoutWeather').style.display = "none";
  }

  const search_url = `${base_url}?q=${searchTitle}&type=track`;
  console.log(searchTitle);
  const ul = document.getElementById('track');
/*
* progress bar
*/

/*
*fetch data from Spotify API
*/
  fetch(search_url, myOptions)
  .then(response => response.json()) // Access and return response's JSON content
  .then(json => {
    console.log(json);
    title = json.tracks.items[0].name;
    playUrl = json.tracks.items[0].external_urls.spotify;
    artist = json.tracks.items[0].artists[0].name;
    album = json.tracks.items[0].album.name;
    imageUrl = json.tracks.items[0].album.images[1].url;

    document.getElementById('title').textContent = `Title: ${title}`;
    document.getElementById('artist').textContent = `Artist: ${artist}`;
    document.getElementById('album').textContent = `Album: ${album}`;
    document.getElementById('image').src = imageUrl;
    //document.getElementById('timeSelector').input.valueAsDate = Date.now();
    document.getElementById("result").style.display = "inline-block";
    document.getElementById("scheduleTrack").textContent = `${artist}: ${title}`;
    document.getElementById("scheduleTrackWithoutWeather").textContent = `${artist}: ${title}`;
  })
  .catch(err => {
    title = 'Not found';
    artist = 'Not found';
    album = 'Not found';
  });
  e.preventDefault();
});

const schedulePlayback = document.getElementById("schedulePlaybackForm");
const schedulePlaybackWithoutWeather = document.getElementById("schedulePlaybackWithoutWeatherForm");
/*
* Progressbar field for condition concerning date, time and weather
*/

schedulePlayback.addEventListener("submit", e => {
  var steps = jQuery(".step");

  jQuery.each( steps, function( i ) {
        if (!jQuery(steps[i]).hasClass('current') && !jQuery(steps[i]).hasClass('done')) {
          jQuery(steps[i]).addClass('current');
          jQuery(steps[i - 1]).removeClass('current').addClass('done');
          return false;
        }
      });
  document.getElementById("addedTasks").style.display = 'inline-block';
  const date = new Date(e.target.elements.timeSelector.value);
  const weather = e.target.elements.weather.value;
  const now = Date.now();
  console.log(date - now);

  const addedTasks = document.getElementById('addedTasks');
  const task = document.createElement('p');
  task.innerHTML = `The song <span id="trackTitle">${title}</span> will play on ${date.toDateString()} at ${date.toLocaleTimeString()} if the weather is ${weather}`;
  addedTasks.appendChild(task);

  setTimeout(function() {
    navigator.geolocation.getCurrentPosition(function(position) {
      getWeather(position.coords.latitude, position.coords.longitude, weather);
    });
  }, date - now);
  e.preventDefault();
});

/*
* Progressbar field for condition concerning date and time
*/
schedulePlaybackWithoutWeather.addEventListener("submit", e => {
  var steps = jQuery(".step");

  jQuery.each( steps, function( i ) {
        if (!jQuery(steps[i]).hasClass('current') && !jQuery(steps[i]).hasClass('done')) {
          jQuery(steps[i]).addClass('current');
          jQuery(steps[i - 1]).removeClass('current').addClass('done');
          return false;
        }
      });
  document.getElementById("addedTasks").style.display = 'inline-block';
  const date = new Date(e.target.elements.timeSelector.value);
  const now = Date.now();
  console.log(date - now);

  const addedTasks = document.getElementById('addedTasks');
  const task = document.createElement('p');
  task.innerHTML = `The song <span id="trackTitleWithoutWeather">${title}</span> will play on ${date.toDateString()} at ${date.toLocaleTimeString()} <img src="media/002-edit.png" style="width:11px"/> <img src="media/001-error.png" style="width:11px"/>`;
  addedTasks.appendChild(task);

  setTimeout(function() {
    window.open(playUrl, '_blank');
  }, date - now);
  e.preventDefault();
});
/*
* Validation-field messages in the search-for-a-track field
*/
$('#searchForm input[type=text]').on('change invalid', function() {
    var textfield = $(this).get(0);

    // 'setCustomValidity not only sets the message, but also marks
    // the field as invalid. In order to see whether the field really is
    // invalid, we have to remove the message first
    textfield.setCustomValidity('');

    if (!textfield.validity.valid) {
      textfield.setCustomValidity('The field is empty. Please fill it with a track name.');
    }
});
/*
* Validation-field messages in the schedueling field without weather
*/
$('#schedulePlaybackWithoutWeatherForm input[type=datetime-local]').on('change invalid', function() {
    var textfield = $(this).get(0);

    textfield.setCustomValidity('');

    if (!textfield.validity.valid) {
      textfield.setCustomValidity('Please fill in a valid date and time');
    }
});
/*
* Validation-field messages in the schedueling field with weather
*/
$('#schedulePlaybackForm input[type=datetime-local]').on('change invalid', function() {
    var textfield = $(this).get(0);

    textfield.setCustomValidity('');

    if (!textfield.validity.valid) {
      textfield.setCustomValidity('Please fill in a valid date, time and type of weather');
    }
});

const getWeather = (latitude, longitude, desiredWeather) => {
  const api_key = 'aedd3808ee38cc68ee723e6aacf85033';
  const weather_url = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&APPID=${api_key}`;

  fetch(weather_url)
  .then(response => response.json())
  .then(json => {
    if (json.weather["0"].main === desiredWeather) {
      window.open(playUrl, '_blank');
    }
    console.log(json);
    console.log(json.weather["0"].main); // Clouds, Clear, Snow, Rain, Thunderstorm
  });
};
