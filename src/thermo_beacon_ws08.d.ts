declare module "thermo_beacon_ws08" {
  export default class ThermoBeaconWS08 {
    constructor(
      macAddr: string,
      path: string,
      callback: (error: Error, value: ThermoBeaconWs08Reading) => void
    );
  }

  export interface ThermoBeaconWs08Reading {
    te: number;
    hu: number;
    bt: number;
  }
}
