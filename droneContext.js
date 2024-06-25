// droneContext.js
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
  
  module.exports = { DroneContext, droneContextMap };
  