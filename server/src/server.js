const http = require('http');
require('dotenv').config();

const mongoose = require('mongoose');

const app = require('./app');

const {loadHabitablePlanetsData} = require('./models/planets.model');

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
    console.log('MongoDB connection is Ready!');
});

mongoose.connection.on('error', (err) => {
    console.error(err);
});

async function startServer() {
    await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useFindAndModify: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    });
    await loadHabitablePlanetsData();

    const PORT = process.env.PORT || 8000;

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}....`);
    });
};

startServer();


