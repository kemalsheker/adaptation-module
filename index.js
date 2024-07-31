const { L1, L3, L4, L5, L6 } = require('./layerDefinitions');
const { droneContexts, DroneContext } = require('./droneContext');
const MockDrone = require('./mockDrone');
const { enableLayer, disableLayer, GlobalLayers, Layers } = require('./node_modules/contextjs/lib/Layers');


const drones = new Map();

// Retrieves the names of currently enabled layers globally.
function getEnabledLayers() {
    return GlobalLayers.map(layer => layer.name);
}

// Checks if a specific layer is enabled globally.
function isLayerEnabled(layer) {
    return GlobalLayers.includes(layer);
}


// Retrieves an existing drone by ID or creates a new one if it doesn't exist.
function getOrCreateDrone(id) {
  if (!drones.has(id)) {
    console.log(`Creating new drone with ID ${id}`);
    const drone = new MockDrone(id);
    drones.set(id, drone);
  } else {
    console.log(`Using existing drone with ID ${id}`);
  }
  return drones.get(id);
}

// Handles the low battery condition for a drone, updating the context and enabling the appropriate layers.
function handleLowBattery(systemVariables, context, drone) {
  if (systemVariables.currentBattery <= 10) {
      context[DroneContext.LOW_BATTERY] = { active: true, messageSent: false };
  } else {
      context[DroneContext.LOW_BATTERY] = { active: false, messageSent: false };
  }
}


// Handles the ground search condition for a drone, updating the context and enabling/disabling the appropriate layers.
function handleGroundSearch(systemVariables, context, drone) {
  if (context[DroneContext.LOW_BATTERY].active) {
      if (systemVariables.isOnWater && (!systemVariables.isStrongWind || systemVariables.distanceToTarget > 60)) {
          context[DroneContext.GROUND_SEARCH] = { active: true, messageSent: false };
      } else if (systemVariables.distanceToTarget <= 60 && systemVariables.isStrongWind) {
          // Do nothing
      } else {
          context[DroneContext.SAFE_LANDING] = { active: true, messageSent: false };
          drone.enableLayer(L1);
      }
  }

  if (context[DroneContext.GROUND_SEARCH].active) {
      if (!systemVariables.isOnWater) {
          context[DroneContext.GROUND_SEARCH] = { active: false, messageSent: false };
          drone.disableLayer(L3);
      } else {
          drone.enableLayer(L3);
      }
  }
}


// Handles the safe landing condition for a drone, updating the context and enabling/disabling the appropriate layers.
function handleSafeLanding(systemVariables, context, drone) {
  if (context[DroneContext.SAFE_LANDING].active) {
      context[DroneContext.LANDING] = { active: true, messageSent: false };
      context[DroneContext.RETURN_BASE] = { active: false, messageSent: false };
      drone.disableLayer(L5);
      context[DroneContext.SEEK_CONNECTION] = { active: false, messageSent: false };
      drone.disableLayer(L6);
  }

  if (context[DroneContext.LANDING].active) {
      drone.enableLayer(L4);
      context[DroneContext.RETURN_BASE] = { active: false, messageSent: false };
      context[DroneContext.SEEK_CONNECTION] = { active: false, messageSent: false };
  }

  if (systemVariables.isLanded && context[DroneContext.LANDING].active) {
      drone.disableLayer(L4);
      context[DroneContext.LANDING] = { active: false, messageSent: false };
      drone.disableLayer(L1);
      context[DroneContext.SAFE_LANDING] = { active: false, messageSent: false };
  }
}

// Handles the connection status for a drone, updating the context and enabling/disabling the appropriate layers.
function handleConnection(systemVariables, context, drone) {
  if (!systemVariables.goodConnection && systemVariables.badConnection) {
      context[DroneContext.BAD_CONNECTION] = { active: true, messageSent: false };
  }

  if (systemVariables.goodConnection) {
      context[DroneContext.BAD_CONNECTION] = { active: false, messageSent: false };
  }

  if (context[DroneContext.BAD_CONNECTION].active && !context[DroneContext.LOW_BATTERY].active) {
      if (systemVariables.distanceToTarget > systemVariables.distanceToSource) {
          drone.enableLayer(L5);
          context[DroneContext.RETURN_BASE] = { active: true, messageSent: false };
      }

      if (systemVariables.distanceToTarget < systemVariables.distanceToSource) {
          drone.enableLayer(L6);
          context[DroneContext.SEEK_CONNECTION] = { active: true, messageSent: false };
      }
  }

  if (!context[DroneContext.BAD_CONNECTION].active && context[DroneContext.SEEK_CONNECTION].active) {
      context[DroneContext.SEEK_CONNECTION] = { active: false, messageSent: false };
      drone.disableLayer(L6);
  }

  if (systemVariables.distanceToSource === 0) {
      drone.disableLayer(L5);
      context[DroneContext.RETURN_BASE] = { active: false, messageSent: false };
  }
}


// Determines and enables/disables layers for the drone based on the current system variables and context.
function addEnableLayers(systemVariables, context, drone) {
  handleLowBattery(systemVariables, context, drone);
  handleGroundSearch(systemVariables, context, drone);
  handleSafeLanding(systemVariables, context, drone);
  handleConnection(systemVariables, context, drone);
}


// Runs the drone operations by determining the necessary actions and sending them via WebSocket.
function runDroneOperations(systemVariables, ws) {
    const { id } = systemVariables;
    const drone = getOrCreateDrone(id);
    const context = droneContexts.get(id);
  
    addEnableLayers(systemVariables, context, drone);
  
    const actions = drone.execute();
  
    if (actions.length > 0) {
      const batchMessage = JSON.stringify(actions);
      ws.send(batchMessage);
    }
}

module.exports = { runDroneOperations };
