import { FakeGatoHistoryService } from "fakegato-history";
import { Service, PlatformAccessory } from "homebridge";

import { ThermobeaconWs08Platform } from "./platform";
import { read } from "./thermobeacon-ws08";

const LOW_BATTERY = 10; // 10%
const UPDATE_INTERVAL = 1000 * 60; // 1 minute

export interface ThermobeaconWs08SensorConfig {
  name: string;
  macAddress: string;
}

export interface ThermobeaconWs08Config {
  sensors: ThermobeaconWs08SensorConfig[];
}

export class ThermobeaconWs08Accessory {
  private thermometer: Service;
  private history: FakeGatoHistoryService;
  private hygrometer: Service;
  private battery: Service;

  constructor(
    private readonly platform: ThermobeaconWs08Platform,
    private readonly accessory: PlatformAccessory<ThermobeaconWs08SensorConfig>
  ) {
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)
      ?.setCharacteristic(
        this.platform.Characteristic.Manufacturer,
        "Sensor Blue"
      )
      .setCharacteristic(
        this.platform.Characteristic.Model,
        "ThermoBeacon ws08"
      )
      .setCharacteristic(
        this.platform.Characteristic.SerialNumber,
        this.accessory.context.macAddress
      );

    this.thermometer =
      this.accessory.getService(this.platform.Service.TemperatureSensor) ||
      this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.hygrometer =
      this.accessory.getService(this.platform.Service.HumiditySensor) ||
      this.accessory.addService(this.platform.Service.HumiditySensor);

    this.battery =
      this.accessory.getService(this.platform.Service.Battery) ||
      this.accessory.addService(this.platform.Service.Battery);

    this.history = new this.platform.FakeGatoHistoryService(
      "weather",
      this.accessory,
      {
        storage: "fs",
        log: this.platform.log,
      }
    );

    for (const service of [this.thermometer, this.hygrometer, this.battery]) {
      service.setCharacteristic(
        this.platform.Characteristic.Name,
        this.accessory.displayName
      );
    }

    this._update();

    setInterval(this._update.bind(this), UPDATE_INTERVAL);
  }

  async _update() {
    let result;

    try {
      result = (await read(this.accessory.context.macAddress)) ?? {};
    } catch (error) {
      this.platform.log.debug(error as string);
      return;
    }

    const { te, hu, bt } = result;

    if (!te || !hu || !bt) {
      for (const service of [this.thermometer, this.hygrometer]) {
        this.platform.log.warn(
          "[%s] Unable to read the sensor",
          this.accessory.displayName
        );

        service.updateCharacteristic(
          this.platform.Characteristic.StatusFault,
          this.platform.Characteristic.StatusFault.GENERAL_FAULT
        );
      }

      return;
    }

    this.platform.log.info(
      "[%s] Temperature: %s°C, Humidity: %s%, Battery %s%",
      this.accessory.displayName,
      te,
      hu,
      bt
    );

    this.thermometer.updateCharacteristic(
      this.platform.Characteristic.CurrentTemperature,
      te
    );

    this.hygrometer.updateCharacteristic(
      this.platform.Characteristic.CurrentRelativeHumidity,
      hu
    );

    this.battery.updateCharacteristic(
      this.platform.Characteristic.BatteryLevel,
      bt
    );

    this.history.addEntry({
      time: Math.round(new Date().valueOf() / 1000),
      temp: te,
      humidity: hu,
    });

    for (const service of [this.thermometer, this.hygrometer]) {
      service.updateCharacteristic(
        this.platform.Characteristic.StatusFault,
        this.platform.Characteristic.StatusFault.NO_FAULT
      );
    }

    for (const service of [this.thermometer, this.hygrometer, this.battery]) {
      service.updateCharacteristic(
        this.platform.Characteristic.StatusLowBattery,
        bt <= LOW_BATTERY
          ? this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
          : this.platform.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
      );
    }
  }
}
