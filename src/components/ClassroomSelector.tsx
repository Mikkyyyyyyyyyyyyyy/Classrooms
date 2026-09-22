import React from 'react';
import { Classroom } from '../types';
import { 
  Cpu, 
  Wind, 
  Lightbulb, 
  Snowflake, 
  Trash2, 
  AlertCircle, 
  Check, 
  Clock,
  Sparkles,
  Users
} from 'lucide-react';

interface ClassroomSelectorProps {
  classrooms: Classroom[];
  selectedRoomId: string;
  onSelectRoom: (id: string) => void;
}

export const ClassroomSelector: React.FC<ClassroomSelectorProps> = ({
  classrooms,
  selectedRoomId,
  onSelectRoom,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-600" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            เลือกห้องเรียนประจำอาคารนวัตกรรม (Select Classroom)
          </h2>
        </div>
        <span className="text-xs text-slate-500 font-medium">
          รวม {classrooms.length} ห้องเรียนอัจฉริยะ
        </span>
      </div>

      {/* Classroom Cards Grid / Horizontal Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {classrooms.map((room) => {
          const isSelected = room.id === selectedRoomId;
          const activeLights = room.lights.filter(l => l.isOn).length;
          const activeAcs = room.acs.filter(a => a.isOn).length;
          const hasWasteAlert = room.bins.some(b => b.fillLevel >= 80 || b.needsEmptying);
          
          // PM2.5 Color
          const pm25Color = 
            room.airQuality.pm25 <= 15 ? 'text-emerald-800 bg-emerald-50 border-emerald-200' :
            room.airQuality.pm25 <= 37.5 ? 'text-amber-800 bg-amber-50 border-amber-200' :
            room.airQuality.pm25 <= 75 ? 'text-orange-800 bg-orange-50 border-orange-200' :
            'text-red-800 bg-red-50 border-red-200';

          return (
            <button
              key={room.id}
              id={`room-card-${room.roomNumber}`}
              onClick={() => onSelectRoom(room.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50/40 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200/90 hover:bg-slate-50/80 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Top Accent Strip */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
              )}

              {/* Room Number & Occupancy status */}
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-base text-slate-900">
                    ห้อง {room.roomNumber}
                  </span>
                  {room.energyEcoAlert && (
                    <span 
                      title="เปิดไฟ/แอร์ทิ้งไว้ขณะไม่มีคาบเรียน!" 
                      className="w-2 h-2 rounded-full bg-amber-500 animate-ping"
                    />
                  )}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                  room.isOccupied 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {room.isOccupied ? `มีเรียน (${room.occupancyCount} คน)` : 'ห้องว่าง'}
                </span>
              </div>

              {/* Specialization Name */}
              <h3 className="text-xs font-medium text-slate-600 line-clamp-1 mb-2.5" title={room.name}>
                {room.name}
              </h3>

              {/* Micro Status Badges: PM2.5, Lights, AC, Bins */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px] pt-2 border-t border-slate-100">
                {/* PM2.5 */}
                <div className={`px-1.5 py-0.5 rounded border flex items-center justify-between ${pm25Color}`}>
                  <span className="flex items-center gap-1">
                    <Wind className="w-3 h-3" />
                    <span>ฝุ่น</span>
                  </span>
                  <span className="font-mono font-bold">{room.airQuality.pm25}</span>
                </div>

                {/* Energy */}
                <div className="px-1.5 py-0.5 rounded border bg-slate-50 border-slate-200 text-slate-700 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px]">
                    <Lightbulb className={`w-3 h-3 ${activeLights > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
                    <Snowflake className={`w-3 h-3 ${activeAcs > 0 ? 'text-cyan-600' : 'text-slate-400'}`} />
                  </span>
                  <span className="font-mono text-[10px] text-slate-600 font-medium">{activeLights}L/{activeAcs}AC</span>
                </div>

                {/* Waste Alert or Clean */}
                <div className={`col-span-2 px-1.5 py-0.5 rounded border flex items-center justify-between ${
                  hasWasteAlert 
                    ? 'bg-amber-50 border-amber-200 text-amber-900' 
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <span className="flex items-center gap-1 text-[10px]">
                    <Trash2 className="w-3 h-3" />
                    <span>ถังขยะ</span>
                  </span>
                  <span className="text-[10px] font-medium">
                    {hasWasteAlert ? '⚠️ ใกล้เต็ม' : 'ปกติ'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
