import React, { useState } from 'react';
import { Classroom, DailyEnergyUsage } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  Zap, 
  Calendar, 
  TrendingDown, 
  Leaf, 
  Coins, 
  Layers, 
  CheckCircle2,
  Info
} from 'lucide-react';

interface EnergyBarChart7DaysProps {
  classroom: Classroom;
}

// Generate fallback 7-day energy data if not pre-populated
export const getOrGenerate7DayEnergy = (classroom: Classroom): DailyEnergyUsage[] => {
  if (classroom.energyHistory7Days && classroom.energyHistory7Days.length === 7) {
    return classroom.energyHistory7Days;
  }

  // Base power factor from current equipment
  const lightWatts = classroom.lights.reduce((acc, l) => acc + l.powerWatts, 0);
  const acWatts = classroom.acs.reduce((acc, a) => acc + a.powerWatts, 0);
  const scale = Math.max(0.6, (lightWatts + acWatts) / 3000);

  const daysTemplate = [
    { dayName: 'จันทร์', date: '15 ก.ย.', baseAc: 18.2, baseLight: 3.8, isToday: false },
    { dayName: 'อังคาร', date: '16 ก.ย.', baseAc: 20.4, baseLight: 4.2, isToday: false },
    { dayName: 'พุธ', date: '17 ก.ย.', baseAc: 16.5, baseLight: 3.5, isToday: false },
    { dayName: 'พฤหัส', date: '18 ก.ย.', baseAc: 21.0, baseLight: 4.4, isToday: false },
    { dayName: 'ศุกร์', date: '19 ก.ย.', baseAc: 17.8, baseLight: 3.9, isToday: false },
    { dayName: 'เสาร์', date: '20 ก.ย.', baseAc: 4.2, baseLight: 1.1, isToday: false },
    { dayName: 'อาทิตย์ (วันนี้)', date: '21 ก.ย.', baseAc: 14.8, baseLight: 3.2, isToday: true },
  ];

  return daysTemplate.map((item) => {
    const acKwh = Number((item.baseAc * scale).toFixed(1));
    const lightsKwh = Number((item.baseLight * scale).toFixed(1));
    const otherKwh = Number((0.8 * scale).toFixed(1));
    const totalKwh = Number((acKwh + lightsKwh + otherKwh).toFixed(1));
    const costBaht = Math.round(totalKwh * 4.5); // approx 4.5 THB per unit
    const carbonKg = Number((totalKwh * 0.4999).toFixed(2)); // EGAT approx 0.5 kgCO2e per kWh
    const targetKwh = Number((20 * scale).toFixed(1));

    return {
      date: item.date,
      dayName: item.dayName,
      acKwh,
      lightsKwh,
      otherKwh,
      totalKwh,
      targetKwh,
      costBaht,
      carbonKg,
      isToday: item.isToday,
    };
  });
};

