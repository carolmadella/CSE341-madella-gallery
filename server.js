var express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
var app = express();
const port = 3000;
const mongodb = require("./mongo.js");

// Use CORS middleware
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Get all artists
app.get("/artists", async (req, res) => {
  // copied from ChatGPT the code below
  try {
    const db = await mongodb.connectDB();

    // Get a reference to the collection
    const collection = db.collection("artists");

    // Find documents in the collection
    const artists = await collection.find().toArray();

    console.log(artists);

    res.status(201).json(artists);
  } catch (err) {
    console.error("Error reading documents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/artists", async (req, res) => {
  // copied from ChatGPT some of the code below
  // Assuming the request body contains the artist information
  const newArtist = req.body;
  console.log("Data body", newArtist);

  try {
    const db = await mongodb.connectDB();
    const collection = db.collection("artists");

    // Insert the new artist into the collection
    const result = await collection.insertOne(newArtist);
    const artistID = result.insertedId.toString();

    res
      .status(201)
      .json({ message: "Artist inserted successfully", id: artistID });
  } catch (error) {
    console.error("Error inserting artist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server and listen on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
