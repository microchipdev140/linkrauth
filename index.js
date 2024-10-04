const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Step 1: Redirect to Spotify for authorization
app.get('/auth/spotify', (req, res) => {
    const scopes = 'user-library-read'; // Add more scopes as needed
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    res.redirect(authUrl);
});

// Step 2: Handle the callback from Spotify
app.get('/callback', async (req, res) => {
    const { code } = req.query;

    // Step 3: Exchange the authorization code for an access token
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', null, {
            params: {
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
            },
            headers: {
                'Authorization': `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const accessToken = response.data.access_token;
        // You can now use this access token to make API calls on behalf of the user.
        res.send(`Access Token: ${accessToken}`);
    } catch (error) {
        console.error('Error retrieving access token:', error.response.data);
        res.status(500).send('Error retrieving access token');
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the Spotify Auth Server! Go to <a href="/auth/spotify">/auth/spotify</a> to start the authorization process.');
});

// Export the app as a Vercel serverless function
module.exports = app;
