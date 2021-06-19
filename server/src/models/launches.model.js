const launches = new Map();

const launch = {
    flightNumber: 100,
    mission: 'Keplar Expoloration X',
    rocket: 'Explorer IS1',
    launchDate: new Date('Decemeber 27, 2030'),
    destination: 'Keplar 442-b',
    customer: ['ZTM', 'NASA'],
    upcoming: true,
    success: true
};

launches.set(launch.flightNumber, launch);

module.exports = {
    launches
};