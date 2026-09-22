import React from 'react';
import { Classroom, SmartBin, BinType } from '../types';
import { 
  Trash2, 
  RotateCcw, 
  AlertCircle, 
  CheckCircle2, 
  Battery, 
  Weight, 
  Leaf, 
  Recycle, 
  Apple, 
  Cpu, 
  Layers,
  Sparkles,
  Bell
} from 'lucide-react';

interface WasteManagementSectionProps {
  classroom: Classroom;
  onEmptyBin: (binId: string) => void;
  onEmptyAllRoomBins: () => void;
}

export const WasteManagementSection: React.FC<WasteManagementSectionProps> = ({
  classroom,
  onEmptyBin,
  onEmptyAllRoomBins,
}) => {
  // Aggregate stats
  const totalBins = classroom.bins.length;
  const fullBins = classroom.bins.filter(b => b.fillLevel >= 80 || b.needsEmptying);
  const totalWeight = classroom.bins.reduce((acc, b) => acc + b.weightKg, 0).toFixed(1);

  // Helper for bin styles & icons based on type
  const getBinMeta = (type: BinType) => {
    switch (type) {
      case 'recycle':
        return {
          icon: Recycle,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          barColor: 'bg-blue-600',
          category: 'ขยะรีไซเคิล (Recyclable)',
          examples: 'ขวด PET, กระป๋องอลูมิเนียม, กระดาษ',
        };
      case 'general':
        return {
          icon: Layers,
          color: 'text-slate-600',
          bg: 'bg-slate-100',
          border: 'border-slate-200',
          barColor: 'bg-slate-500',
          category: 'ขยะทั่วไป (General Waste)',
          examples: 'ซองขนม, ซองพลาสติก, กระดาษทิชชู',
        };
      case 'organic':
        return {
          icon: Apple,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          barColor: 'bg-emerald-600',
          category: 'ขยะอินทรีย์ (Organic Waste)',
          examples: 'เศษอาหาร, เปลือกผลไม้, ใบไม้ทดลอง',
        };
      case 'ewaste':
        return {
          icon: Cpu,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          barColor: 'bg-orange-500',
          category: 'ขยะอิเล็กทรอนิกส์ (E-Waste / Hazardous)',
          examples: 'ถ่านไฟฉาย, ชิ้นส่วนวงจร, สายไฟชำรุด',
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-600">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                ระบบตรวจเช็คและคัดแยกขยะอัจฉริยะ (Smart Waste & Recycling Bins)
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                fullBins.length > 0 
                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {fullBins.length > 0 ? `⚠️ มี ${fullBins.length} ถังใกล้เต็ม` : 'ทุกถังความจุปกติ'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ตรวจวัดระดับความจุด้วย Ultrasonic Sensor แบบ Real-time พร้อมระบบแจ้งเตือนเวรทำความสะอาด
            </p>
          </div>
        </div>

        {/* Global Action */}
        <div className="flex items-center gap-2">
          <button
            id="btn-empty-all-bins"
            onClick={onEmptyAllRoomBins}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            title="บันทึกว่าได้เทและทำความสะอาดถังขยะทุกถังในห้องแล้ว"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>จัดเก็บขยะทุกถังแล้ว (Reset Bins)</span>
          </button>
        </div>
      </div>

      {/* 4 Smart Bins Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {classroom.bins.map((bin) => {
          const meta = getBinMeta(bin.type);
          const Icon = meta.icon;
          const isCritical = bin.fillLevel >= 85;
          const isWarning = bin.fillLevel >= 70 && !isCritical;

          return (
            <div
              key={bin.id}
              className={`p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isCritical
                  ? 'bg-amber-50/50 border-amber-300 shadow-2xs ring-1 ring-amber-400/20'
                  : 'bg-slate-50/70 border-slate-200/90 hover:bg-white hover:border-slate-300'
              }`}
            >
              {/* Critical Alert Ping */}
              {isCritical && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-100 border border-amber-300 text-[10px] font-bold text-amber-800 animate-pulse">
                  <Bell className="w-2.5 h-2.5" />
                  <span>ต้องเทด่วน</span>
                </div>
              )}

              <div>
                {/* Bin Type Header */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className={`p-2 rounded-xl ${meta.bg} ${meta.color} border ${meta.border}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {bin.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block font-medium">
                      {meta.category}
                    </span>
                  </div>
                </div>

                {/* Fill Level Gauge */}
                <div className="my-3 space-y-1.5">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">ความจุในถัง:</span>
                    <span className={`text-xl font-mono font-bold ${
                      isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-900'
                    }`}>
                      {bin.fillLevel}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-slate-300/60">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : meta.barColor
                      }`}
                      style={{ width: `${Math.min(100, bin.fillLevel)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>ว่าง</span>
                    <span>50%</span>
                    <span>เต็ม (100%)</span>
                  </div>
                </div>

                {/* Meta details */}
                <div className="space-y-1 pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Weight className="w-3 h-3 text-slate-400" />
                      <span>น้ำหนักประมาณ:</span>
                    </span>
                    <strong className="text-slate-800 font-mono">{bin.weightKg} กก.</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Battery className="w-3 h-3 text-emerald-600" />
                      <span>แบตเซ็นเซอร์:</span>
                    </span>
                    <span className="text-slate-800 font-mono font-medium">{bin.batteryLevel}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 pt-1">
                    เทครั้งล่าสุด: {bin.lastEmptied}
                  </div>
                </div>
              </div>

              {/* Action: Empty this bin */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <button
                  id={`btn-empty-bin-${bin.id}`}
                  onClick={() => onEmptyBin(bin.id)}
                  className={`w-full py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    bin.fillLevel >= 80
                      ? 'bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{bin.fillLevel >= 80 ? 'กดบันทึกเทขยะแล้ว' : 'เคลียร์ถัง'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sustainable Sorting Guidelines Info Card */}
      <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>เป้าหมาย Zero Waste Classroom:</strong> ช่วยกันคัดแยกขยะถูกประเภทเพื่อส่งเสริมเศรษฐกิจหมุนเวียน (Circular Economy) และลดปริมาณขยะฝังกลบของโรงเรียน
          </span>
        </div>
        <div className="text-emerald-800 font-mono font-bold text-xs shrink-0">
          ขยะรวมในห้องนี้: {totalWeight} กิโลกรัม
        </div>
      </div>
    </div>
  );
};
