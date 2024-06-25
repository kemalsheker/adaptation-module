// mockDrone.js
class MockDrone {
    setSafeLanding() {
      return JSON.stringify({ action: 'SafeLandingFalse' });
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
  
  module.exports = MockDrone;
  