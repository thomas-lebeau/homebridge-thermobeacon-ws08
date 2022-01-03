declare module "fakegato-history" {
  import { API, Logger, PlatformAccessory, Service } from "homebridge";

  export default function createFakeGatoHistory(
    homebridge: API
  ): FakeGatoHistoryServiceContructable;

  interface FakeGatoHistoryServiceContructable {
    new (
      accessoryType: string,
      service: PlatformAccessory,
      optionalParams: Options
    ): FakeGatoHistoryService;
  }

  interface CustomEntry {
    time: number;
    temp: number;
    humidity: number;
  }

  interface Options {
    storage: string;
    log: Logger;
  }

  class FakeGatoHistoryService extends Service {
    addEntry(entry: CustomEntry): void;
  }
}
