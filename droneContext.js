/**
 * Drone Context Initialization and Management
 * 
 * This module defines the various contexts a drone can be in and provides mechanisms to initialize and manage these contexts.
 * 
 * 
 * - droneContextMap: A Map object that provides default context values for each DroneContext key. This map is used to initialize the context of each drone.
 * 
 * - droneContexts: A Map object that stores the context for each drone instance by its ID.
 * 
 * Functions:
 * - initializeDroneContext(id): Initializes the context for a new drone instance with a given ID. The context includes default values for all possible states and several operational parameters. This function sets the initial values and adds the context to the droneContexts Map.
 *   - id: The unique identifier for the drone.
 *   - Returns: The initialized context object.
 * 
 * Usage:
 * This module is used to manage the state and context of drones in the system. The contexts help determine what actions a drone should take based on its current state and conditions. By initializing a drone's context, the system ensures that each drone starts with a consistent and known state.
 * 
 */

const DroneContext = Object.freeze({
  SAFE_LANDING: 'SafeLanding',
  GROUND_SEARCH: 'GroundSearch',
  LANDING: 'Landing',
  BAD_CONNECTION: 'BadConnection',
  SEEK_CONNECTION: 'SeekConnection',
  RETURN_BASE: 'ReturnBase',
  LOW_BATTERY: 'LowBattery'
});

const droneContextMap = new Map([
  [DroneContext.SAFE_LANDING, { active: false, messageSent: false }],
  [DroneContext.GROUND_SEARCH, { active: false, messageSent: false }],
  [DroneContext.LANDING, { active: false, messageSent: false }],
  [DroneContext.BAD_CONNECTION, { active: false, messageSent: false }],
  [DroneContext.SEEK_CONNECTION, { active: false, messageSent: false }],
  [DroneContext.RETURN_BASE, { active: false, messageSent: false }]
]);

const droneContexts = new Map();

function initializeDroneContext(id) {
  const context = {
      id,
      [DroneContext.SAFE_LANDING]: { active: false, messageSent: false },
      [DroneContext.GROUND_SEARCH]: { active: false, messageSent: false },
      [DroneContext.LANDING]: { active: false, messageSent: false },
      [DroneContext.BAD_CONNECTION]: { active: false, messageSent: false },
      [DroneContext.SEEK_CONNECTION]: { active: false, messageSent: false },
      [DroneContext.RETURN_BASE]: { active: false, messageSent: false },
      [DroneContext.LOW_BATTERY]: { active: false, messageSent: false },
      isAutomatic: false,
      goodConnection: true,
      badConnection: false,
      isOnWater: false,
      isStrongWind: false,
      currentPosition: null,
      distanceToSource: 0,
      distanceToTarget: 0,
      initialBattery: 100,
      currentBattery: 100,
      consumptionPerSecond: 1,
      consumptionPerBlock: 1,
      isLanded: false,
      safeLand: false,
      connectionRetry: 0
  };
  droneContexts.set(id, context);
  return context;
}

module.exports = { DroneContext, droneContexts, initializeDroneContext };