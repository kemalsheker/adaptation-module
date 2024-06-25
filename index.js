const { L1, L3, L4, L5, L6 } = require('./layerDefinitions');
const { droneContextMap, DroneContext } = require('./droneContext');
const MockDrone = require('./mockDrone');
const { enableLayer, disableLayer, GlobalLayers, Layers } = require('./node_modules/contextjs/lib/Layers.js');



let layersToEnable = [];
let layersToDisable = [];
let socket;
const drone = new MockDrone();


function getEnabledLayers() {
   return GlobalLayers.map(layer => layer.name);
}
  
function isLayerEnabled(layer) {
   return GlobalLayers.includes(layer);
}


function addEnableLayers(systemVariables) {


    if (systemVariables.currentBattery <= 15 ) {
      droneContextMap.set(DroneContext.SAFE_LANDING, { active: true, messageSent: false });
      layersToEnable.push(L1);
    }
  
    if (droneContextMap.get(DroneContext.SAFE_LANDING).active && systemVariables.isOnWater) {
      droneContextMap.set(DroneContext.GROUND_SEARCH, { active: true, messageSent: false });
    }
  
    if (droneContextMap.get(DroneContext.SAFE_LANDING).active && !systemVariables.isOnWater) {
      droneContextMap.set(DroneContext.LANDING, { active: true, messageSent: false });
    }
  
    if (droneContextMap.get(DroneContext.GROUND_SEARCH).active) {
  
      if(!systemVariables.isOnWater) {
        droneContextMap.set(DroneContext.GROUND_SEARCH, {active: false, messageSent: false});
        layersToDisable.push(L3);
      }
      else {
        layersToEnable.push(L3);
      }
    }
  
    if(droneContextMap.get(DroneContext.LANDING).active && !systemVariables.isLanded) {
        layersToEnable.push(L4);
    }
  
    if(droneContextMap.get(DroneContext.LANDING).active && systemVariables.isLanded) {
        layersToDisable.push(L4);
        layersToDisable.push(L1);
        layersToDisable.push(L5);
        layersToDisable.push(L6);
      droneContextMap.set(DroneContext.LANDING, { active: false, messageSent: false });
      droneContextMap.set(DroneContext.SAFE_LANDING, { active: false, messageSent: false });
    }
  
    if(!systemVariables.goodConnection && systemVariables.badConnection) {
      droneContextMap.set(DroneContext.BAD_CONNECTION, { active: true, messageSent: false });
    }
  
    if(droneContextMap.get(DroneContext.BAD_CONNECTION).active) {
      if(systemVariables.badConnectionAction == 'returnBase'){
        layersToEnable.push(L5);
        
      }
  
      if(systemVariables.badConnectionAction =='seekConnection'){
        layersToEnable.push(L6);
        if(systemVariables.goodConnection){
            layersToDisable.push(L6);
          droneContextMap.set(DroneContext.BAD_CONNECTION, { active: false, messageSent: false });
        }
      }
  
    }
  
    if(droneContextMap.get(DroneContext.BAD_CONNECTION).active && systemVariables.goodConnection) {
      droneContextMap.set(DroneContext.BAD_CONNECTION, { active: false, messageSent: false });
      layersToDisable.push(L6);
    }
  
    if(systemVariables.distanceToSource == 0){
        layersToDisable.push(L5);
      droneContextMap.set(DroneContext.BAD_CONNECTION, { active: false, messageSent: false });
    }
  
}


function runDroneOperations(systemVariables, ws) {
    socket = ws;
    addEnableLayers(systemVariables);
  
    layersToEnable.forEach(layer => {
      if (!isLayerEnabled(layer)) {
        enableLayer(layer);
        console.log('Layer enabled:' + layer.name);
      }
    });
  
    layersToDisable.forEach(layer => {
      if (isLayerEnabled(layer)) {
        disableLayer(layer);
        console.log('Layer disabled:' + layer.name);
      }
    });
  
    socket.send(drone.goDestinyAutomatic());
    socket.send(drone.landing());
    socket.send(drone.setSafeLanding());
    socket.send(drone.badConnectionAction());
  
    layersToEnable.splice(0, layersToEnable.length);
    layersToDisable.splice(0, layersToDisable.length);
}
  
module.exports = { runDroneOperations };

