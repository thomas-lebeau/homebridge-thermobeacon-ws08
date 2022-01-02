import ThermoBeaconWS08 from "thermo_beacon_ws08";
import { join } from "path";
// eslint-disable-next-line no-undef
const path = join(__dirname, "../node_modules/thermo_beacon_ws08/");

const MAX_RETRY = 10;
const RETRY_DELAY = 100;

export interface ThermoBeaconWs08Reading {
  te: number;
  hu: number;
  bt: number;
}

export function read(
  macAddr: string,
  retry = MAX_RETRY
): Promise<ThermoBeaconWs08Reading | null> {
  return new Promise((resolve, reject) => {
    new ThermoBeaconWS08(macAddr, path, (error, value) => {
      if (error) {
        reject(error);
      }

      if (!value && retry > 0) {
        // eslint-disable-next-line no-undef
        setTimeout(() => resolve(read(macAddr, retry - 1)), RETRY_DELAY);
      }

      resolve(value);
    });
  });
}
