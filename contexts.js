class DroneContext {
    constructor() {
      this.safeLanding = false;
      this.groundSearch = false;
      this.emergencyLanding = false;
      this.glide = false;
      this.landing = false;
      this.returnBase = false;
      this.seekConnection = false;
    }
}


class BatteryContext {
    constructor() {
      this.lowBattery = false;
    }
}

class Antenna {
    constructor() {
      this.badConnection = false;
      this.goodConnection = false;
    }
}



class EmergencyLanding {
    constructor() {
      this.emergencyLanding = false;
    }
}



