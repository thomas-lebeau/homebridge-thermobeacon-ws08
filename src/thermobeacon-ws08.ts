import noble from "@abandonware/noble";

export type ThermoBeaconWs08Reading = {
  temperature?: number;
  humidity?: number;
  battery?: number;
};

type Offset = [Offset: number, ByteLength: number];

const SCAN_TIMEOUT = 2000;
const MSG_LENGTH = 20;

const BATTERY: Offset = [10, 2];
const TEMPERATURE: Offset = [12, 2];
const HUMIDITY: Offset = [14, 2];

let isInitialized;

async function init() {
  return new Promise((resolve) => {
    if (isInitialized) {
      resolve(null);
    }

    noble.on("stateChange", (state) => {
      if (state === "poweredOn") {
        resolve(null);
      }
    });
  });
}

async function getBuffer(address): Promise<Buffer> {
  await init();
  await noble.startScanningAsync();

  return new Promise((resolve) => {
    noble.on("discover", async (peripheral) => {
      if (peripheral.address.toUpperCase() === address.toUpperCase()) {
        await noble.stopScanningAsync();

        resolve(peripheral.advertisement.manufacturerData);
      }
    });

    setTimeout(async () => {
      noble.stopScanningAsync();

      resolve(Buffer.from([]));
    }, SCAN_TIMEOUT);
  });
}

export async function read(macAddr: string): Promise<ThermoBeaconWs08Reading> {
  const buf = await getBuffer(macAddr);

  if (buf.byteLength === MSG_LENGTH) {
    const temperature = buf.readIntLE(...TEMPERATURE) / 16;
    const humidity = buf.readIntLE(...HUMIDITY) / 16;

    const battery = (buf.readIntLE(...BATTERY) * 100) / 3400;

    return {
      temperature,
      humidity,
      battery,
    };
  }

  return {};
}
