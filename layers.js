const cop = require('contextjs'); 
const { layer, withLayers } = require('contextjs');
const { enableLayer, disableLayer, GlobalLayers, Layers } = require('./node_modules/contextjs/lib/Layers.js');
const { proceed } = require('contextjs');



const DroneContext = Object.freeze({
  SAFE_LANDING: 'SafeLanding',
  GROUND_SEARCH: 'GroundSearch',
  LANDING: 'Landing',
  BAD_CONNECTION: 'BadConnection'
});


const droneContextMap = new Map([
  [DroneContext.SAFE_LANDING, { active: false, messageSent: false }],
  [DroneContext.GROUND_SEARCH, { active: false, messageSent: false }],
  [DroneContext.LANDING, { active: false, messageSent: false }],
  [DroneContext.BAD_CONNECTION, { active: false, messageSent: false }]
]);

function getEnabledLayers() {
  return GlobalLayers.map(layer => layer.name);
}

function isLayerEnabled(layer) {
  return GlobalLayers.includes(layer);
}


class MockDrone {

	  

  setSafeLanding() {
    return JSON.stringify({ action: 'SafeLandingFalse'});
  }

  landing() {
    return JSON.stringify({ action: 'NoOverrideLanding' });
  }

  goDestinyAutomatic() {
    return JSON.stringify({ action: 'GoDestinyAutomatic' });
  }

  badConnectionAction() {
    return JSON.stringify({ action: 'noBadConnection' });
  }

}


//cop.create('Q12_SetLowBattery'); Maybe later try to have a running program first

const L1 = layer("Q1_LowBatterySafeLanding");
const L3 = layer("Q3_GroundSearch");
const L4 = layer("Q4_ExecuteLanding");
const L5 = layer("Q5_BadConnection_returnBase");
const L6 = layer("Q6_BadConnectionBehavior_seekConnection");

let enableLayersList = [];

let disableLayersList = [];

let socket;

const drone = new MockDrone();

function addEnableLayers(systemVariables) {


  if (systemVariables.currentBattery <= 15 ) {
    droneContextMap.set(DroneContext.SAFE_LANDING, { active: true, messageSent: false });
    enableLayersList.push(L1);
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
      disableLayersList.push(L3);
    }
    else {
      enableLayersList.push(L3);
    }
  }

  if(droneContextMap.get(DroneContext.LANDING).active && !systemVariables.isLanded) {
    enableLayersList.push(L4);
  }

  if(droneContextMap.get(DroneContext.LANDING).active && systemVariables.isLanded) {
    disableLayersList.push(L4);
    disableLayersList.push(L1);
    disableLayersList.push(L5);
    disableLayersList.push(L6);
    droneContextMap.set(DroneContext.LANDING, { active: false, messageSent: false });
    droneContextMap.set(DroneContext.SAFE_LANDING, { active: false, messageSent: false });
  }

  if(!systemVariables.goodConnection && systemVariables.badConnection) {
    droneContextMap.set(DroneContext.BAD_CONNECTION, { active: true, messageSent: false });
  }

  if(droneContextMap.get(DroneContext.BAD_CONNECTION).active) {
    if(systemVariables.badConnectionAction == 'returnBase'){
      enableLayersList.push(L5);
      
    }

    if(systemVariables.badConnectionAction =='seekConnection'){
      enableLayersList.push(L6);
      if(systemVariables.goodConnection){
        disableLayersList.push(L6);
        droneContextMap.set(DroneContext.BAD_CONNECTION, { active: false, messageSent: false });
      }
    }

  }

  if(droneContextMap.get(DroneContext.BAD_CONNECTION).active && systemVariables.goodConnection) {
    droneContextMap.set(DroneContext.BAD_CONNECTION, { active: false, messageSent: false });
    disableLayersList.push(L6);
  }

  if(systemVariables.distanceToSource == 0){
    disableLayersList.push(L5);
    droneContextMap.set(DroneContext.BAD_CONNECTION, { active: false, messageSent: false });
  }
  


}



L1.refineClass(MockDrone, {
  setSafeLanding() {
    const safeLandingContext = droneContextMap.get(DroneContext.SAFE_LANDING);
    droneContextMap.set(DroneContext.SAFE_LANDING, { ...safeLandingContext, messageSent: true });
    return JSON.stringify({ action: 'SafeLandingTrue' });
  }
});


L3.refineClass(MockDrone, {
  goDestinyAutomatic() {
    const groundSearchContext = droneContextMap.get(DroneContext.GROUND_SEARCH);
    droneContextMap.set(DroneContext.GROUND_SEARCH, { ...groundSearchContext, messageSent: true });
    return JSON.stringify({ action: 'overrideGoDestinyAutomatic' });
  }
});


L4.refineClass(MockDrone, {
  landing() {
    const landingContext = droneContextMap.get(DroneContext.LANDING);
    droneContextMap.set(DroneContext.LANDING, { ...landingContext, messageSent: true });
    return JSON.stringify({ action: 'ExecuteLanding' });
  }
});


L5.refineClass(MockDrone, {
  badConnectionAction() {
    const badConnectionContext = droneContextMap.get(DroneContext.BAD_CONNECTION);
    droneContextMap.set(DroneContext.BAD_CONNECTION, { ...badConnectionContext, messageSent: true });
    return JSON.stringify({ action: 'returnBase' });
  }
});


L6.refineClass(MockDrone, {
  badConnectionAction() {
    const badConnectionContext = droneContextMap.get(DroneContext.BAD_CONNECTION);
    droneContextMap.set(DroneContext.BAD_CONNECTION, { ...badConnectionContext, messageSent: true });
    return JSON.stringify({ action:'seekConnection' });
  }
});



function runDroneOperations(systemVariables, ws) {
  socket = ws;
  addEnableLayers(systemVariables);

  enableLayersList.forEach(layer => {
    if (!isLayerEnabled(layer)) {
      enableLayer(layer);
      console.log('Layer enabled:'+ layer.name);
    }
  });



  disableLayersList.forEach(layer => {
    if (isLayerEnabled(layer)) {
      disableLayer(layer);
      console.log('Layer disabled:'+ layer.name);
    }
  });

  socket.send(drone.goDestinyAutomatic());
  socket.send(drone.landing());
  socket.send(drone.setSafeLanding());
  socket.send(drone.badConnectionAction());

  enableLayersList.splice(0, enableLayersList.length);
  disableLayersList.splice(0, disableLayersList.length);
}


module.exports = { runDroneOperations };




