const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const router = express.Router();

const MY_TRAILS_API_KEY = process.env.API_KEY2;

router.get('/:lat/:lon/:city/:state/:country', async (req, res) => {
    const { lat, lon, city, state, country } = req.params;

    try {
        const response = await axios.get('https://mytrails.com.au/service/location.php', {
            params: {
                apikey: MY_TRAILS_API_KEY,
                latitude: lat,
                longitude: lon,
                radius: 50, // Radius in km
                filter: true
            }
        });

        const xmlData = response.data;

        // Parse the XML data using xml2js
        xml2js.parseString(xmlData, (err, result) => {
            if (err) {
                console.error('Error parsing XML:', err);
                res.status(500).send('Error parsing response from MyTrails API.');
                return;
            }

            const trailLocations = result.myTrails.trail;
            res.render('trails', { trails: trailLocations, city, state, country });
        });


    } catch (error) {
        console.error('Error fetching trail locations:', error.message);
        res.status(500).send('Failed to fetch trail locations.');
    }
});

module.exports = router;