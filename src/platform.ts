import {
  API,
  DynamicPlatformPlugin,
  Logger,
  PlatformAccessory,
  PlatformConfig,
  Service,
  Characteristic,
} from "homebridge";
import createFakeGatoHistory from "fakegato-history";

import { PLATFORM_NAME, PLUGIN_NAME } from "./settings";
import {
  ThermobeaconWs08Accessory,
  ThermobeaconWs08SensorConfig,
} from "./platformAccessory";

export class ThermobeaconWs08Platform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic =
    this.api.hap.Characteristic;
  public readonly FakeGatoHistoryService = createFakeGatoHistory(this.api);

  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API
  ) {
    this.log.debug("Finished initializing platform:", this.config.name);

    this.api.on("didFinishLaunching", () => {
      log.debug("Executed didFinishLaunching callback");

      this.discoverDevices();
    });
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info("Loading accessory from cache:", accessory.displayName);

    this.accessories.push(accessory);
  }

  discoverDevices() {
    const devices = this.config.sensors;

    for (const device of devices) {
      const uuid = this.api.hap.uuid.generate(device.macAddr);

      const existingAccessory = this.accessories.find(
        (accessory) => accessory.UUID === uuid
      ) as PlatformAccessory<ThermobeaconWs08SensorConfig>;

      if (existingAccessory) {
        this.log.info(
          "Restoring existing accessory from cache:",
          existingAccessory.displayName
        );

        new ThermobeaconWs08Accessory(this, existingAccessory);
      } else {
        this.log.info("Adding new accessory:", device.displayName);

        const accessory = new this.api.platformAccessory(
          device.displayName,
          uuid
        ) as PlatformAccessory<ThermobeaconWs08SensorConfig>;

        accessory.context = device;

        new ThermobeaconWs08Accessory(this, accessory);

        this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [
          accessory,
        ]);
      }
    }
  }
}
