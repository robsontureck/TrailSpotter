const express = require('express');
const https = require('https');
const axios = require('axios');
const router = express.Router();
require("dotenv").config();

const GEO_KEY = process.env.API_KEY1;

router.get('/:cityName', async (req, res) => {
    try {
        const { cityName } = req.params;
        console.log(cityName);

        const apiUrl = `https://api.geoapify.com/v1/geocode/search?text=${cityName}&apiKey=${GEO_KEY}`;

        const apiRes = await axios.get(apiUrl);

        const parsedData = apiRes.data;

        if (parsedData && parsedData.features && parsedData.features.length > 0) {
            const lat = parsedData.features[0].geometry.coordinates[1];
            const lon = parsedData.features[0].geometry.coordinates[0];
            const city = parsedData.features[0].properties.city;
            const state = parsedData.features[0].properties.state;
            const country = parsedData.features[0].properties.country;
            res.json({ lat, lon, city, state, country });
        } else {
            res.status(404).json({ error: 'Location not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data from Geoapify' });
    }
});

module.exports = router;
