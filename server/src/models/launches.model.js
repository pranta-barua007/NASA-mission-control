// .model.js files acts like data access layers, which interacts with the db and provides data access functions for controllers
const launchesDatabase = require('./launches.mongo');
const planetsDatabase = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

async function existsLaunchWithId(launchId) {
    return await launchesDatabase.findOne({
        flightNumber: launchId
    });
};

async function getAllLaunches() {
    return await launchesDatabase.find({}, {
        '__id': 0, '__v': 0
    });
};

async function saveLaunches(launch) {
    try {
        const planet = await planetsDatabase.findOne({
            keplerName: launch.target
        });

        if(!planet) {
            throw new Error('No matching planets found!');
        };

        await launchesDatabase.findOneAndUpdate({
            flightNumber: launch.flightNumber
        }, launch, {
            upsert: true
        });
    } catch (err) {
        console.error(`Failed to save launches in Database ${err}`)
    }
};

async function getLatestFlightNumber() {
    const latestLaunch = await launchesDatabase
        .findOne()
        .sort('-flightNumber'); //sort is built in function of mongo, to sort in desending order '-' is added infront of property

    if(!latestLaunch) return DEFAULT_FLIGHT_NUMBER;

    return latestLaunch.flightNumber;
};

async function scheduleNewLaunch(launch) {
    const newFlightNumber = await getLatestFlightNumber() + 1;

    const newLaunch = Object.assign(launch, {
        success: true,
        upcoming: true,
        customers: ['ZTM', 'NASA'],
        flightNumber: newFlightNumber
    });

    await saveLaunches(newLaunch);
};

async function abortLaunchById(launchId) {
   const aborted = await launchesDatabase.updateOne({
       flightNumber: launchId
   }, {
       upcoming: false,
       success: false
   });
   
   return aborted.ok === 1 && aborted.nModified === 1;
};

module.exports = {
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
};