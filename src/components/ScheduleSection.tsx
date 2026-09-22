import React, { useState } from 'react';
import { Classroom, ClassPeriod } from '../types';
import { 
  Calendar, 
  Clock, 
  UserCheck, 
  GraduationCap, 
  Users, 
  Plus, 
  CheckCircle, 
  Sparkles,
  BookOpen,
  MapPin
} from 'lucide-react';

interface ScheduleSectionProps {
  classroom: Classroom;
  onAddPeriod: (period: ClassPeriod) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  classroom,
  onAddPeriod,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('ม.5/1');
  const [timeStart, setTimeStart] = useState('16:40');
  const [timeEnd, setTimeEnd] = useState('18:00');
  const [studentCount, setStudentCount] = useState(25);

  const currentPeriod = classroom.schedule.find(s => s.isCurrent);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;

    const newPeriod: ClassPeriod = {
      id: `sc-${Date.now()}`,
      periodNumber: classroom.schedule.length + 1,
      timeStart,
      timeEnd,
      subjectCode: subjectCode || 'PROJ-LAB',
      subjectName,
      teacherName: teacherName || 'อาจารย์ที่ปรึกษา',
      gradeLevel,
      studentCount,
    };

    onAddPeriod(newPeriod);
    setSubjectName('');
    setSubjectCode('');
    setTeacherName('');
    setIsAddOpen(false);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                ตารางการใช้ห้องเรียนประจำวัน (Classroom Timetable & Schedule)
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                classroom.isOccupied
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {classroom.isOccupied ? `มีเรียนปัจจุบัน (${classroom.occupancyCount} คน)` : 'ห้องว่าง (Available)'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              ห้อง {classroom.roomNumber} - {classroom.name} (ความจุสูงสุด {classroom.capacity} ที่นั่ง)
            </p>
          </div>
        </div>

        <button
          id="btn-add-schedule-period"
          onClick={() => setIsAddOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ จองคาบเรียน/กิจกรรมโครงงาน</span>
        </button>
      </div>

      {/* Current Active Class Highlight Banner */}
      {currentPeriod && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50/40 border border-blue-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white">
                  คาบปัจจุบัน (Active Now)
                </span>
                <span className="text-xs font-mono text-blue-700 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {currentPeriod.timeStart} - {currentPeriod.timeEnd} น.
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{currentPeriod.subjectCode} {currentPeriod.subjectName}</span>
              </h4>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                  <span>ผู้สอน: <strong className="text-slate-800">{currentPeriod.teacherName}</strong></span>
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ชั้นเรียน: <strong className="text-slate-800">{currentPeriod.gradeLevel}</strong> ({currentPeriod.studentCount} คน)</span>
                </span>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-right shadow-2xs">
              <span className="text-[10px] text-slate-500 block font-medium">สถานะแอร์และไฟอัตโนมัติ</span>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 justify-end">
                <CheckCircle className="w-3.5 h-3.5" /> ซิงค์ตามตารางเรียน
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Periods List */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
          ลำดับคาบเรียนประจำวัน (Today's Timeline)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {classroom.schedule.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border transition-all ${
                item.isCurrent
                  ? 'bg-blue-50/60 border-blue-300 shadow-2xs ring-1 ring-blue-400/20'
                  : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
                  คาบที่ {item.periodNumber}
                </span>
                <span className="text-xs font-mono text-slate-600 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {item.timeStart} - {item.timeEnd}
                </span>
              </div>

              <h5 className="text-xs font-bold text-slate-900 line-clamp-1" title={item.subjectName}>
                {item.subjectCode !== '-' && `${item.subjectCode} `}{item.subjectName}
              </h5>

              <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                <span className="truncate max-w-[130px] font-medium">{item.teacherName}</span>
                <span className="text-slate-800 font-semibold">{item.gradeLevel}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Period */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>จองใช้งานห้องเรียน / เพิ่มคาบกิจกรรม</span>
              </h4>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">ชื่อวิชา / กิจกรรมโครงงาน</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ปฏิบัติการหุ่นยนต์เก็บขยะอัจฉริยะ"
                  value={subjectName}
                  onChange={e => setSubjectName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">รหัสวิชา / รหัสจอง</label>
                  <input
                    type="text"
                    placeholder="เช่น ว30299"
                    value={subjectCode}
                    onChange={e => setSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">อาจารย์ / ผู้ควบคุม</label>
                  <input
                    type="text"
                    placeholder="เช่น ดร.สมเกียรติ"
                    value={teacherName}
                    onChange={e => setTeacherName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    value={timeStart}
                    onChange={e => setTimeStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    value={timeEnd}
                    onChange={e => setTimeEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">ระดับชั้น / กลุ่ม</label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={e => setGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">จำนวนนักเรียน (คน)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={studentCount}
                    onChange={e => setStudentCount(parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-3 py-2 rounded-lg bg-slate-100 text-xs text-slate-700 hover:bg-slate-200 cursor-pointer font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs text-white font-semibold cursor-pointer shadow-xs"
                >
                  บันทึกตารางเรียน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
