const { droneContexts, initializeDroneContext } = require('./droneContext');
const { LayerableObjectTrait } = require('./node_modules/contextjs/lib/Layers');
const { layer, withLayers } = require('contextjs');




/**
 * MockDrone Class
 * 
 * This class represents a mock drone that can enable and disable layers, execute actions based on the active layers, and return actions that the drone should perform.
 * 
 * It extends the LayerableObjectTrait class to incorporate layer management functionality.
 * 
 * Usage:
 * This class is used to simulate the behavior of a drone with different layers that can be enabled or disabled. It logs the enabling and disabling of layers, and based on the active layers, it decides the actions the drone should take.
 */
class MockDrone extends LayerableObjectTrait{
  constructor(id) {
      super();
      this.id = id;
      this.activeLayer = new Set();
      initializeDroneContext(id);
  }


  enableLayer(layer) {
    if (this.activeLayer.has(layer)) {
        console.log("Layer " + layer + " is already enabled and cannot be enabled again");
    } else {
        console.log("Enable layer " + layer);
        this.activeLayer.add(layer);
    }
  }

  disableLayer(layer) {
    if (this.activeLayer.has(layer)) {
      console.log("Disable layer " + layer);
      this.activeLayer.delete(layer);
    } else {
      console.log("Layer " + layer + " is not active and cannot be disabled");
    }
  }

  getActiveLayers() {
    return Array.from(this.activeLayer);
  }

  activeLayers() {
    return this.getActiveLayers();
  }


  execute() {
    const layers = this.getActiveLayers();
    console.log("Active layers array: " + layers);
    const actions = [];
    if (layers.length > 0) {
        withLayers(layers, () => {
            // Execute layer-specific methods
            actions.push(this.setSafeLanding());
            actions.push(this.landing());
            actions.push(this.goDestinyAutomatic());
            actions.push(this.badConnectionAction());
        });
    } else {
        // Execute methods without any layer-specific context
        actions.push(this.setSafeLanding());
        actions.push(this.landing());
        actions.push(this.goDestinyAutomatic());
        actions.push(this.badConnectionAction());
    }
    return actions;
  }



    setSafeLanding() {
        return { id: this.id, action: 'SafeLandingFalse' };
    }
  
    landing() {
        return { id: this.id, action: 'NoOverrideLanding' };
    }
  
    goDestinyAutomatic() {
        return { id: this.id, action: 'GoDestinyAutomatic' };
    }
  
    badConnectionAction() {
        return { id: this.id, action: 'noBadConnection' };
    }
    
}

module.exports = MockDrone;

  