export const EnergyBarChart7Days: React.FC<EnergyBarChart7DaysProps> = ({ classroom }) => {
  const [viewMode, setViewMode] = useState<'stacked' | 'total'>('stacked');
  const [showTargetLine, setShowTargetLine] = useState<boolean>(true);

  const data = getOrGenerate7DayEnergy(classroom);

  // Compute 7-day summary metrics
  const total7DayKwh = Number(data.reduce((acc, d) => acc + d.totalKwh, 0).toFixed(1));
  const avgDailyKwh = Number((total7DayKwh / 7).toFixed(1));
  const totalCostBaht = data.reduce((acc, d) => acc + d.costBaht, 0);
  const totalCarbonKg = Number(data.reduce((acc, d) => acc + d.carbonKg, 0).toFixed(1));
  const maxDay = data.reduce((prev, curr) => (curr.totalKwh > prev.totalKwh ? curr : prev), data[0]);

  // Estimated savings from Eco mode / Smart automation (approx 18%)
  const estimatedSavingsKwh = Number((total7DayKwh * 0.18).toFixed(1));
  const estimatedSavingsBaht = Math.round(estimatedSavingsKwh * 4.5);

  return (
    <div className="bg-slate-50/70 border border-slate-200/90 rounded-xl p-4.5 space-y-4">
      {/* Component Title & View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-100 text-cyan-700">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                สถิติการใช้พลังงานไฟฟ้ารอบ 7 วันที่ผ่านมา (7-Day Energy Consumption)
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ห้อง {classroom.roomNumber}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              วิเคราะห์ปริมาณไฟฟ้า (kWh) รายวัน แยกตามระบบปรับอากาศและแสงสว่าง
            </p>
          </div>
        </div>

        {/* View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              onClick={() => setViewMode('stacked')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'stacked'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              แยกอุปกรณ์
            </button>
            <button
              onClick={() => setViewMode('total')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'total'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ยอดรวม
            </button>
          </div>

          <button
            onClick={() => setShowTargetLine(!showTargetLine)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
              showTargetLine
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-500 border-slate-200 hover:text-slate-700'
            }`}
            title="เปิด/ปิดเส้นเป้าหมายประหยัดพลังงาน Green Campus"
          >
            <Leaf className="w-3 h-3 text-emerald-600" />
            <span>เส้นเป้าหมาย</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">รวม 7 วัน</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-mono font-bold text-slate-900">{total7DayKwh}</span>
            <span className="text-xs text-slate-500 font-medium">kWh</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            ~{totalCostBaht.toLocaleString()} บาท
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">เฉลี่ยต่อวัน</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-mono font-bold text-cyan-700">{avgDailyKwh}</span>
            <span className="text-xs text-slate-500 font-medium">kWh/วัน</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            วันใช้สูงสุด: {maxDay.dayName} ({maxDay.totalKwh} kWh)
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">ประหยัดด้วยระบบอัจฉริยะ</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-mono font-bold text-emerald-600">~{estimatedSavingsKwh}</span>
            <span className="text-xs text-emerald-600 font-medium">kWh</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-emerald-600 inline" />
            ประหยัด ~{estimatedSavingsBaht} บาท/สัปดาห์
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">คาร์บอนฟุตพริ้นท์ (7 วัน)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-mono font-bold text-slate-700">{totalCarbonKg}</span>
            <span className="text-xs text-slate-500 font-medium">kgCO₂e</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 inline" />
            อยู่ในเกณฑ์ห้องเรียนสีเขียว
          </span>
        </div>
      </div>

      {/* Main Recharts Bar Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 15, right: 15, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey="dayName" 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                unit=" kWh"
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as DailyEnergyUsage;
                    return (
                      <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[190px]">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                          <span className="font-bold text-slate-900">{label} ({item.date})</span>
                          {item.isToday && (
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                              วันนี้
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 pt-0.5">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-cyan-500 inline-block" />
                              เครื่องปรับอากาศ:
                            </span>
                            <span className="font-mono font-semibold text-slate-800">{item.acKwh} kWh</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                              ระบบไฟฟ้าส่องสว่าง:
                            </span>
                            <span className="font-mono font-semibold text-slate-800">{item.lightsKwh} kWh</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              IoT & อุปกรณ์อื่นๆ:
                            </span>
                            <span className="font-mono font-semibold text-slate-800">{item.otherKwh} kWh</span>
                          </div>

                          <div className="pt-1.5 mt-1 border-t border-slate-100 flex items-center justify-between font-bold">
                            <span className="text-slate-800">รวมทั้งหมด:</span>
                            <span className="font-mono text-cyan-700">{item.totalKwh} kWh</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span>คิดเป็นค่าไฟ:</span>
                            <span className="font-mono font-semibold text-slate-700">~{item.costBaht} บาท</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Legend 
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                formatter={(value) => {
                  if (value === 'acKwh') return 'เครื่องปรับอากาศ (AC)';
                  if (value === 'lightsKwh') return 'ไฟฟ้าแสงสว่าง (Lighting)';
                  if (value === 'otherKwh') return 'อุปกรณ์เสริม (IoT)';
                  if (value === 'totalKwh') return 'ไฟฟ้ารวม (Total kWh)';
                  return value;
                }}
              />

              {showTargetLine && (
                <ReferenceLine 
                  y={data[0]?.targetKwh || 20} 
                  stroke="#10b981" 
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ 
                    value: `เป้าหมาย Green Campus (${data[0]?.targetKwh || 20} kWh)`, 
                    position: 'insideTopRight', 
                    fill: '#059669', 
                    fontSize: 10,
                    fontWeight: 600
                  }} 
                />
              )}

              {viewMode === 'stacked' ? (
                <>
                  <Bar 
                    dataKey="acKwh" 
                    stackId="a" 
                    fill="#06b6d4" 
                    radius={[0, 0, 0, 0]}
                    name="acKwh"
                  />
                  <Bar 
                    dataKey="lightsKwh" 
                    stackId="a" 
                    fill="#f59e0b" 
                    radius={[0, 0, 0, 0]}
                    name="lightsKwh"
                  />
                  <Bar 
                    dataKey="otherKwh" 
                    stackId="a" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    name="otherKwh"
                  />
                </>
              ) : (
                <Bar 
                  dataKey="totalKwh" 
                  fill="#0284c7" 
                  radius={[6, 6, 0, 0]}
                  name="totalKwh"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isToday ? '#0d9488' : entry.totalKwh > entry.targetKwh ? '#0284c7' : '#10b981'} 
                    />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend color cues and benchmark note */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-cyan-500 inline-block" />
              แอร์ (~80%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
              ไฟส่องสว่าง (~16%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
              อุปกรณ์ IoT (~4%)
            </span>
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <Info className="w-3 h-3 text-slate-400" />
            <span>คำนวณอัตราค่าไฟเฉลี่ย 4.50 บาท/หน่วย (PEA/MEA Rate)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
