const fs = require('fs');
const path = require('path');
const parse = require('csv-parse');

const planetsDatabase = require('./planets.mongo');

const isHabitablePlanet = (planet) => {
    return planet['koi_disposition'] === 'CONFIRMED' && 
    planet['koi_insol'] > 0.36 && planet['koi_insol'] < 1.11
    && planet['koi_prad'] < 1.6;
};

function loadHabitablePlanetsData() {
    return new Promise((resolve, reject) => {
        fs.createReadStream(path.join(__dirname, '..', '..', 'data', 'keplar_data.csv'))
        .pipe(parse({
            comment: '#',
            columns: true
        }))
        .on('data', async (data) => {
            if(isHabitablePlanet(data)) { 
                await savePlanets(data);
            }
        })
        .on('error', (err) => {
            console.log(err);
            reject();
        })
        .on('end', async () => {
            const countPlanetsFound = (await getAllPlanets()).length;
            console.log(`${countPlanetsFound} habitable planets found`);
            resolve();
        });
    });
};

async function getAllPlanets() {
    return await planetsDatabase.find({}, {
        '__id': 0, '__v': 0
    }); 
    //first {} filters nothing and returns all the list, 
    //second {} accepts the values that needs to excluded and needs to be set to 0
};

async function savePlanets(planetData) {
    //create a mongo doc in planets collection using upsert
    //upsert = update + insert 
    try {
        await planetsDatabase.updateOne({
            keplerName: planetData.kepler_name  //check if a document already exists
        },
        {
            keplerName: planetData.kepler_name // if doesn't then insert or update
        },
        {
            upsert: true // enables upsert feature in mongo
        });
    } catch (err) {
        console.error(`Failed to save planets in Database ${err}`)
    }
};

module.exports = {
    loadHabitablePlanetsData,
    getAllPlanets
};