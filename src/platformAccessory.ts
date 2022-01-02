import { Service, PlatformAccessory, CharacteristicValue } from "homebridge";

import { ThermobeaconWs08Platform } from "./platform";
import { read } from "./thermobeacon-ws08";

export interface ThermobeaconWs08Context {
  macAddr: string;
  displayName: string;
}

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class ThermobeaconWs08Accessory {
  private service: Service;

  /**
   * These are just used to create a working example
   * You should implement your own code to track the state of your accessory
   */
  private exampleStates = {
    On: false,
    Brightness: 100,
  };

  constructor(
    private readonly platform: ThermobeaconWs08Platform,
    private readonly accessory: PlatformAccessory<ThermobeaconWs08Context>
  ) {
    // set accessory information
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
        "Default-Serial"
      );

    this.service =
      this.accessory.getService(this.platform.Service.TemperatureSensor) ||
      this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.service.setCharacteristic(
      this.platform.Characteristic.Name,
      accessory.context.displayName
    );

    this.service
      .getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.onGet.bind(this));

    /**
     * Updating characteristics values asynchronously.
     *
     * Example showing how to update the state of a Characteristic asynchronously instead
     * of using the `on('get')` handlers.
     * Here we change update the motion sensor trigger states on and off every 10 seconds
     * the `updateCharacteristic` method.
     *
     */
    // let motionDetected = false;
    // setInterval(() => {
    //   // EXAMPLE - inverse the trigger
    //   motionDetected = !motionDetected;

    //   // push the new value to HomeKit
    //   motionSensorOneService.updateCharacteristic(
    //     this.platform.Characteristic.MotionDetected,
    //     motionDetected
    //   );
    //   motionSensorTwoService.updateCharacteristic(
    //     this.platform.Characteristic.MotionDetected,
    //     !motionDetected
    //   );

    //   this.platform.log.debug(
    //     "Triggering motionSensorOneService:",
    //     motionDetected
    //   );
    //   this.platform.log.debug(
    //     "Triggering motionSensorTwoService:",
    //     !motionDetected
    //   );
    // }, 10000);
  }

  /**
   * Handle the "GET" requests from HomeKit
   * These are sent when HomeKit wants to know the current state of the accessory, for example, checking if a Light bulb is on.
   *
   * GET requests should return as fast as possbile. A long delay here will result in
   * HomeKit being unresponsive and a bad user experience in general.
   *
   * If your device takes time to respond you should update the status of your device
   * asynchronously instead using the `updateCharacteristic` method instead.

   * @example
   * this.service.updateCharacteristic(this.platform.Characteristic.On, true)
   */
  async onGet(): Promise<CharacteristicValue> {
    // implement your own code to check if the device is on
    const { te } = (await read(this.accessory.context.macAddr)) ?? {};

    this.platform.log.debug("Get Characteristic CurrentTemperature ->", te);

    if (!te) {
      // if you need to return an error to show the device as "Not Responding" in the Home app:
      throw new this.platform.api.hap.HapStatusError(
        this.platform.api.hap.HAPStatus.SERVICE_COMMUNICATION_FAILURE
      );
    }

    return te;
  }
}
