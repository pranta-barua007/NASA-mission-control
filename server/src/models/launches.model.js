const axios = require('axios');
// .model.js files acts like data access layers, which interacts with the db and provides data access functions for controllers
const launchesDatabase = require('./launches.mongo');
const planetsDatabase = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunces() {
    console.log('Downloading launches data from SpaceX...');
    const response = await axios.post(SPACEX_API_URL, {
        query: {},
        options: {
            pagination: false,
            populate: [
                {
                    path: 'rocket',
                    select: {
                        name: 1
                    }
                },
                {
                    path: 'payloads',
                    select: {
                        'customers': 1
                    }
                }
            ]
        }
    });

    if(response.status !== 200) {
        console.log('Failed to download launch data from SpaceX');
        throw new Error('Launch Data download failed!')
    }

    const launchDocs = response.data.docs;
    //console.log(launchDocs)
    for(const launchDoc of launchDocs) {
        const payloads = launchDoc['payloads'];
        const customers = payloads.flatMap((payload) => {
            return payload['customers'];
        });

        const launch = {
            flightNumber: launchDoc['flight_number'],
            mission: launchDoc['name'],
            rocket: launchDoc['rocket']['name'],
            launchDate: launchDoc['date_local'],
            upcoming: launchDoc['upcoming'],
            success: launchDoc['success'],
            customers: customers
        };

        console.log(`${launch.flightNumber} ${launch.mission} `);
        saveLaunches(launch);
    }
};

async function loadLaunchesData() {
    const firstLaunc = await findLaunch({
        flightNumber: 1,
        rocket: 'Falcon 1',
        mission: 'FalconSat'
    });

    if(firstLaunc) {
        console.log('Launch already exists');
        return;
    }else {
        await populateLaunces();
    }
};

async function findLaunch(filterObject) {
    return await launchesDatabase.findOne(filterObject)
};

async function existsLaunchWithId(launchId) {
    return await findLaunch({
        flightNumber: launchId
    });
};

async function getAllLaunches(skip, limit) {
    //in mongo if sort is 1 === Asc Order, -1 Desc Order
    return await launchesDatabase
    .find({}, {
        '__id': 0, '__v': 0
    })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
};

async function saveLaunches(launch) {
    try {
        await launchesDatabase.findOneAndUpdate({
            flightNumber: launch.flightNumber
        }, launch, {
            upsert: true
        });
    } catch (err) {
        console.error(`Failed to save launches in Database ${err}`);
        throw new Error('There was a problem saving launches');
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
    const planet = await planetsDatabase.findOne({
        keplerName: launch.target
    });

    if(!planet) {
        throw new Error('No matching planets found!');
    };
    
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
    loadLaunchesData,
    existsLaunchWithId,
    getAllLaunches,
    scheduleNewLaunch,
    abortLaunchById
};