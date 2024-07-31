const { layer, withLayers } = require('contextjs');
const { droneContexts, DroneContext } = require('./droneContext');
const MockDrone = require('./mockDrone');


/**
 * Layer Definitions and Refinements for MockDrone
 * 
 * This module defines layers and their specific refinements for the MockDrone class, using the contextjs library.
 * Each layer modifies the behavior of the MockDrone class methods to account for different scenarios and contexts.
 * 
 * Imports:
 * - layer, withLayers: Functions from the contextjs library to define and apply layers.
 * - droneContexts, DroneContext: Context management objects for drones.
 * - MockDrone: The mock drone class that will be refined by layers.
 * 
 * Each layer uses the refineClass method to extend the behavior of the MockDrone class.
 *
 * Usage:
 * These layers can be applied to instances of MockDrone to modify their behavior based on the current context. This allows for dynamic adjustment of drone actions in response to different conditions.
 * 
 * Exports:
 * - L1, L3, L4, L5, L6: The defined layers, refined with specific behaviors for the MockDrone class.
 */
const L1 = layer("Q1_LowBatterySafeLanding");
const L3 = layer("Q3_GroundSearch");
const L4 = layer("Q4_ExecuteLanding");
const L5 = layer("Q5_BadConnection_returnBase");
const L6 = layer("Q6_BadConnectionBehavior_seekConnection");

L1.refineClass(MockDrone, {
    setSafeLanding() {
        const context = droneContexts.get(this.id);
        const safeLandingContext = context[DroneContext.SAFE_LANDING];
        context[DroneContext.SAFE_LANDING] = { ...safeLandingContext, messageSent: true };
        return { id: this.id, action: 'SafeLandingTrue' };
    }
});

L3.refineClass(MockDrone, {
    goDestinyAutomatic() {
        const context = droneContexts.get(this.id);
        const groundSearchContext = context[DroneContext.GROUND_SEARCH];
        context[DroneContext.GROUND_SEARCH] = { ...groundSearchContext, messageSent: true };
        return { id: this.id, action: 'overrideGoDestinyAutomatic' };
    }
});

L4.refineClass(MockDrone, {
    landing() {
        const context = droneContexts.get(this.id);
        const landingContext = context[DroneContext.LANDING];
        context[DroneContext.LANDING] = { ...landingContext, messageSent: true };
        return { id: this.id, action: 'ExecuteLanding' };
    }
});

L5.refineClass(MockDrone, {
    badConnectionAction() {
        const context = droneContexts.get(this.id);
        const badConnectionContext = context[DroneContext.BAD_CONNECTION];
        context[DroneContext.BAD_CONNECTION] = { ...badConnectionContext, messageSent: true };
        return { id: this.id, action: 'returnBase' };
    }
});

L6.refineClass(MockDrone, {
    badConnectionAction() {
        const context = droneContexts.get(this.id);
        const badConnectionContext = context[DroneContext.BAD_CONNECTION];
        context[DroneContext.BAD_CONNECTION] = { ...badConnectionContext, messageSent: true };
        return { id: this.id, action: 'seekConnection' };
    }
});

module.exports = { L1, L3, L4, L5, L6 };
