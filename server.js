var express = require("express");
const cors = require("cors");
var bodyParser = require("body-parser");
var app = express();
const port = 3000;
const mongodb = require("./mongo.js");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const swaggerDoc = require("./swagger.json");

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

app.put('/artists/:id', (req, res) => {
  const artistId = req.params.id;
  const updateArtist = req.body;

  if (dataStore[artistId]) {
    dataStore[artistId] = { ...dataStore[artistId], ...updateArtist };
    res.status(200).send(dataStore[artistId]);
  } else {
    res.status(404).send({ message: 'Artist not found' });
  }
});

// DELETE route to delete a resource
app.delete('/artists/:id', (req, res) => {
  const artistID = req.params.id;

  if (dataStore[artistID]) {
    delete dataStore[artistId];
    res.status(200).send({ message: 'Artist deleted successfully' });
  } else {
    res.status(404).send({ message: 'Artist not found' });
  }
});


// Swagger route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start the server and listen on port 3000
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
