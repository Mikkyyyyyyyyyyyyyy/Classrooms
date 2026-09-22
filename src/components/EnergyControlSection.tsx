import React from 'react';
import { Classroom, LightZone, AcUnit } from '../types';
import { EnergyBarChart7Days } from './EnergyBarChart7Days';
import { 
  Lightbulb, 
  Snowflake, 
  Zap, 
  Power, 
  Sliders, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Leaf, 
  Thermometer,
  ShieldAlert,
  Flame,
  Gauge
} from 'lucide-react';

interface EnergyControlSectionProps {
  classroom: Classroom;
  onToggleLight: (zoneId: string) => void;
  onUpdateLightDim: (zoneId: string, dimLevel: number) => void;
  onToggleAc: (acId: string) => void;
  onUpdateAcTemp: (acId: string, temp: number) => void;
  onUpdateAcMode: (acId: string, mode: 'cool' | 'eco' | 'fan' | 'dry') => void;
  onTurnOffAllRoomEnergy: () => void;
  onTurnOnEcoMode: () => void;
}

export const EnergyControlSection: React.FC<EnergyControlSectionProps> = ({
  classroom,
  onToggleLight,
  onUpdateLightDim,
  onToggleAc,
  onUpdateAcTemp,
  onUpdateAcMode,
  onTurnOffAllRoomEnergy,
  onTurnOnEcoMode,
}) => {
  // Current room power computation
  const totalLightPower = classroom.lights.reduce((acc, l) => acc + (l.isOn ? l.powerWatts : 0), 0);
  const totalAcPower = classroom.acs.reduce((acc, a) => acc + (a.isOn ? a.powerWatts : 0), 0);
  const currentRoomPowerWatts = totalLightPower + totalAcPower;
  const currentRoomPowerKw = (currentRoomPowerWatts / 1000).toFixed(2);

  const activeLightsCount = classroom.lights.filter(l => l.isOn).length;
  const activeAcsCount = classroom.acs.filter(a => a.isOn).length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                ระบบเช็คสถานะและควบคุม ไฟ-เครื่องปรับอากาศ (Smart Lighting & HVAC)
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                {currentRoomPowerKw} kW กำลังไฟฟ้าห้องนี้
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ควบคุม IoT แยกรายโซน และระบบ Smart Sensor ปิดอัตโนมัติเมื่อห้องว่างเพื่อความยั่งยืน
            </p>
          </div>
        </div>

        {/* Global Room Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-room-eco-mode"
            onClick={onTurnOnEcoMode}
            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="ปรับแอร์เป็นโหมด Eco 25°C และหรี่ไฟลง 20% เพื่อประหยัดพลังงาน"
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>เปิดโหมดประหยัด (Eco 25°C)</span>
          </button>

          <button
            id="btn-room-turn-off-all"
            onClick={onTurnOffAllRoomEnergy}
            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="ปิดไฟและแอร์ทั้งหมดในห้องนี้ทันที"
          >
            <Power className="w-3.5 h-3.5 text-red-600" />
            <span>ปิดไฟ & แอร์ทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* Energy Waste Warning if Room is empty but equipment is on */}
      {classroom.energyEcoAlert && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                ตรวจพบการใช้พลังงานสูญเปล่า (Energy Waste Alert!)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                เซ็นเซอร์ Motion ไม่พบความเคลื่อนไหวมาแล้ว {classroom.lastMotionTime} แต่ไฟ ({activeLightsCount} โซน) และแอร์ ({activeAcsCount} ตัว) ยังเปิดทำงานอยู่
              </p>
            </div>
          </div>
          <button
            onClick={onTurnOffAllRoomEnergy}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition-all cursor-pointer shadow-xs"
          >
            กดเพื่อปิดพลังงานทันที
          </button>
        </div>
      )}

      {/* 7-Day Energy Consumption Bar Chart (Recharts) */}
      <EnergyBarChart7Days classroom={classroom} />

      {/* Two Column Grid: Lighting Control Left, Air Conditioning Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT: Smart Lighting Control */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-bold text-slate-900">
                ระบบไฟฟ้าแสงสว่างแยกโซน (Smart Lighting)
              </h4>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              เปิด {activeLightsCount} / {classroom.lights.length} โซน ({totalLightPower} W)
            </span>
          </div>

          <div className="space-y-2.5">
            {classroom.lights.map((zone) => (
              <div 
                key={zone.id}
                className={`p-3 rounded-xl border transition-all ${
                  zone.isOn
                    ? 'bg-white border-amber-300 shadow-2xs ring-1 ring-amber-400/20'
                    : 'bg-white/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${zone.isOn ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-400'}`}>
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">{zone.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {zone.isOn ? `กำลังไฟ: ${zone.powerWatts} วัตต์` : 'ปิดอยู่ (0W)'}
                      </span>
                    </div>
                  </div>

                  {/* Power Toggle Switch */}
                  <button
                    id={`btn-toggle-light-${zone.id}`}
                    onClick={() => onToggleLight(zone.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      zone.isOn
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{zone.isOn ? 'เปิดอยู่' : 'ปิดอยู่'}</span>
                  </button>
                </div>

                {/* Dimmer Slider */}
                {zone.isOn && (
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                    <span className="text-[10px] text-slate-500 font-medium w-16">ความสว่าง:</span>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      step="5"
                      value={zone.dimLevel}
                      onChange={(e) => onUpdateLightDim(zone.id, parseInt(e.target.value))}
                      className="flex-1 accent-amber-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                    />
                    <span className="text-xs font-mono font-bold text-amber-700 w-9 text-right">
                      {zone.dimLevel}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Air Conditioning HVAC Control */}
        <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Snowflake className="w-4 h-4 text-cyan-600" />
              <h4 className="text-sm font-bold text-slate-900">
                ระบบเครื่องปรับอากาศ (Smart AC / HVAC)
              </h4>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              เปิด {activeAcsCount} / {classroom.acs.length} เครื่อง ({totalAcPower} W)
            </span>
          </div>

          <div className="space-y-3">
            {classroom.acs.map((ac) => (
              <div 
                key={ac.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  ac.isOn
                    ? 'bg-white border-cyan-300 shadow-2xs ring-1 ring-cyan-400/20'
                    : 'bg-white/60 border-slate-200 opacity-60'
                }`}
              >
                {/* Title & Toggle */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl ${ac.isOn ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-200 text-slate-400'}`}>
                      <Snowflake className={`w-4 h-4 ${ac.isOn ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{ac.name}</h5>
                      <span className="text-[10px] text-slate-500">
                        {ac.isOn ? `กำลังไฟ: ${ac.powerWatts} วัตต์ | อุณหภูมิจริง: ${ac.currentTemp}°C` : 'ปิดการทำงาน'}
                      </span>
                    </div>
                  </div>

                  <button
                    id={`btn-toggle-ac-${ac.id}`}
                    onClick={() => onToggleAc(ac.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      ac.isOn
                        ? 'bg-cyan-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{ac.isOn ? 'เปิดอยู่' : 'ปิดอยู่'}</span>
                  </button>
                </div>

                {ac.isOn && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    {/* Temperature Control Stepper */}
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-xs text-slate-700 font-medium">ตั้งอุณหภูมิห้อง:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateAcTemp(ac.id, Math.max(20, ac.setTemp - 1))}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-bold flex items-center justify-center cursor-pointer shadow-2xs"
                        >
                          -
                        </button>
                        <span className="text-lg font-mono font-bold text-cyan-700 w-12 text-center">
                          {ac.setTemp}°C
                        </span>
                        <button
                          onClick={() => onUpdateAcTemp(ac.id, Math.min(28, ac.setTemp + 1))}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-bold flex items-center justify-center cursor-pointer shadow-2xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Mode selection buttons */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">โหมดการทำงาน:</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onUpdateAcMode(ac.id, 'eco')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            ac.mode === 'eco'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Eco 25°
                        </button>
                        <button
                          onClick={() => onUpdateAcMode(ac.id, 'cool')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            ac.mode === 'cool'
                              ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Cool
                        </button>
                        <button
                          onClick={() => onUpdateAcMode(ac.id, 'dry')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                            ac.mode === 'dry'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Dry
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
