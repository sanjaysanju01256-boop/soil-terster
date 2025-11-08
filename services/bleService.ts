import { SensorData } from '../types';

const DEVICE_NAME = "SOIL-ESP32";
const SOIL_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const SOIL_CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";

// FIX: Use 'any' for Web Bluetooth API types as they are not available in the TS environment.
let gattServer: any | null = null;
let soilCharacteristic: any | null = null;

export const isBluetoothAvailable = (): boolean => 'bluetooth' in navigator;

interface BleServiceHandlers {
  onData: (data: SensorData) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const connectToDevice = async (handlers: BleServiceHandlers): Promise<void> => {
  try {
    console.log("Requesting Bluetooth device...");
    // FIX: Use 'any' to access navigator.bluetooth
    const device = await (navigator as any).bluetooth.requestDevice({
      filters: [{ name: DEVICE_NAME }],
      optionalServices: [SOIL_SERVICE_UUID],
    });

    device.addEventListener('gattserverdisconnected', handlers.onDisconnect);

    console.log("Connecting to GATT Server...");
    gattServer = await device.gatt.connect();
    handlers.onConnect();

    console.log("Getting Service...");
    const service = await gattServer.getPrimaryService(SOIL_SERVICE_UUID);

    console.log("Getting Characteristic...");
    soilCharacteristic = await service.getCharacteristic(SOIL_CHARACTERISTIC_UUID);

    soilCharacteristic.addEventListener('characteristicvaluechanged', (event: Event) => {
      handleCharacteristicValueChanged(event, handlers.onData);
    });

    await soilCharacteristic.startNotifications();
    console.log("Notifications started.");

  } catch (error) {
    console.error("Bluetooth connection failed:", error);
    throw error;
  }
};

export const disconnectFromDevice = (): void => {
  if (gattServer && gattServer.connected) {
    gattServer.disconnect();
    gattServer = null;
    soilCharacteristic = null;
    console.log("Device disconnected.");
  }
};

const handleCharacteristicValueChanged = (event: Event, onData: (data: SensorData) => void) => {
  // FIX: Use 'any' for event.target as BluetoothRemoteGATTCharacteristic is not available.
  const target = event.target as any;
  const value = target.value;
  if (!value) return;

  try {
    const textDecoder = new TextDecoder('utf-8');
    const jsonString = textDecoder.decode(value);
    const parsedData = JSON.parse(jsonString);

    // Validate data ranges
    const validatedData: SensorData = {
      ts: parsedData.ts || Date.now() / 1000,
      ph: Math.min(14, Math.max(0, parsedData.ph || 0)),
      moisture: Math.min(100, Math.max(0, parsedData.moisture || 0)),
      temperature: Math.min(60, Math.max(-10, parsedData.temperature || 0)),
      battery: Math.min(100, Math.max(0, parsedData.battery || 0)),
    };
    
    onData(validatedData);
  } catch (error) {
    console.error("Failed to parse BLE data:", error);
  }
};