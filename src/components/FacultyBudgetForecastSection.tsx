import React, { useState, useMemo } from 'react';
import { Classroom } from '../types';
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
  AreaChart,
  Area,
  Line,
  Cell
} from 'recharts';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Coins, 
  Calendar, 
  Building2, 
  Zap, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Info, 
  Leaf,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';

interface FacultyBudgetForecastSectionProps {
  classrooms: Classroom[];
  onSelectRoom?: (roomId: string) => void;
}

export const FacultyBudgetForecastSection: React.FC<FacultyBudgetForecastSectionProps> = ({
  classrooms,
  onSelectRoom,
}) => {
  // Configurable Faculty Budget State (Default: 35,000 THB for this academic wing)
  const [facultyBudget, setFacultyBudget] = useState<number>(35000);
  const [electricityRate, setElectricityRate] = useState<number>(4.50); // THB per kWh
  const [isEcoPolicySimulated, setIsEcoPolicySimulated] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [chartView, setChartView] = useState<'cumulative' | 'rooms'>('cumulative');

  // Month parameters: September (30 days total, currently day 21)
  const daysInMonth = 30;
  const currentDay = 21;
  const daysRemaining = daysInMonth - currentDay;
  const monthProgressPercent = Math.round((currentDay / daysInMonth) * 100);

  // Compute energy per classroom
  const roomEnergyProfiles = useMemo(() => {
    return classrooms.map((room) => {
      // Calculate current instantaneous load
      const lightWatts = room.lights.reduce((acc, l) => acc + (l.isOn ? l.powerWatts : 0), 0);
      const acWatts = room.acs.reduce((acc, a) => acc + (a.isOn ? a.powerWatts : 0), 0);
      const currentKw = (lightWatts + acWatts) / 1000;

      // Base daily kWh calculation based on room capacity and equipment capacity
      const maxLightWatts = room.lights.reduce((acc, l) => acc + l.powerWatts, 0);
      const maxAcWatts = room.acs.reduce((acc, a) => acc + a.powerWatts, 0);
      
      // Average daily runtime factor (approx 7-9 hours/day on weekdays, 2-3 hours on weekends)
      const baseDailyKwh = Math.max(8, ((maxLightWatts * 6) + (maxAcWatts * 5.5)) / 1000);
      
      // Wasteful room penalty (e.g. room 402 left on when empty)
      const wasteMultiplier = room.energyEcoAlert ? 1.25 : 1.0;
      const effectiveDailyKwh = Number((baseDailyKwh * wasteMultiplier).toFixed(1));

      // Month-to-date (21 days)
      const mtdKwh = Number((effectiveDailyKwh * currentDay).toFixed(1));
      const mtdCost = Math.round(mtdKwh * electricityRate);

      // Remaining days projection
      const remainingKwh = Number((effectiveDailyKwh * daysRemaining).toFixed(1));
      const projectedMonthKwh = Number((mtdKwh + remainingKwh).toFixed(1));
      const projectedMonthCost = Math.round(projectedMonthKwh * electricityRate);

      // With Eco policy applied (savings of ~20% on remaining days)
      const ecoRemainingKwh = Number((effectiveDailyKwh * 0.78 * daysRemaining).toFixed(1));
      const ecoProjectedMonthCost = Math.round((mtdKwh + ecoRemainingKwh) * electricityRate);
      const potentialSavingsCost = projectedMonthCost - ecoProjectedMonthCost;

      return {
        id: room.id,
        roomNumber: room.roomNumber,
        name: room.name,
        currentKw: Number(currentKw.toFixed(2)),
        dailyKwh: effectiveDailyKwh,
        mtdKwh,
        mtdCost,
        projectedMonthKwh,
        projectedMonthCost,
        ecoProjectedMonthCost,
        potentialSavingsCost,
        hasWasteAlert: room.energyEcoAlert,
        isOccupied: room.isOccupied,
      };
    });
  }, [classrooms, electricityRate, currentDay, daysRemaining]);

  // Aggregate totals for the entire faculty wing
  const aggregates = useMemo(() => {
    const totalCurrentKw = Number(roomEnergyProfiles.reduce((acc, r) => acc + r.currentKw, 0).toFixed(2));
    const totalMtdKwh = Number(roomEnergyProfiles.reduce((acc, r) => acc + r.mtdKwh, 0).toFixed(1));
    const totalMtdCost = roomEnergyProfiles.reduce((acc, r) => acc + r.mtdCost, 0);

    const normalProjectedKwh = Number(roomEnergyProfiles.reduce((acc, r) => acc + r.projectedMonthKwh, 0).toFixed(1));
    const normalProjectedCost = roomEnergyProfiles.reduce((acc, r) => acc + r.projectedMonthCost, 0);

    const ecoProjectedCost = roomEnergyProfiles.reduce((acc, r) => acc + r.ecoProjectedMonthCost, 0);
    const totalPotentialSavings = normalProjectedCost - ecoProjectedCost;

    const effectiveProjectedCost = isEcoPolicySimulated ? ecoProjectedCost : normalProjectedCost;
    const variance = facultyBudget - effectiveProjectedCost; // positive = under budget, negative = over budget
    const budgetUsagePercent = Math.round((effectiveProjectedCost / (facultyBudget || 1)) * 100);

    const status: 'under_budget' | 'on_track' | 'over_budget' = 
      effectiveProjectedCost > facultyBudget 
        ? 'over_budget' 
        : effectiveProjectedCost > facultyBudget * 0.92 
          ? 'on_track' 
          : 'under_budget';

    return {
      totalCurrentKw,
      totalMtdKwh,
      totalMtdCost,
      normalProjectedCost,
      ecoProjectedCost,
      effectiveProjectedCost,
      totalPotentialSavings,
      variance,
      budgetUsagePercent,
      status,
      avgDailyKwh: Number((totalMtdKwh / currentDay).toFixed(1)),
      avgDailyCost: Math.round(totalMtdCost / currentDay),
    };
  }, [roomEnergyProfiles, facultyBudget, isEcoPolicySimulated, currentDay]);

  // Generate 30-Day Cumulative Timeline Data for Recharts
  const timelineData = useMemo(() => {
    const data = [];
    let cumulativeActualCost = 0;
    let cumulativeProjectedNormal = 0;
    let cumulativeProjectedEco = 0;

    const baseDailySpend = aggregates.avgDailyCost;
    const ecoDailySpend = Math.round(baseDailySpend * 0.78);

    for (let day = 1; day <= daysInMonth; day++) {
      const dayLabel = `${day} ก.ย.`;

      if (day <= currentDay) {
        // Actual historic days
        // Add subtle weekend vs weekday variation
        const dayOfWeek = (day + 1) % 7; // rough day index
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const dailySpend = isWeekend ? Math.round(baseDailySpend * 0.35) : baseDailySpend;
        cumulativeActualCost += dailySpend;
        cumulativeProjectedNormal = cumulativeActualCost;
        cumulativeProjectedEco = cumulativeActualCost;

        data.push({
          day: dayLabel,
          dayNumber: day,
          actualCost: cumulativeActualCost,
          projectedCost: null,
          ecoProjectedCost: null,
          budgetLimit: Math.round((facultyBudget / daysInMonth) * day),
          isToday: day === currentDay,
          type: 'actual',
        });
      } else {
        // Future projected days
        const dayOfWeek = (day + 1) % 7;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const dailySpendNormal = isWeekend ? Math.round(baseDailySpend * 0.35) : baseDailySpend;
        const dailySpendEco = isWeekend ? Math.round(ecoDailySpend * 0.35) : ecoDailySpend;

        cumulativeProjectedNormal += dailySpendNormal;
        cumulativeProjectedEco += dailySpendEco;

        data.push({
          day: dayLabel,
          dayNumber: day,
          actualCost: null,
          projectedCost: cumulativeProjectedNormal,
          ecoProjectedCost: cumulativeProjectedEco,
          budgetLimit: Math.round((facultyBudget / daysInMonth) * day),
          isToday: false,
          type: 'forecast',
        });
      }
    }

    // Connect the boundary point at currentDay so lines join seamlessly
    const currentDayEntry = data.find(d => d.dayNumber === currentDay);
    if (currentDayEntry) {
      currentDayEntry.projectedCost = currentDayEntry.actualCost;
      currentDayEntry.ecoProjectedCost = currentDayEntry.actualCost;
    }

    return data;
  }, [aggregates.avgDailyCost, currentDay, daysInMonth, facultyBudget]);

  // Bar chart data for room-by-room comparison
  const roomComparisonData = useMemo(() => {
    return roomEnergyProfiles.map(r => ({
      name: `ห้อง ${r.roomNumber}`,
      roomId: r.id,
      actualCost: r.mtdCost,
      remainingCost: r.projectedMonthCost - r.mtdCost,
      totalCost: r.projectedMonthCost,
      ecoTotalCost: r.ecoProjectedMonthCost,
      potentialSavings: r.potentialSavingsCost,
      hasWasteAlert: r.hasWasteAlert,
    }));
  }, [roomEnergyProfiles]);

  return (
    <section 
      id="faculty-budget-forecast-section"
      className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5 transition-all"
    >
      {/* 1. Header with Title, Month Badge and Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xs">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              การคาดการณ์ค่าไฟฟ้าสิ้นเดือน & การวางแผนงบประมาณคณะ
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              รอบบิล กันยายน 2569
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600">
              วันที่ {currentDay}/{daysInMonth} (ผ่านไปแล้ว {monthProgressPercent}%)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 pl-0 sm:pl-10">
            ระบบวิเคราะห์ประมวลผลข้อมูลพลังงานแบบรวมศูนย์จากทุกห้องเรียน เพื่อคาดการณ์ยอดบิลสิ้นเดือนและช่วยผู้บริหารคณะควบคุมงบประมาณ
          </p>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2 pl-0 sm:pl-10 md:pl-0">
          <button
            onClick={() => setIsEcoPolicySimulated(!isEcoPolicySimulated)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
              isEcoPolicySimulated
                ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
            title="คลิกเพื่อจำลองการบังคับใช้นโยบายประหยัดพลังงานอัตโนมัติ"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isEcoPolicySimulated ? 'กำลังจำลอง: นโยบาย Eco (-20%)' : 'จำลองนโยบาย Eco Campus'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
            title={isExpanded ? 'ย่อเนื้อหา' : 'ขยายเนื้อหา'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* 2. Executive KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Actual MTD Cost */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>ค่าไฟใช้ไปแล้วจริง (วันที่ 1-{currentDay})</span>
                <Coins className="w-4 h-4 text-slate-400" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-extrabold text-slate-900">
                  {aggregates.totalMtdCost.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-semibold">บาท</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                <span>พลังงานสะสม: {aggregates.totalMtdKwh.toLocaleString()} kWh</span>
                <span className="font-mono text-slate-600">~{aggregates.avgDailyCost} บ./วัน</span>
              </div>
            </div>

            {/* KPI 2: Projected Month-End Cost */}
            <div className={`border rounded-xl p-4 shadow-2xs transition-colors ${
              aggregates.status === 'over_budget'
                ? 'bg-rose-50/70 border-rose-200'
                : aggregates.status === 'on_track'
                  ? 'bg-amber-50/70 border-amber-200'
                  : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={
                  aggregates.status === 'over_budget' ? 'text-rose-900' : aggregates.status === 'on_track' ? 'text-amber-900' : 'text-emerald-900'
                }>
                  คาดการณ์ค่าไฟสิ้นเดือน (30 ก.ย.)
                </span>
                {aggregates.status === 'over_budget' ? (
                  <TrendingUp className="w-4 h-4 text-rose-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className={`text-2xl font-mono font-extrabold ${
                  aggregates.status === 'over_budget' ? 'text-rose-700' : aggregates.status === 'on_track' ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {aggregates.effectiveProjectedCost.toLocaleString()}
                </span>
                <span className="text-xs font-semibold text-slate-500">บาท</span>
              </div>
              <div className="mt-2 text-[11px] flex items-center justify-between">
                <span className={aggregates.status === 'over_budget' ? 'text-rose-700 font-medium' : 'text-slate-600'}>
                  {aggregates.status === 'over_budget' ? '⚠️ มีความเสี่ยงเกินงบ' : 'อยู่ในกรอบงบประมาณ'}
                </span>
                <span className="font-mono text-slate-600">{aggregates.budgetUsagePercent}% ของงบ</span>
              </div>
            </div>

            {/* KPI 3: Faculty Budget Allocation */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>งบประมาณที่คณะจัดสรร (Budget)</span>
                <Building2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-extrabold text-blue-700">
                  {facultyBudget.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 font-semibold">บาท</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">ส่วนต่างคาดการณ์:</span>
                <span className={`font-mono font-bold ${
                  aggregates.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {aggregates.variance >= 0 
                    ? `เหลือ +${aggregates.variance.toLocaleString()} บ.` 
                    : `เกิน ${aggregates.variance.toLocaleString()} บ.`
                  }
                </span>
              </div>
            </div>

            {/* KPI 4: Potential Eco Savings */}
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-900 text-xs font-semibold">
                <span>ศักยภาพการประหยัด (Smart Eco)</span>
                <Leaf className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl font-mono font-extrabold text-emerald-700">
                  ~{aggregates.totalPotentialSavings.toLocaleString()}
                </span>
                <span className="text-xs text-emerald-700 font-semibold">บาท/เดือน</span>
              </div>
              <div className="mt-2 text-[11px] text-emerald-800 flex items-center justify-between">
                <span>ลดได้ ~20% ใน 9 วันที่เหลือ</span>
                <span className="font-semibold text-emerald-700">ลดคาร์บอน ~180 kg</span>
              </div>
            </div>
          </div>

          {/* 3. Budget Tuning & Simulation Controls Toolbar */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-500" />
                ปรับเพดานงบประมาณคณะ:
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                {[30000, 35000, 40000, 45000].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setFacultyBudget(amount)}
                    className={`px-2.5 py-1 rounded-md font-mono font-semibold transition-all cursor-pointer ${
                      facultyBudget === amount
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {amount.toLocaleString()} บ.
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 text-slate-500 pl-2">
                <span>หรือกำหนดเอง:</span>
                <input
                  type="number"
                  step="1000"
                  value={facultyBudget}
                  onChange={(e) => setFacultyBudget(Math.max(10000, Number(e.target.value) || 0))}
                  className="w-24 px-2 py-1 bg-white border border-slate-200 rounded-md font-mono text-slate-800 text-right focus:outline-blue-500"
                />
                <span>บาท</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
                <button
                  onClick={() => setChartView('cumulative')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    chartView === 'cumulative'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  แนวโน้มสะสมสิ้นเดือน
                </button>
                <button
                  onClick={() => setChartView('rooms')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    chartView === 'rooms'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  เปรียบเทียบแยกห้อง
                </button>
              </div>
            </div>
          </div>

          {/* 4. Main Forecasting Visualizations (Recharts) */}
          <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {chartView === 'cumulative' 
                    ? 'เส้นทางค่าใช้จ่ายจริงเทียบกับค่าพยากรณ์สิ้นเดือน (Cumulative Spending Trajectory)'
                    : 'ค่าไฟฟ้าคาดการณ์รายห้องเรียนตลอดทั้งเดือน (Classroom Cost Breakdown)'}
                </h4>
                <p className="text-xs text-slate-500">
                  {chartView === 'cumulative'
                    ? 'เส้นทึบ = ค่าไฟใช้จริงถึงปัจจุบัน | เส้นประ = คาดการณ์จนถึงสิ้นเดือน | เส้นขีดสีแดง = เพดานงบประมาณ'
                    : 'วิเคราะห์ว่าห้องใดใช้ไฟสูงสุดเพื่อปรับแผนบริหารงบประมาณได้อย่างตรงจุด'}
                </p>
              </div>

              {chartView === 'cumulative' && (
                <div className="flex items-center gap-3 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 bg-blue-600 inline-block" />
                    ใช้จริง (วัน 1-{currentDay})
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-indigo-500 inline-block" />
                    คาดการณ์ปกติ
                  </span>
                  {isEcoPolicySimulated && (
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-600 inline-block" />
                      คาดการณ์โหมด Eco
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-rose-600 font-medium">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500 inline-block" />
                    เพดานงบ ({facultyBudget.toLocaleString()} บ.)
                  </span>
                </div>
              )}
            </div>

            <div className="h-72 w-full bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
              <ResponsiveContainer width="100%" height="100%">
                {chartView === 'cumulative' ? (
                  <AreaChart
                    data={timelineData}
                    margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      interval={2}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false}
                      axisLine={{ stroke: '#e2e8f0' }}
                      unit=" บ."
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[200px]">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-1 font-bold text-slate-800">
                                <span>วันที่ {label}</span>
                                {item.isToday && (
                                  <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded text-[10px]">
                                    วันนี้
                                  </span>
                                )}
                              </div>
                              {item.actualCost !== null && (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">ค่าไฟสะสมจริง:</span>
                                  <span className="font-mono font-bold text-blue-600">
                                    {item.actualCost.toLocaleString()} บาท
                                  </span>
                                </div>
                              )}
                              {item.projectedCost !== null && item.type === 'forecast' && (
                                <div className="flex items-center justify-between">
                                  <span className="text-slate-500">คาดการณ์สิ้นเดือน:</span>
                                  <span className="font-mono font-bold text-indigo-600">
                                    {item.projectedCost.toLocaleString()} บาท
                                  </span>
                                </div>
                              )}
                              {isEcoPolicySimulated && item.ecoProjectedCost !== null && (
                                <div className="flex items-center justify-between text-emerald-600 font-semibold">
                                  <span>หากใช้นโยบาย Eco:</span>
                                  <span className="font-mono">
                                    {item.ecoProjectedCost.toLocaleString()} บาท
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                                <span>งบประมาณคณะ:</span>
                                <span className="font-mono">{facultyBudget.toLocaleString()} บาท</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine 
                      y={facultyBudget} 
                      stroke="#ef4444" 
                      strokeDasharray="4 4" 
                      strokeWidth={2}
                      label={{ 
                        value: `เพดานงบประมาณ (${facultyBudget.toLocaleString()} บาท)`, 
                        position: 'insideTopLeft', 
                        fill: '#dc2626', 
                        fontSize: 10,
                        fontWeight: 700 
                      }} 
                    />
                    <ReferenceLine 
                      x={`${currentDay} ก.ย.`} 
                      stroke="#94a3b8" 
                      strokeDasharray="2 2"
                      label={{ 
                        value: 'วันปัจจุบัน', 
                        position: 'insideTopRight', 
                        fill: '#64748b', 
                        fontSize: 10 
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="actualCost" 
                      stroke="#2563eb" 
                      strokeWidth={2.5}
                      fillOpacity={1} 
                      fill="url(#colorActual)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="projectedCost" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      strokeDasharray="4 4" 
                      dot={false}
                    />
                    {isEcoPolicySimulated && (
                      <Line 
                        type="monotone" 
                        dataKey="ecoProjectedCost" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        strokeDasharray="3 3" 
                        dot={false}
                      />
                    )}
                  </AreaChart>
                ) : (
                  <BarChart
                    data={roomComparisonData}
                    margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="name" 
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
                      unit=" บ."
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white/95 backdrop-blur-xs border border-slate-200 rounded-xl p-3 shadow-lg text-xs space-y-1.5 min-w-[210px]">
                              <div className="font-bold text-slate-800 border-b border-slate-100 pb-1">
                                {label}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">ใช้ไปแล้ว (1-{currentDay} ก.ย.):</span>
                                <span className="font-mono font-semibold text-blue-600">
                                  {data.actualCost.toLocaleString()} บาท
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-500">คาดการณ์สิ้นเดือน:</span>
                                <span className="font-mono font-bold text-slate-900">
                                  {data.totalCost.toLocaleString()} บาท
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-emerald-600 font-semibold pt-1 border-t border-slate-100">
                                <span>ประหยัดได้ด้วย Eco:</span>
                                <span className="font-mono">
                                  ~{data.potentialSavings.toLocaleString()} บาท
                                </span>
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
                      iconSize={8}
                      wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
                      formatter={(v) => {
                        if (v === 'actualCost') return 'ใช้ไปแล้วจริง (บาท)';
                        if (v === 'remainingCost') return 'คาดการณ์ช่วงที่เหลือ (บาท)';
                        return v;
                      }}
                    />
                    <Bar dataKey="actualCost" stackId="a" fill="#3b82f6" name="actualCost" />
                    <Bar dataKey="remainingCost" stackId="a" fill="#93c5fd" radius={[4, 4, 0, 0]} name="remainingCost">
                      {roomComparisonData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.hasWasteAlert ? '#f87171' : '#93c5fd'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. Classroom Breakdown Table with Recommendations */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">ห้องเรียน</th>
                  <th className="py-2.5 px-3">กำลังไฟปัจจุบัน</th>
                  <th className="py-2.5 px-3">ใช้ไปแล้ว (1-{currentDay} ก.ย.)</th>
                  <th className="py-2.5 px-3">คาดการณ์สิ้นเดือน</th>
                  <th className="py-2.5 px-3">สัดส่วนค่าไฟคณะ</th>
                  <th className="py-2.5 px-3">ข้อเสนอแนะประหยัดงบ (AI IoT Advice)</th>
                  <th className="py-2.5 px-3 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {roomEnergyProfiles.map((room) => {
                  const sharePercent = Math.round((room.projectedMonthCost / (aggregates.normalProjectedCost || 1)) * 100);
                  const isTopConsumer = sharePercent >= 25;

                  return (
                    <tr 
                      key={room.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        room.hasWasteAlert ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>ห้อง {room.roomNumber}</span>
                          {room.hasWasteAlert && (
                            <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] rounded font-bold">
                              เปิดทิ้งไว้
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 line-clamp-1">{room.name}</span>
                      </td>

                      <td className="py-2.5 px-3 font-mono font-semibold">
                        <span className={room.currentKw > 2.5 ? 'text-amber-600' : 'text-slate-700'}>
                          {room.currentKw} kW
                        </span>
                      </td>

                      <td className="py-2.5 px-3 font-mono">
                        <span className="font-semibold text-slate-800">{room.mtdCost.toLocaleString()}</span> บ.
                        <span className="block text-[10px] text-slate-400">({room.mtdKwh} kWh)</span>
                      </td>

                      <td className="py-2.5 px-3 font-mono">
                        <span className={`font-bold ${isTopConsumer ? 'text-blue-700' : 'text-slate-800'}`}>
                          {room.projectedMonthCost.toLocaleString()}
                        </span> บ.
                        <span className="block text-[10px] text-emerald-600">
                          (ลดได้ ~{room.potentialSavingsCost} บ.)
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                isTopConsumer ? 'bg-indigo-600' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(100, sharePercent * 2.5)}%` }}
                            />
                          </div>
                          <span className="font-mono font-semibold text-slate-700">{sharePercent}%</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        {room.hasWasteAlert ? (
                          <span className="text-rose-700 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            เปิดระบบทิ้งไว้ช่วงห้องว่าง: สั่งปิดด่วนจะเซฟได้ ~{room.potentialSavingsCost} บ.
                          </span>
                        ) : isTopConsumer ? (
                          <span className="text-amber-700 flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            ห้องใช้ไฟสูง: แนะนำตั้งแอร์ 25°C + หรี่ไฟ LED 80%
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            การใช้พลังงานอยู่ในเกณฑ์ Green Classroom ที่มีประสิทธิภาพ
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {onSelectRoom && (
                          <button
                            onClick={() => onSelectRoom(room.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>ควบคุมห้อง</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 6. Strategic Faculty Budget Policy Recommendations */}
          <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border border-blue-200/80 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                ข้อเสนอแนะเชิงนโยบายเพื่อการบริหารงบประมาณค่าไฟคณะ (Faculty Energy Management Policy):
              </h4>
            </div>
            <ul className="text-xs text-slate-600 space-y-1 pl-6 list-disc">
              <li>
                <strong className="text-slate-800">ระบบ Auto-Shutdown ห้องว่าง:</strong> หากสั่งตัดไฟและแอร์อัตโนมัติในห้อง 402 และห้องที่ไม่มีการเรียนการสอน คณะจะประหยัดงบได้ทันที <strong>~1,450 บาท</strong> ในรอบบิลนี้
              </li>
              <li>
                <strong className="text-slate-800">นโยบายแอร์ Inverter 25°C:</strong> การกำหนดให้อุณหภูมิเครื่องปรับอากาศไม่ต่ำกว่า 25°C ทุกห้อง จะลดค่าไฟภาพรวมของคณะลงได้เฉลี่ย <strong>15-18%</strong> ต่อเดือน
              </li>
              <li>
                <strong className="text-slate-800">การควบคุมโหลดพีค (Peak Demand Control):</strong> ห้อง FabLab (404) มีการใช้ไฟสูงสุด ให้เหลื่อมเวลาการเปิดเครื่องจักร CNC และเครื่องพิมพ์ 3D ไม่ให้ตรงกับช่วง 13:00 - 15:00 น.
              </li>
            </ul>
          </div>
        </>
      )}
    </section>
  );
};
