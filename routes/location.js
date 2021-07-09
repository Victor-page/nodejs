const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const router = express.Router();

const uri = ``;

// const locationStorage = {
//   locations: [],
// };

let con;
let client;
const connect = () => {
  if (con) return con;
  client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  con = client.connect();
  return con;
};

router.post('/add-location', async (req, res, next) => {
  // const id = Math.random();
  try {
    const client = await connect();
    const database = client.db('locations');
    const userLocations = database.collection('user-locations');
    const result = await userLocations.insertOne({
      address: req.body.address,
      coords: [req.body.lat, req.body.lng],
      type: req.body.type,
    });

    console.log(
      `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`
    );
    res.json({ message: 'Stored location!', locId: result.insertedId });
  } catch (error) {
    console.dir(error);
    await client.close();
  }

  // locationStorage.locations.push({
  //   id: id,
  //   address: req.body.address,
  //   coords: [req.body.lat, req.body.lng],
  //   type: req.body.type,
  // });
});

router.get('/location/:lid', async (req, res, next) => {
  const locationId = req.params.lid;

  let mongodbId;
  try {
    mongodbId = new ObjectId(locationId);
  } catch (error) {
    return res.status(500).json({ message: 'Invalid id!' });
  }

  try {
    const client = await connect();
    const database = client.db('locations');
    const userLocations = database.collection('user-locations');

    const location = await userLocations.findOne({
      _id: mongodbId,
    });
    console.log(location);

    if (!location) {
      return res.status(404).json({ message: 'Not found!' });
    }
    res.json({
      address: location.address,
      coordinates: location.coords,
      type: location.type,
    });
  } catch (error) {
    console.dir(error);
    await client.close();
  }
});

module.exports = router;
