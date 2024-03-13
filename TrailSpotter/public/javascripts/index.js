document.addEventListener("DOMContentLoaded", function () {
    const fetchButton = document.getElementById('fetchButton');
    const cityNameInput = document.getElementById('cityName');

    fetchButton.addEventListener('click', function () {
        //const cityName = document.getElementById('cityName').value;
        const cityName = cityNameInput.value;
        if (cityName.trim() === '') {
            // Display an alert to enter a city
            alert('Please enter a city name.');
            throw new Error('Empty input');
        } else {
            fetchCoordinates(cityName);
        }
    });
    // Listen for the "keypress" event on the input element
    cityNameInput.addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            // Prevent the default form submission behavior
            event.preventDefault();
            const cityName = cityNameInput.value;
            if (cityName.trim() !== '') {
                fetchCoordinates(cityName);
            }
        }
    });
});

function fetchCoordinates(cityName) {
    console.log(cityName);
    // Fetch GEOAPIFY route on server
    fetch(`/geocode/${cityName}`)
        //Check the response to display alert to user without leaving the page
        .then(response => {
            if (!response.ok) {
                if (response.status === 500) {
                    alert('An internal server error occurred. Please try again later.');
                } else {
                    alert('Location not found, please enter a valid city name.');
                }
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            console.log("Received data:", data);
            fetchTrailData(data.lat, data.lon, data.city, data.state, data.country);
        })
        .catch(err => {
            console.error(err);
            document.getElementById('result').innerHTML = 'Failed to fetch coordinates.';
        });
}

function fetchTrailData(lat, lon, city, state, country) {
    console.log("Received data:", lat, lon);
    window.location.href = `/trails/${lat}/${lon}/${city}/${state}/${country}`;
}

document.addEventListener("DOMContentLoaded", function () {
    const fetchGooglePlacesButtons = document.querySelectorAll('.fetch-google-places-btn');
    fetchGooglePlacesButtons.forEach(button => {
        button.addEventListener('click', function () {
            fetchGooglePlaces(button)
        });
    });
});

function fetchGooglePlaces(button) {
    const lat = button.getAttribute('data-lat');
    const lon = button.getAttribute('data-lon');
    console.log('Latitude:', lat);
    console.log('Longitude:', lon);
    if (lat && lon) {
        const apiUrl = `/places&events/${lat}/${lon}`;
        window.location.href = apiUrl;

    }
}






