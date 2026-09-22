import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Leaf, 
  Activity, 
  Clock, 
  ZapOff, 
  RotateCcw, 
  Building2, 
  CheckCircle2, 
  Radio
} from 'lucide-react';

interface HeaderProps {
  isSimulationActive: boolean;
  onToggleSimulation: () => void;
  onEmergencyEcoAll: () => void;
  onResetDefaults: () => void;
  energyWasteCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isSimulationActive,
  onToggleSimulation,
  onEmergencyEcoAll,
  onResetDefaults,
  energyWasteCount,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('th-TH', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo & Headline */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <Leaf className="w-6 h-6 text-emerald-600 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Smart Campus IoT
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSimulationActive ? 'bg-emerald-500' : 'bg-slate-400'} opacity-75`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulationActive ? 'bg-emerald-600' : 'bg-slate-400'}`}></span>
                  </span>
                  {isSimulationActive ? 'เซ็นเซอร์เชื่อมต่อสด (Live Telemetry)' : 'หยุดจำลองสัญญาณ'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Innovating Classrooms for a Sustainable Future
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                ระบบจัดการห้องเรียนอัจฉริยะ: ตรวจวัดฝุ่น PM2.5 • ควบคุมไฟและแอร์ • ตารางเรียน • ถังขยะอัจฉริยะ
              </p>
            </div>
          </div>

          {/* Right Action Bar: Clock, Live Simulation, Eco Quick Controls */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Clock badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-mono font-bold text-emerald-700">{currentTime}</span>
                <span className="text-[10px] text-slate-500">{currentDate}</span>
              </div>
            </div>

            {/* Live Simulation Button */}
            <button
              id="btn-toggle-simulation"
              onClick={onToggleSimulation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isSimulationActive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="จำลองค่าเซ็นเซอร์แบบเรียลไทม์ เช่น ค่าฝุ่น ระดับขยะ และการตรวจจับความเคลื่อนไหว"
            >
              <Radio className={`w-3.5 h-3.5 ${isSimulationActive ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span>{isSimulationActive ? 'Live Stream: เปิด' : 'Live Stream: ปิด'}</span>
            </button>

            {/* Eco Off Wasteful Rooms Button */}
            {energyWasteCount > 0 && (
              <button
                id="btn-eco-all"
                onClick={onEmergencyEcoAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-all cursor-pointer shadow-xs animate-pulse"
                title="ปิดไฟและแอร์ในห้องที่ไม่มีผู้ใช้งานอัตโนมัติทันที"
              >
                <ZapOff className="w-3.5 h-3.5 text-amber-600" />
                <span>ปิดพลังงานห้องว่าง ({energyWasteCount})</span>
              </button>
            )}

            {/* Reset button */}
            <button
              id="btn-reset-data"
              onClick={onResetDefaults}
              className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 transition-colors cursor-pointer shadow-xs"
              title="รีเซ็ตข้อมูลเซ็นเซอร์สู่ค่าเริ่มต้น"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
