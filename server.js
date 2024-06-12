var express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
var app = express();
const port = 3000;
const mongodb = require("./mongo.js");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");
const jwt = require('jsonwebtoken');

// Using help of chatGPT to implement the OAUTH with Google
const axios = require('axios');
const { OAuth2Client } = require('google-auth-library');

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = `${process.env.URL}/auth/google/callback`;
const JWT_SECRET = process.env.SECRET;

const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);


// Use CORS middleware
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CSE341 API",
      version: "1.0.0",
    },
    servers: [{ url: process.env.URL }],
  },
  swaggerDefinition: swaggerDoc,
  apis: ["./server.js"], // Use a global pattern to include all route files
};

const swaggerSpec = swaggerJSDoc(options);

/*******************
 *
 * OAUTH
 *
 *******************/

// Route to start the OAuth flow
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email']
  });
  res.redirect(authUrl);
});
 
// Route to handle the callback from Google
app.get('/auth/google/callback', async (req, res) => {
  const code = req.query.code;
  try {
    const googleResponse = await oauth2Client.getToken(code);
    const tokens = googleResponse.tokens
    oauth2Client.setCredentials(tokens);

    // Use the access token to fetch user information
    const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });
    
    const userData = response.data;
    res.json(userData);
  } catch (error) {
    console.error('Error during Google OAuth callback:', error.message);
    res.status(500).send('Authentication failed');
  }
});



/*******************
 *
 * ARTIST
 *
 *******************/

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

app.get("/artists/:id", async (req, res) => {

  const artistId = req.params.id
  
  // copied from ChatGPT the code below
  try {
    const db = await mongodb.connectDB();

    // Get a reference to the collection
    const collection = db.collection("artists");

    // Find documents in the collection
    const artist = await collection.findOne({ _id: new mongodb.ObjectId(artistId) });

    console.log(artist);

    res.status(201).json(artist);
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

app.put("/artists/:id", async (req, res) => {
  const artistId = req.params.id;
  const updatedArtist = req.body;

  //data validation
  if (artistId == null || updatedArtist == null) {
    return res.status(404).json({ error: "invalid input provided" });
  }

  try {
    const db = await mongodb.connectDB();
    const collection = db.collection("artists");

    // Update the artist by ID
    const result = await collection.findOneAndUpdate(
      { _id: new mongodb.ObjectId(artistId) },
      { $set: updatedArtist },
      { returnNewDocument: true }
    );

    // Check if the artist was found and updated
    if (!result) {
      return res.status(404).json({ error: "artist not found" });
    }

    res.status(204).json({
      message: "artist updated successfully",
    });
  } catch (error) {
    console.error("Error updating artist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE route to delete a resource
app.delete("/artists/:id", async (req, res, next) => {
  const artistId = req.params.id;

  //data validation
  if (artistId == null) {
    return res.status(404).json({ error: "invalid input provided" });
  }
  // copied from ChatGPT some of the code below
  try {
    const db = await mongodb.connectDB();
    const collection = db.collection("artists");

    // Delete the artist by ID
    const result = await collection.findOneAndDelete({
      _id: new mongodb.ObjectId(artistId),
    });

    // Check if the artist was found and deleted
    if (!result) {
      return res.status(404).json({ error: "artist not found" });
    }

    res.status(200).json({ message: "artist deleted successfully" });
  } catch (error) {
    console.error("Error deleting artist:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/*******************
 *
 * ARTWORKS
 *
 *******************/

//Get all artworks
app.get("/artworks", async (req, res) => {
  // copied from ChatGPT the code below
  try {
    const db = await mongodb.connectDB();

    // Get a reference to the collection
    const collection = db.collection("artworks");

    // Find documents in the collection
    const artworks = await collection.find().toArray();

    console.log(artworks);

    res.status(201).json(artworks);
  } catch (err) {
    console.error("Error reading documents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/artworks/:id", async (req, res) => {

  const artworkId = req.params.id

  // copied from ChatGPT the code below
  try {
    const db = await mongodb.connectDB();

    // Get a reference to the collection
    const collection = db.collection("artworks");

    // Find documents in the collection
    const artwork = await collection.findOne({ _id: new mongodb.ObjectId(artworkId) });

    console.log(artwork);

    res.status(201).json(artwork);
  } catch (err) {
    console.error("Error reading documents:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/artworks", async (req, res) => {
  // copied from ChatGPT some of the code below
  // Assuming the request body contains the artwork information
  const newArtwork = req.body;
  console.log("Data body", newArtwork);

  try {
    const db = await mongodb.connectDB();
    const collection = db.collection("artworks");

    // Insert the new artwork into the collection
    const result = await collection.insertOne(newArtwork);
    const artworkID = result.insertedId.toString();

    res
      .status(201)
      .json({ message: "Artwork inserted successfully", id: artworkID });
  } catch (error) {
    console.error("Error inserting artwork:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/artworks/:id", async (req, res) => {
  const artworkId = req.params.id;
  const updatedArtwork = req.body;

  //data validation
  if (artworkId == null || updatedArtwork == null) {
    return res.status(404).json({ error: "invalid input provided" });
  }

  try {
    const db = await mongodb.connectDB();
    const collection = db.collection("artworks");

    // Update the artwork by ID
    const result = await collection.findOneAndUpdate(
      { _id: new mongodb.ObjectId(artworkId) },
      { $set: updatedArtwork },
      { returnNewDocument: true }
    );

    // Check if the artwork was found and updated
    if (!result) {
      return res.status(404).json({ error: "artwork not found" });
    }

    res.status(204).json({
      message: "artwork updated successfully",
    });
  } catch (error) {
    console.error("Error updating artwork:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE route to delete a resource
app.delete("/artworks/:id", async (req, res, next) => {
  const artworkId = req.params.id;

  //data validation
  if (artworkId == null) {
    return res.status(404).json({ error: "invalid input provided" });
  }
  // copied from ChatGPT some of the code below
  try {
    const db = await mongodb.connectDB();
    const collection = db.collection("artworks");

    // Delete the artwork by ID
    const result = await collection.findOneAndDelete({
      _id: new mongodb.ObjectId(artworkId),
    });

    // Check if the artwork was found and deleted
    if (!result) {
      return res.status(404).json({ error: "artwork not found" });
    }

    res.status(200).json({ message: "artwork deleted successfully" });
  } catch (error) {
    console.error("Error deleting artwork:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the server and listen on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
