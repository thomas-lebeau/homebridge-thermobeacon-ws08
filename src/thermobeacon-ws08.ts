import ThermoBeaconWS08, { ThermoBeaconWs08Reading } from "thermo_beacon_ws08";
import { join } from "path";

const path = join(__dirname, "../node_modules/thermo_beacon_ws08/");

const MAX_RETRY = 0;
const RETRY_DELAY = 300;

export function read(
  macAddr: string,
  retry = MAX_RETRY
): Promise<ThermoBeaconWs08Reading | null> {
  return new Promise((resolve, reject) => {
    try {
      new ThermoBeaconWS08(macAddr, path, (error, value) => {
        if (error) {
          reject(error);
        }

        if (!value && retry > 0) {
          setTimeout(() => resolve(read(macAddr, retry - 1)), RETRY_DELAY);
        }

        resolve(value);
      });
    } catch (error) {
      resolve(null);
    }
  });
}
