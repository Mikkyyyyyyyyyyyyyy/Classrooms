import React from 'react';
import { Classroom, AirQualityData } from '../types';
import { 
  Wind, 
  ShieldCheck, 
  AlertTriangle, 
  Thermometer, 
  Droplets, 
  Fan, 
  Activity, 
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

interface AirQualitySectionProps {
  classroom: Classroom;
  onUpdateAirPurifier: (status: 'auto' | 'on' | 'off', speed: 1 | 2 | 3 | 'turbo') => void;
}

export const AirQualitySection: React.FC<AirQualitySectionProps> = ({
  classroom,
  onUpdateAirPurifier,
}) => {
  const aq = classroom.airQuality;

  // Evaluation status
  const getPm25Status = (val: number) => {
    if (val <= 15) return { label: 'อากาศดีมาก (Excellent)', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', desc: 'คุณภาพอากาศสะอาดบริสุทธิ์ ปลอดภัยสำหรับกิจกรรมการเรียนรู้ทุกประเภท' };
    if (val <= 25) return { label: 'อากาศดี (Good)', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200', desc: 'คุณภาพอากาศอยู่ในเกณฑ์ดี สามารถทำกิจกรรมในห้องเรียนได้ตามปกติ' };
    if (val <= 37.5) return { label: 'ปานกลาง (Moderate)', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200', desc: 'เริ่มมีฝุ่นสะสม แนะนำให้ปิดหน้าต่างและเปิดเครื่องฟอกอากาศ' };
    if (val <= 75) return { label: 'เริ่มมีผลกระทบต่อสุขภาพ (Unhealthy)', color: 'text-orange-800', bg: 'bg-orange-50', border: 'border-orange-200', desc: 'ระดับฝุ่นเกินมาตรฐาน! ระบบเปิดเครื่องฟอกอากาศอัตโนมัติความเร็วสูง' };
    return { label: 'อันตราย (Hazardous)', color: 'text-red-800', bg: 'bg-red-50', border: 'border-red-200', desc: 'ระดับฝุ่นอันตราย หลีกเลี่ยงกิจกรรมและเปิดเครื่องฟอกระดับสูงสุด' };
  };

  const status = getPm25Status(aq.pm25);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                ระบบตรวจวัดคุณภาพอากาศและฝุ่น (Air Quality & Dust Telemetry)
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${status.color} ${status.bg} ${status.border}`}>
                {status.label}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ตรวจวัดด้วยเซ็นเซอร์เลเซอร์ Optical Particle Counter (PM2.5 / PM10 / CO2 / Temp)
            </p>
          </div>
        </div>

        {/* Air Purifier Smart Control Badge */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-700">
            <Fan className={`w-4 h-4 text-cyan-600 ${aq.airPurifierStatus !== 'off' ? 'animate-spin' : ''}`} style={{ animationDuration: aq.airPurifierSpeed === 'turbo' ? '0.7s' : '2s' }} />
            <span className="font-semibold">เครื่องฟอกอากาศ:</span>
          </div>
          
          {/* Mode switch */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs shadow-2xs">
            <button
              onClick={() => onUpdateAirPurifier('auto', 2)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                aq.airPurifierStatus === 'auto'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Auto AI
            </button>
            <button
              onClick={() => onUpdateAirPurifier('on', 'turbo')}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                aq.airPurifierStatus === 'on'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Turbo ON
            </button>
            <button
              onClick={() => onUpdateAirPurifier('off', 1)}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                aq.airPurifierStatus === 'off'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ปิด
            </button>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 my-5">
        {/* PM2.5 Metric */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90 relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>ฝุ่น PM2.5</span>
            <span className="text-[10px] text-slate-400 font-mono">µg/m³</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-mono font-bold ${status.color}`}>
              {aq.pm25}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-1 font-medium">
            <span>เกณฑ์ไทย: ≤ 37.5</span>
          </div>
        </div>

        {/* PM10 Metric */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>ฝุ่น PM10</span>
            <span className="text-[10px] text-slate-400 font-mono">µg/m³</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
              {aq.pm10}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 font-medium">
            <span>เกณฑ์: ≤ 50</span>
          </div>
        </div>

        {/* AQI Index */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>ดัชนี AQI</span>
            <span className="text-[10px] text-slate-400 font-mono">Index</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-teal-700">
              {aq.aqi}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-emerald-700 font-semibold">
            <span>มาตรฐาน ปลอดภัย</span>
          </div>
        </div>

        {/* CO2 Concentration */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>ก๊าซ CO₂ ในห้อง</span>
            <span className="text-[10px] text-slate-400 font-mono">ppm</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className={`text-2xl sm:text-3xl font-mono font-bold ${aq.co2 > 1000 ? 'text-amber-700' : 'text-slate-900'}`}>
              {aq.co2}
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 font-medium">
            <span>{aq.co2 > 1000 ? 'ถ่ายเทอากาศด่วน' : 'อากาศสดชื่น'}</span>
          </div>
        </div>

        {/* Temperature */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>อุณหภูมิห้อง</span>
            <Thermometer className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
              {aq.temperature}°C
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 font-medium">
            <span>สบาย (Thermal Comfort)</span>
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/90">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span>ความชื้นสัมพัทธ์</span>
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-mono font-bold text-slate-900">
              {aq.humidity}%
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 font-medium">
            <span>ความชื้นเหมาะสม 45-60%</span>
          </div>
        </div>
      </div>

      {/* Chart: 24h Hourly Dust & AQI Trend */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800">
              กราฟความเข้มข้นของฝุ่นตลอดทั้งวัน (Hourly Dust Trend - 08:00 ถึง 15:00)
            </h4>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>PM2.5 (µg/m³)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block" />
              <span>PM10</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-0.5 border-b-2 border-dashed border-red-500 inline-block" />
              <span>เกณฑ์ควบคุม (37.5)</span>
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={aq.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pm25Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="pm10Gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 'dataMax + 15']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  borderColor: '#e2e8f0', 
                  borderRadius: '0.75rem',
                  color: '#0f172a',
                  fontSize: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }} 
              />
              <ReferenceLine y={37.5} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'มาตรฐาน 37.5', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }} />
              <Area type="monotone" dataKey="pm25" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#pm25Gradient)" name="PM2.5" />
              <Area type="monotone" dataKey="pm10" stroke="#0891b2" strokeWidth={1.5} fillOpacity={1} fill="url(#pm10Gradient)" name="PM10" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Health Recommendation Footer */}
        <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-900">คำแนะนำสุขภาพประจำห้อง: </span>
            <span>{status.desc}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
