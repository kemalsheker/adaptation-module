const cop = require('contextjs'); 
const { layer, withLayers } = require('contextjs');
const { enableLayer, disableLayer, GlobalLayers, Layers } = require('./node_modules/contextjs/lib/Layers.js');
const { proceed } = require('contextjs');



const DroneContext = Object.freeze({
  SAFE_LANDING: 'SafeLanding',
  GROUND_SEARCH: 'GroundSearch',
  LANDING: 'Landing'
});


const droneContextMap = new Map([
  [DroneContext.SAFE_LANDING, { active: false, messageSent: false }],
  [DroneContext.GROUND_SEARCH, { active: false, messageSent: false }],
  [DroneContext.LANDING, { active: false, messageSent: false }]
]);

function getEnabledLayers() {
  return GlobalLayers.map(layer => layer.name);
}

function isLayerEnabled(layer) {
  return GlobalLayers.includes(layer);
}


class MockDrone {

	  
  goTo() {
		return 'Moves to the direction of the target';
	}

  setSafeLanding() {
    return JSON.stringify({ action: 'SafeLandingFalse'});
  }

  landing() {
    return JSON.stringify({ action: 'NoOverrideLanding' });
  }

  goDestinyAutomatic() {
    return JSON.stringify({ action: 'GoDestinyAutomatic' });
  }

}


//cop.create('Q12_SetLowBattery'); Maybe later try to have a running program first

const L1 = layer("Q1_LowBatterySafeLanding");
const L2 = layer("Q2_CheckTerrain");
const L3 = layer("Q3_GroundSearch");
const L4 = layer("Q4_ExecuteLanding");
const L9 = layer("Q9_EmergencyLanding");

let enableLayersList = [];

let disableLayersList = [];

let socket;

const drone = new MockDrone();

function addEnableLayers(systemVariables) {
  if (systemVariables.currentBattery <= 15) {
    droneContextMap.set(DroneContext.SAFE_LANDING, { active: true, messageSent: false });
  }

  if (systemVariables.currentBattery > 15) {
    droneContextMap.set(DroneContext.SAFE_LANDING, { active: false, messageSent: false });
  }

  /*if (!canReachDestination(systemVariables) && !systemVariables.safeLand) {
    console.log('LowBatterySafeLanding pushed to enable layers list'); 
    droneContextMap.set(DroneContext.SAFE_LANDING, { active: true, messageSent: false });
    enableLayersList.push(L1);
  }
  else {
    console.log('LowBatterySafeLanding pushed to disable layers list');
    droneContextMap.set(DroneContext.SAFE_LANDING, { active: false, messageSent: false });
    disableLayersList.push(L1);
  }*/



  if (droneContextMap.get(DroneContext.SAFE_LANDING).active && systemVariables.isOnWater) {
    droneContextMap.set(DroneContext.GROUND_SEARCH, { active: true, messageSent: false });
  }

  if (droneContextMap.get(DroneContext.SAFE_LANDING).active && !systemVariables.isOnWater) {
    droneContextMap.set(DroneContext.LANDING, { active: true, messageSent: false });
  }

  if (droneContextMap.get(DroneContext.GROUND_SEARCH).active) {

    if(!systemVariables.isOnWater) {
      console.log('End Ground Search Context');
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
    droneContextMap.set(DroneContext.LANDING, { active: false, messageSent: false });
    droneContextMap.set(DroneContext.SAFE_LANDING, { active: false, messageSent: false });
    console.log('End Landing Context pushed to disableLayersList');
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
  //socket.send(drone.setSafeLanding());

  enableLayersList.splice(0, enableLayersList.length);
  disableLayersList.splice(0, disableLayersList.length);
  /*withLayers(layersToEnable, () => {
    const drone = new MockDrone();
    console.log(drone.goDestinyAutomatic()); // This should now trigger the refined method
  });*/
}


module.exports = { runDroneOperations };





/*Q5_BadConnection.refineClass(Object, {
    execute: function (actions, antennaContext) {
      if(systemVariables.badConnection == true) {
        antennaContext.badConnection = true; // Update context
        droneContext.seekConnection = true; // Update context
      }
    },
  });*/


/*Q6_BadConnectionBehavior.refineClass(Object, {
    execute: function (actions, antennaContext) {
      if (antennaContext.badConnection) {
        actions.push('Initiate connection retry');
        antennaContext.badConnection = false; // Update context   Implement later because you have to figure out sending the setting before
      }
    }, 
  });*/ 



function canReachDestination(systemVariables) {
  estimatedBatteryNeeded = drone.distanceToTarget * (drone.consumptionPerSecond + drone.consumptionPerBlock);
  return systemVariables.currentBattery >= estimatedBatteryNeeded;
}


