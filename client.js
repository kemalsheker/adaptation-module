const WebSocket = require('ws');
const { runDroneOperations } = require('./index');
const { initializeDroneContext, droneContexts } = require('./droneContext');

// Create WebSocket connection to the server
const socket = new WebSocket('ws://localhost:8080');

// Event listener for when the connection is opened
socket.on('open', function () {
    console.log('Connected to the server');
});

// Event listener for when a message is received from the server
socket.on('message', function (message) {
    const data = JSON.parse(message);
    console.log('Received data:', data);

    const droneId = data.id;

    // Initialize context if it doesn't exist
    if (!droneContexts.has(droneId)) {
        console.log(`Initializing context for drone ${droneId}`);
        initializeDroneContext(droneId);
    }

    // Retrieve and update context with received data
    const systemVariables = {
        id: droneId,
        ...droneContexts.get(droneId),
        isAutomatic: data.isAutomatic,
        goodConnection: data.goodConnection,
        badConnection: data.badConnection,
        isOnWater: data.isOnWater,
        isStrongWind: data.isStrongWind,
        currentPosition: data.currentPosition,
        distanceToSource: parseInt(data.distanceToSource),
        distanceToTarget: parseInt(data.distanceToTarget),
        initialBattery: parseInt(data.initialBattery),
        currentBattery: parseInt(data.currentBattery),
        consumptionPerSecond: parseInt(data.consumptionPerSecond),
        consumptionPerBlock: parseInt(data.consumptionPerBlock),
        isLanded: data.landing,
        safeLand: data.safeLand,
        badConnectionAction: data.badConnectionAction,
        connectionRetry: data.connectionRetry || 0,
    };

    console.log('Updated context for drone', droneId, ':', systemVariables);

    runDroneOperations(systemVariables, socket);
});

// Event listener for errors
socket.on('error', function (error) {
    console.error('WebSocket error:', error);
});

// Event listener for when the connection is closed
socket.on('close', function () {
    console.log('Disconnected from the server');
});
