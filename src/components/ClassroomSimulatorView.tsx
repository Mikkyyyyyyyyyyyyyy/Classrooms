import React, { useState } from 'react';
import { Classroom } from '../types';
import { 
  Lightbulb, 
  Snowflake, 
  Wind, 
  Trash2, 
  Users, 
  UserCheck, 
  Radio, 
  Eye, 
  Sparkles, 
  Tv, 
  DoorClosed, 
  Maximize2, 
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

interface ClassroomSimulatorViewProps {
  classroom: Classroom;
  onToggleLight: (zoneId: string) => void;
  onToggleAc: (acId: string) => void;
  onUpdateAirPurifier: (status: 'auto' | 'on' | 'off', speed: 1 | 2 | 3 | 'turbo') => void;
  onEmptyBin: (binId: string) => void;
}

export const ClassroomSimulatorView: React.FC<ClassroomSimulatorViewProps> = ({
  classroom,
  onToggleLight,
  onToggleAc,
  onUpdateAirPurifier,
  onEmptyBin,
}) => {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  // Lights map
  const frontLight = classroom.lights.find(l => l.id === 'l1') || classroom.lights[0];
  const midLight = classroom.lights.find(l => l.id === 'l2') || classroom.lights[1] || classroom.lights[0];
  const backLight = classroom.lights.find(l => l.id === 'l3') || classroom.lights[2] || classroom.lights[0];

  // ACs
  const ac1 = classroom.acs[0];
  const ac2 = classroom.acs[1] || classroom.acs[0];

  // Air purifier
  const aq = classroom.airQuality;

  // Seating grid representation (3 rows x 4 desks)
  const deskCount = 12;
  const occupiedDesks = Math.min(deskCount, Math.ceil((classroom.occupancyCount / (classroom.capacity || 40)) * deskCount));

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                โมเดลจำลองห้องเรียนเสมือนจริง (Interactive Classroom Simulation)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Digital Twin Room {classroom.roomNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              แผนผังจำลองตำแหน่งอุปกรณ์ IoT: โคมไฟแยกโซน, แอร์, เครื่องฟอกอากาศ, ที่นั่งนักเรียน, และสถานีถังขยะ (คลิกที่อุปกรณ์เพื่อควบคุมได้โดยตรง)
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/70">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block ring-2 ring-amber-200" />
            <span>ไฟเปิด</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block ring-2 ring-cyan-200" />
            <span>แอร์เปิด</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-200" />
            <span>ฟอกอากาศ</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block ring-2 ring-blue-200" />
            <span>ที่นั่งมีผู้เรียน</span>
          </span>
        </div>
      </div>

      {/* Classroom Simulation Canvas Area */}
      <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-50 via-slate-100/70 to-slate-50 border-2 border-slate-300/80 p-4 sm:p-7 shadow-inner overflow-hidden min-h-[520px]">
        {/* Wall Perimeter Labels */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
          กระดานอัจฉริยะ & หน้าห้องเรียน (Front of Classroom)
        </div>

        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold tracking-widest text-slate-400 bg-white/80 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
          ด้านหลังห้องเรียน (Rear of Classroom)
        </div>

        {/* --- North Wall: AC 1 --- */}
        {ac1 && (
          <div className="absolute top-12 left-4 sm:left-10 z-20">
            <button
              onClick={() => onToggleAc(ac1.id)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                ac1.isOn
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-900 ring-2 ring-cyan-200'
                  : 'bg-white border-slate-300 text-slate-400 opacity-75'
              }`}
              title={`แอร์ ${ac1.name} (คลิกเปิด/ปิด)`}
            >
              <Snowflake className={`w-4 h-4 ${ac1.isOn ? 'text-cyan-600 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '4s' }} />
              <div className="text-left">
                <div className="text-[11px] font-bold leading-tight">แอร์ 1 (North)</div>
                <div className="text-[10px] text-cyan-700 font-mono">
                  {ac1.isOn ? `${ac1.setTemp}°C • เปิด` : 'ปิดอยู่'}
                </div>
              </div>
            </button>
            {/* Airflow breeze effect animation */}
            {ac1.isOn && (
              <div className="mt-1 flex gap-1 pl-4 opacity-70">
                <span className="w-1.5 h-6 bg-gradient-to-b from-cyan-400 to-transparent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-300 to-transparent rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                <span className="w-1.5 h-5 bg-gradient-to-b from-cyan-400 to-transparent rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
              </div>
            )}
          </div>
        )}

        {/* --- South Wall: AC 2 (or Window area) --- */}
        {ac2 && (
          <div className="absolute top-12 right-4 sm:right-10 z-20">
            <button
              onClick={() => onToggleAc(ac2.id)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                ac2.isOn
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-900 ring-2 ring-cyan-200'
                  : 'bg-white border-slate-300 text-slate-400 opacity-75'
              }`}
              title={`แอร์ ${ac2.name} (คลิกเปิด/ปิด)`}
            >
              <Snowflake className={`w-4 h-4 ${ac2.isOn ? 'text-cyan-600 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '4s' }} />
              <div className="text-left">
                <div className="text-[11px] font-bold leading-tight">แอร์ 2 (South)</div>
                <div className="text-[10px] text-cyan-700 font-mono">
                  {ac2.isOn ? `${ac2.setTemp}°C • เปิด` : 'ปิดอยู่'}
                </div>
              </div>
            </button>
            {/* Airflow breeze effect animation */}
            {ac2.isOn && (
              <div className="mt-1 flex gap-1 pl-4 opacity-70">
                <span className="w-1.5 h-7 bg-gradient-to-b from-cyan-300 to-transparent rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                <span className="w-1.5 h-5 bg-gradient-to-b from-cyan-400 to-transparent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="w-1.5 h-8 bg-gradient-to-b from-cyan-300 to-transparent rounded-full animate-bounce" style={{ animationDelay: '500ms' }} />
              </div>
            )}
          </div>
        )}

        {/* --- FRONT OF ROOM: Interactive Smart Board & Teacher Podium --- */}
        <div className="max-w-md mx-auto mt-7 mb-6 z-10 relative">
          {/* Smart Board */}
          <div className="bg-slate-900 text-white rounded-xl p-3.5 border-4 border-slate-700 shadow-md relative overflow-hidden text-center">
            {/* Ambient light glow from front light zone */}
            {frontLight?.isOn && (
              <div className="absolute inset-0 bg-amber-400/10 pointer-events-none animate-pulse" />
            )}
            <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-1.5 mb-2">
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <Sparkles className="w-3 h-3" /> SMART BOARD 4K
              </span>
              <span className="font-mono">PM2.5: <strong className="text-white">{aq.pm25} µg/m³</strong></span>
            </div>
            <div className="text-xs sm:text-sm font-bold text-emerald-300 truncate">
              {classroom.schedule.find(s => s.isCurrent)?.subjectName || 'ยินดีต้อนรับสู่ห้องเรียนอัจฉริยะ'}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              ผู้สอน: {classroom.schedule.find(s => s.isCurrent)?.teacherName || 'ดร. ประจำห้อง'} • ระดับ {classroom.schedule.find(s => s.isCurrent)?.gradeLevel || 'ม.ปลาย'}
            </div>
          </div>

          {/* Teacher's Podium Desk & Front Light Fixture Control */}
          <div className="flex items-center justify-between mt-2.5 px-4">
            {/* Front Light Zone Switch */}
            {frontLight && (
              <button
                onClick={() => onToggleLight(frontLight.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer shadow-xs ${
                  frontLight.isOn
                    ? 'bg-amber-100 border-amber-300 text-amber-900 ring-2 ring-amber-200'
                    : 'bg-white border-slate-300 text-slate-500'
                }`}
              >
                <Lightbulb className={`w-3.5 h-3.5 ${frontLight.isOn ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>ไฟหน้าห้อง: {frontLight.isOn ? 'เปิด (80%)' : 'ปิด'}</span>
              </button>
            )}

            {/* Motion Sensor Beacon */}
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-medium border flex items-center gap-1.5 ${
              classroom.motionDetected
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-amber-50 border-amber-300 text-amber-700'
            }`}>
              <Radio className={`w-3 h-3 ${classroom.motionDetected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
              <span>{classroom.motionDetected ? 'PIR ตรวจพบคน' : 'ไม่มีการเคลื่อนไหว'}</span>
            </div>
          </div>
        </div>

        {/* --- MIDDLE & REAR SEATING GRID: Student Desks Layout --- */}
        <div className="relative max-w-2xl mx-auto my-6 p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-sm">
          {/* Lighting fixtures overhead in middle and rear */}
          <div className="flex items-center justify-between mb-3 px-2 pb-2 border-b border-slate-100">
            {midLight && (
              <button
                onClick={() => onToggleLight(midLight.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  midLight.isOn
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
              >
                <Lightbulb className={`w-3.5 h-3.5 ${midLight.isOn ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>ไฟโซนกลาง: {midLight.isOn ? 'เปิด' : 'ปิด'}</span>
              </button>
            )}

            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>ที่นั่งผู้เรียน: <strong>{classroom.occupancyCount}</strong> / {classroom.capacity} คน</span>
            </span>

            {backLight && (
              <button
                onClick={() => onToggleLight(backLight.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                  backLight.isOn
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-slate-100 border-slate-200 text-slate-500'
                }`}
              >
                <Lightbulb className={`w-3.5 h-3.5 ${backLight.isOn ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>ไฟโซนหลัง: {backLight.isOn ? 'เปิด' : 'ปิด'}</span>
              </button>
            )}
          </div>

          {/* Desks Grid (4 Columns x 3 Rows) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
            {Array.from({ length: deskCount }).map((_, idx) => {
              const isOccupiedDesk = idx < occupiedDesks;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isOccupiedDesk
                      ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-xs'
                      : 'bg-slate-50/60 border-dashed border-slate-300 text-slate-400'
                  }`}
                >
                  {/* Desk Surface */}
                  <div className="w-12 h-3.5 bg-slate-300 rounded-sm mb-1.5 border border-slate-400/60 flex items-center justify-center">
                    <span className="text-[8px] font-mono text-slate-600">D-{idx + 1}</span>
                  </div>

                  {/* Student Icon / Seat */}
                  <div className="flex items-center gap-1">
                    <UserCheck className={`w-4 h-4 ${isOccupiedDesk ? 'text-blue-600' : 'text-slate-300'}`} />
                    <span className="text-[10px] font-medium">
                      {isOccupiedDesk ? 'มีผู้เรียน' : 'ว่าง'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- CORNER / REAR FLOOR: Air Purifier + Door + 4 Smart Waste Bins --- */}
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-4 mt-6 pt-4 border-t border-slate-200">
          {/* Air Purifier in Corner */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <button
              onClick={() => onUpdateAirPurifier(aq.airPurifierStatus === 'off' ? 'auto' : 'off', 2)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                aq.airPurifierStatus !== 'off'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-600 ring-2 ring-emerald-200'
                  : 'bg-slate-100 border-slate-300 text-slate-400'
              }`}
              title="คลิกสลับเปิด/ปิดเครื่องฟอกอากาศ"
            >
              <Wind className={`w-5 h-5 ${aq.airPurifierStatus !== 'off' ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
            </button>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800">เครื่องฟอกอากาศ (Air Purifier)</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                  aq.airPurifierStatus !== 'off' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {aq.airPurifierStatus === 'auto' ? 'Auto AI' : aq.airPurifierStatus === 'on' ? 'Turbo' : 'ปิด'}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                กรองฝุ่น HEPA H13 • PM2.5 ในห้อง {aq.pm25} µg/m³
              </div>
            </div>
          </div>

          {/* Smart Waste Station (Corner Doorway) */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-amber-500" />
                <span>สถานีถังขยะอัจฉริยะ 4 ถัง (หน้าประตูห้อง)</span>
              </span>
              <span className="text-[10px] text-slate-500">คลิกที่ถังเพื่อบันทึกเทขยะ</span>
            </div>

            {/* 4 Mini Bins in the Classroom Layout */}
            <div className="grid grid-cols-4 gap-2">
              {classroom.bins.map(bin => {
                const isAlert = bin.fillLevel >= 80;
                const binBg = 
                  bin.type === 'recycle' ? 'bg-blue-50 border-blue-300 text-blue-800' :
                  bin.type === 'general' ? 'bg-slate-100 border-slate-300 text-slate-800' :
                  bin.type === 'organic' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                  'bg-orange-50 border-orange-300 text-orange-800';

                return (
                  <button
                    key={bin.id}
                    onClick={() => onEmptyBin(bin.id)}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer relative group ${binBg} ${
                      isAlert ? 'ring-2 ring-red-400' : ''
                    }`}
                    title={`${bin.name} - คลิกเพื่อเคลียร์ขยะ`}
                  >
                    <div className="text-[10px] font-bold truncate">
                      {bin.type === 'recycle' ? 'รีไซเคิล' : bin.type === 'general' ? 'ทั่วไป' : bin.type === 'organic' ? 'อินทรีย์' : 'E-Waste'}
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xs font-mono font-bold">{bin.fillLevel}%</span>
                      {isAlert && <span className="text-[9px] text-red-600 font-bold">เต็ม!</span>}
                    </div>
                    {/* Micro bar */}
                    <div className="w-full h-1.5 bg-white/80 rounded-full mt-1 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${isAlert ? 'bg-red-500' : 'bg-current'}`} 
                        style={{ width: `${bin.fillLevel}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
