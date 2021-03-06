const http = require('http');
require('dotenv').config();

const app = require('./app');
const { mongoConnect } = require('./services/mongo');
const { loadHabitablePlanetsData } = require('./models/planets.model');
const { loadLaunchesData } = require('./models/launches.model');

const server = http.createServer(app);

async function startServer() {
    await mongoConnect();
    await loadHabitablePlanetsData();
    await loadLaunchesData();

    const PORT = process.env.PORT || 8000;

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}....`);
    });
};

startServer();


