import React from 'react';
import { Classroom } from '../types';
import { 
  Wind, 
  Zap, 
  Users, 
  Trash2, 
  Leaf, 
  AlertTriangle, 
  CheckCircle, 
  Gauge, 
  Flame,
  Sun
} from 'lucide-react';

interface BuildingOverviewCardsProps {
  classrooms: Classroom[];
  onSelectRoom: (roomId: string) => void;
}

export const BuildingOverviewCards: React.FC<BuildingOverviewCardsProps> = ({
  classrooms,
  onSelectRoom,
}) => {
  // Compute aggregated stats
  const totalRooms = classrooms.length;
  const occupiedRooms = classrooms.filter(c => c.isOccupied).length;
  
  const avgPm25 = (
    classrooms.reduce((acc, c) => acc + c.airQuality.pm25, 0) / (totalRooms || 1)
  ).toFixed(1);

  const avgAqi = Math.round(
    classrooms.reduce((acc, c) => acc + c.airQuality.aqi, 0) / (totalRooms || 1)
  );

  let activeLightsCount = 0;
  let activeAcsCount = 0;
  let totalPowerWatts = 0;

  classrooms.forEach(c => {
    c.lights.forEach(l => {
      if (l.isOn) {
        activeLightsCount++;
        totalPowerWatts += l.powerWatts;
      }
    });
    c.acs.forEach(a => {
      if (a.isOn) {
        activeAcsCount++;
        totalPowerWatts += a.powerWatts;
      }
    });
  });

  const totalPowerKw = (totalPowerWatts / 1000).toFixed(2);

  // Waste stats
  let totalBins = 0;
  let binsNeedingEmptying = 0;
  let totalWasteWeightKg = 0;

  classrooms.forEach(c => {
    c.bins.forEach(b => {
      totalBins++;
      totalWasteWeightKg += b.weightKg;
      if (b.fillLevel >= 80 || b.needsEmptying) {
        binsNeedingEmptying++;
      }
    });
  });

  // Energy waste rooms (empty room with lights/ac on)
  const wastefulRooms = classrooms.filter(c => c.energyEcoAlert);

  // AQI color status helper
  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return { label: 'ดีมาก (Excellent)', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (aqi <= 100) return { label: 'ปานกลาง (Moderate)', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { label: 'เริ่มมีผลกระทบ (Unhealthy)', color: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-200' };
  };

  const aqiStatus = getAqiColor(avgAqi);

  return (
    <section className="mb-6 space-y-4">
      {/* Wasteful Rooms Banner Alert */}
      {wastefulRooms.length > 0 && (
        <div className="p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 animate-bounce" />
            <div>
              <p className="text-xs sm:text-sm font-semibold text-amber-950">
                แจ้งเตือนพลังงานสูญเปล่า: พบ {wastefulRooms.length} ห้องเรียนที่ไม่มีผู้ใช้งานแต่เปิดไฟ/แอร์ทิ้งไว้
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {wastefulRooms.map(r => (
                  <button
                    key={r.id}
                    onClick={() => onSelectRoom(r.id)}
                    className="px-2 py-0.5 rounded text-[11px] bg-amber-100 hover:bg-amber-200 text-amber-900 font-mono border border-amber-300 cursor-pointer transition-colors shadow-2xs"
                  >
                    ห้อง {r.roomNumber} ({r.name.slice(0, 20)}...)
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Dust & Air Quality */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">คุณภาพอากาศเฉลี่ย</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-slate-900">{avgPm25}</span>
            <span className="text-xs text-slate-500">µg/m³ PM2.5</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-slate-600">ดัชนี AQI: <strong className="text-slate-900">{avgAqi}</strong></span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${aqiStatus.color} ${aqiStatus.bg} ${aqiStatus.border}`}>
              {aqiStatus.label}
            </span>
          </div>
        </div>

        {/* Card 2: Lighting & Air Conditioning Power */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-cyan-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">กำลังไฟและแอร์รวม</span>
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-200">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-cyan-700">{totalPowerKw}</span>
            <span className="text-xs text-slate-500">kW กำลังไฟใช้งาน</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>ไฟเปิดอยู่: <strong className="text-slate-900">{activeLightsCount} โซน</strong></span>
            <span>แอร์เปิดอยู่: <strong className="text-slate-900">{activeAcsCount} ตัว</strong></span>
          </div>
        </div>

        {/* Card 3: Classroom Occupancy & Schedule */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">สถานะการใช้ห้องเรียน</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono text-blue-700">{occupiedRooms} / {totalRooms}</span>
            <span className="text-xs text-slate-500">ห้องกำลังมีชั้นเรียน</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>ห้องว่างปัจจุบัน: <strong className="text-emerald-600">{totalRooms - occupiedRooms} ห้อง</strong></span>
            <span className="text-[10px] text-slate-500">ตรวจจับด้วย Motion IoT</span>
          </div>
        </div>

        {/* Card 4: Smart Waste & Bins */}
        <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ระบบถังขยะอัจฉริยะ</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
              <Trash2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-bold font-mono ${binsNeedingEmptying > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
              {binsNeedingEmptying}
            </span>
            <span className="text-xs text-slate-500">ถังต้องจัดเก็บเร่งด่วน</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
            <span>ขยะสะสม: <strong className="text-slate-900">{totalWasteWeightKg.toFixed(1)} กก.</strong></span>
            <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
              <Leaf className="w-3 h-3" /> แยก 4 ประเภท
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
