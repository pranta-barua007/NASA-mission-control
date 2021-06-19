const http = require('http');

const app = require('./app');

const {loadHabitablePlanetsData} = require('./models/planets.model');

const server = http.createServer(app);

const PORT = process.env.PORT || 8000;

async function startServer() {
    await loadHabitablePlanetsData();

    server.listen(PORT, () => {
        console.log(`Listening on port ${PORT}....`);
    });
};

startServer();


