const express = require('express');
const axios = require('axios');
const ngeohash = require('ngeohash');
const router = express.Router();

const GOOGLE_API_KEY = process.env.API_KEY3;
const TICKETMASTER_API_KEY = process.env.API_KEY4;

router.get('/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const date = `${year}-${month}-${day}`;

    const geoHash = ngeohash.encode(parseFloat(lat), parseFloat(lon));

    // Initialize variables to store API responses
    let googleResponse, ticketmasterResponse;

    try {
        // Make the Google Places API request
        googleResponse = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
            params: {
                location: `${lat},${lon}`,
                radius: 10000,
                key: GOOGLE_API_KEY,
                fields: 'name,formatted_address,photos'
            }
        });

        // Make the Ticketmaster API request
        ticketmasterResponse = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
            params: {
                geoPoint: geoHash,
                startDateTime: `${date}T00:00:00Z`,
                endDateTime: `${date}T23:59:59Z`,
                apikey: TICKETMASTER_API_KEY
            }
        });

        // Check if both API calls succeeded
        if (googleResponse.status === 200 && ticketmasterResponse.status === 200) {
            // Both API calls succeeded
            const places = getPlacesPhotos(googleResponse);

            const responseData = {
                places: places,
                events: ticketmasterResponse.data._embedded.events,
            };

            // Render the page with data from the successful API calls
            res.render('results', { responseData });
        } else {
            // Handle the case where one or both API calls failed
            if (googleResponse.status !== 200) {
                const responseData = {
                    places: [],
                    events: ticketmasterResponse.data._embedded.events,
                };
                const errorMessagePlaces = 'Failed to fetch data from Places API.';
                console.error('Error in Google Places API:', googleResponse.statusText);
                res.render('results', { responseData, errorMessagePlaces });
            }
            if (ticketmasterResponse.status !== 200) {
                const places = getPlacesPhotos(googleResponse);
                const responseData = {
                    places: places,
                    events: [],
                };
                const errorMessageEvents = 'Failed to fetch data from TickerMaster API.';
                console.error('Error in Ticketmaster API:', ticketmasterResponse.statusText);
                res.render('results', { responseData, errorMessageEvents });
            }
            //res.status(500).send('Failed to fetch data.');
        }
    } catch (error) {
        console.error('Error in API requests:', error.message);
        res.status(500).send('Failed to fetch data.');
    }
});

function getPlacesPhotos(googleResponse) {
    const places = googleResponse.data.results.map(place => {
        let photoUrl = null;

        if (place.photos && place.photos.length > 0) {
            const photoReference = place.photos[0].photo_reference;
            photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`;
        }

        return {
            name: place.name,
            operatingHours: place.opening_hours,
            rate: place.rating,
            userRating: place.user_ratings_total,
            type: place.types,
            address: place.vicinity,
            photoUrl: photoUrl
        };
    });

    return places;
};


module.exports = router;
