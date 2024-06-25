const { layer, withLayers } = require('contextjs');
const { droneContextMap, DroneContext } = require('./droneContext');
const MockDrone = require('./mockDrone');


const L1 = layer("Q1_LowBatterySafeLanding");
const L3 = layer("Q3_GroundSearch");
const L4 = layer("Q4_ExecuteLanding");
const L5 = layer("Q5_BadConnection_returnBase");
const L6 = layer("Q6_BadConnectionBehavior_seekConnection");


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

  
module.exports = { L1, L3, L4, L5, L6 };
