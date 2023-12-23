
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const SpotifyWebApi = require ("spotify-web-api-node")


const app = express();
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/taskdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});

//Schema

const musicSchema = new mongoose.Schema({
    title:
    { type: String,
        required: true },
    artist:

       { type: String,
        required: true },

    });
  
  const Music = mongoose.model('Music', musicSchema);
  

const spotifyApi = new SpotifyWebApi({
  clientId: "061bc1ae518341e8a690bee586e4cb0a",
  clientSecret: "df8bd3a4c2794c40a28da137b0083a4a",
});


// Spotify API using client credentials
   spotifyApi.clientCredentialsGrant()
  .then(() => {
    console.log('Successfully completed Spotify API');
  })
  .catch((error) => {
    console.error(' failed to complete Spotify API:', error);
  });

// (Fetch data)

   app.get('/fetch-data', async (req, res) => {
        try {

     const response = await spotifyApi.searchTracks('music', { limit: 5 });
    const tracks = response.body.tracks.items;

    const musicData = tracks.map((track) => ({
      trackName: track.name,
      artist: track.artists.map((artist) => artist.name).join(', '),
      album: track.album.name,
      
    }));

 await Music.insertMany(musicData);
       res.status(200).json({ message:"fetched data stored successfully" });
  }   catch (error)
   {
    console.error("Error  in fetching and storing  data:", error);
       res.status(500).json({ error: "Server Error" });
  }
});

// POST
app.post('/post', async (req, res) => {
  try {
    const newSong = new Music(req.body);
    const savedSong = await newSong.save();
    res.status(201).json(savedSong);
  } catch (error) {
    console.error("Error creating a new song:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// GET
app.get('/get', async (req, res) => {
  try {
    const musicData = await Music.find();
    res.json(musicData);
  } catch (error) {
    console.error("Error in music data:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// PUT
app.put('/update/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const updatedSong = await Music.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedSong) {
      return res.status(404).json({ message:"Song not found"});
    }

  res.json(updatedSong);
  } catch (error) {
    console.error('Error updating the song:', error);
    res.status(500).json({ error: " Server Error"});
  }
});

// DELETE
app.delete('/delete song/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSong = await Music.findByIdAndDelete(id);

    if (!deletedSong) {
      return res.status(404).json({ message:"not founded" });
    }

    res.json({ message: "Song deleted" });
  } catch (error) {
    console.error('Error deleting the song:', error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Search 
app.get('/search', async (req, res) => {
  const { query } = req.query;
 try {
    const searchResults = await Music.find
     res.json(searchResults);
  } catch (error) {
    console.error("Error searching for music:", error);
    res.status(500).json({ error: "Error" });
  }
});

