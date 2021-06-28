const fs = require('fs');
const path = require('path');
const parse = require('csv-parse');

const result = []; //habitablePlanetsDataArray

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
        .on('data', (data) => {
            if(isHabitablePlanet(data)) {
                result.push(data)
            }
        })
        .on('error', (err) => {
            console.log(err);
            reject();
        })
        .on('end', () => {
            console.log(`${result.length} habitable planets found`);
            resolve();
        });
    });
};

function getAllPlanets() {
    return result;
};


module.exports = {
    loadHabitablePlanetsData,
    getAllPlanets
};