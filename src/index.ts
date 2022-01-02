import { API } from "homebridge";

import { PLATFORM_NAME } from "./settings";
import { ThermobeaconWs08Platform } from "./platform";

/**
 * This method registers the platform with Homebridge
 */
export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, ThermobeaconWs08Platform);
};
