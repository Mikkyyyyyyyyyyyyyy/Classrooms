export interface AirQualityData {
  pm25: number; // µg/m³
  pm10: number; // µg/m³
  aqi: number;
  co2: number; // ppm
  temperature: number; // °C
  humidity: number; // %
  airPurifierStatus: 'auto' | 'on' | 'off';
  airPurifierSpeed: 1 | 2 | 3 | 'turbo';
  statusLevel: 'excellent' | 'good' | 'moderate' | 'unhealthy' | 'hazardous';
  history: Array<{
    time: string;
    pm25: number;
    pm10: number;
    aqi: number;
  }>;
}

export interface LightZone {
  id: string;
  name: string;
  isOn: boolean;
  dimLevel: number; // 0-100%
  powerWatts: number;
}

export interface AcUnit {
  id: string;
  name: string;
  isOn: boolean;
  setTemp: number; // °C
  currentTemp: number; // °C
  mode: 'cool' | 'eco' | 'fan' | 'dry';
  fanSpeed: 'low' | 'medium' | 'high' | 'auto';
  powerWatts: number;
}

export interface ClassPeriod {
  id: string;
  periodNumber: number;
  timeStart: string;
  timeEnd: string;
  subjectCode: string;
  subjectName: string;
  teacherName: string;
  gradeLevel: string;
  studentCount: number;
  isCurrent?: boolean;
}

export type BinType = 'recycle' | 'general' | 'organic' | 'ewaste';

export interface SmartBin {
  id: string;
  type: BinType;
  name: string;
  fillLevel: number; // 0-100%
  capacityLiters: number;
  weightKg: number;
  lastEmptied: string;
  batteryLevel: number; // %
  needsEmptying: boolean;
}

export interface DailyEnergyUsage {
  date: string; // e.g. '15 ก.ย.'
  dayName: string; // e.g. 'จันทร์', 'อังคาร'
  acKwh: number; // kWh from Air Conditioning
  lightsKwh: number; // kWh from Lighting
  otherKwh: number; // other IoT equipment
  totalKwh: number; // total kWh
  targetKwh: number; // eco benchmark target
  costBaht: number; // estimated cost in THB (approx 4.5 THB/unit)
  carbonKg: number; // kgCO2e emissions
  isToday?: boolean;
}

export interface Classroom {
  id: string;
  roomNumber: string;
  name: string;
  floor: number;
  building: string;
  capacity: number;
  isOccupied: boolean;
  occupancyCount: number;
  motionDetected: boolean;
  lastMotionTime: string;
  energyEcoAlert: boolean; // Alert if lights/AC are ON but room is empty
  airQuality: AirQualityData;
  lights: LightZone[];
  acs: AcUnit[];
  schedule: ClassPeriod[];
  bins: SmartBin[];
  sustainabilityScore: number; // 0-100
  energyHistory7Days?: DailyEnergyUsage[];
}

export interface CampusOverviewStats {
  totalRooms: number;
  averagePm25: number;
  totalActiveLights: number;
  totalActiveAcs: number;
  totalCurrentPowerKw: number;
  occupiedRoomsCount: number;
  binsAlertCount: number;
  energyWasteAlertCount: number;
  carbonSavedKgToday: number;
}
