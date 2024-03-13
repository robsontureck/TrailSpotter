const express = require('express');
const axios = require('axios');
const ngeohash = require('ngeohash');
const router = express.Router();

const TICKETMASTER_API_KEY = 'Tf8PvAWxGnanuzC4mNHZUWytHoAusU4a'; // Replace with your Ticketmaster API key

router.get('/:latitude/:longitude/:date', async (req, res) => {
    const { latitude, longitude, date } = req.params;
    console.log(date);

    // Calculate geoHash
    const geoHash = ngeohash.encode(parseFloat(latitude), parseFloat(longitude));

    try {
        const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', {
            params: {
                geoPoint: geoHash,
                startDateTime: `${date}T00:00:00Z`,
                endDateTime: `${date}T23:59:59Z`,
                apikey: TICKETMASTER_API_KEY
            }
        });

        // Process and send the events data (or directly send the entire response)
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from Ticketmaster:', error.message);
        res.status(500).send('Failed to fetch events.');
    }
});

module.exports = router;
