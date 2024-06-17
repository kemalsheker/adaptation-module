const WebSocket = require('ws');
const { runDroneOperations } = require('./layers'); // Adjust the path as necessary


// Create WebSocket connection to the server
const socket = new WebSocket('ws://localhost:8080');

// Event listener for when the connection is opened
socket.on('open', function () {
  console.log('Connected to the server');
});

let systemVariables = {};

// Event listener for when a message is received from the server
socket.on('message', function (message) {
  const data = JSON.parse(message);
  console.log('Received data:', data);

  // Initialize context with received data
  systemVariables = {
    uniqueID: data.id,
    isAutomatic: data.isAutomatic,
    goodConnection: data.goodConnection,
    badConnection: data.badConnection,
    isOnWater: data.isOnWater,
    currentPosition: data.currentPosition,
    distanceToSource: data.distanceToSource,
    distanceToTarget: data.distanceToTarget,
    initialBattery: data.initialBattery,
    currentBattery: data.currentBattery,
    consumptionPerSecond: data.consumptionPerSecond,
    consumptionPerBlock: data.consumptionPerBlock,
    isLanded: data.landing,
    safeLand: data.safeLand,
    connectionRetry: data.connectionRetry || 0
  };

  console.log('Updated context:', systemVariables);

  
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
