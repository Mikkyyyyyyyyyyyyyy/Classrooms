import React, { useState, useEffect } from 'react';
import { Classroom, ClassPeriod, SmartBin } from './types';
import { INITIAL_CLASSROOMS } from './data/mockClassrooms';
import { Header } from './components/Header';
import { BuildingOverviewCards } from './components/BuildingOverviewCards';
import { ClassroomSelector } from './components/ClassroomSelector';
import { AirQualitySection } from './components/AirQualitySection';
import { EnergyControlSection } from './components/EnergyControlSection';
import { ScheduleSection } from './components/ScheduleSection';
import { WasteManagementSection } from './components/WasteManagementSection';
import { ClassroomSimulatorView } from './components/ClassroomSimulatorView';
import { 
  Layers, 
  Wind, 
  Zap, 
  Calendar, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Leaf,
  Globe,
  HelpCircle,
  X,
  Tv
} from 'lucide-react';

const STORAGE_KEY = 'innovating_classrooms_v1';

export default function App() {
  // Load initial classrooms from localStorage or mock
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CLASSROOMS;
    } catch {
      return INITIAL_CLASSROOMS;
    }
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string>('room-401');
  const [activeTab, setActiveTab] = useState<'all' | 'simulator' | 'air' | 'energy' | 'schedule' | 'waste'>('simulator');
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(classrooms));
    } catch (e) {
      console.error('Failed to save state to localStorage', e);
    }
  }, [classrooms]);

  // Selected Classroom
  const selectedRoom = classrooms.find(c => c.id === selectedRoomId) || classrooms[0];

  // Helper toast trigger
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4000);
  };

  // Real-time IoT Simulation: Fluctuates dust and sensors subtly
  useEffect(() => {
    if (!isSimulationActive) return;

    const interval = setInterval(() => {
      setClassrooms(prev =>
        prev.map(room => {
          // Add small jitter to PM2.5
          const pmDelta = (Math.random() - 0.48) * 0.8;
          let newPm25 = Math.max(4, Math.min(95, parseFloat((room.airQuality.pm25 + pmDelta).toFixed(1))));
          
          // Purifier reduces dust if on
          if (room.airQuality.airPurifierStatus !== 'off') {
            newPm25 = Math.max(5, parseFloat((newPm25 - 0.3).toFixed(1)));
          }

          const newAqi = Math.round(newPm25 * 2.8);

          return {
            ...room,
            airQuality: {
              ...room.airQuality,
              pm25: newPm25,
              aqi: newAqi,
              co2: room.isOccupied ? Math.min(1200, room.airQuality.co2 + Math.floor(Math.random() * 5)) : Math.max(420, room.airQuality.co2 - 3),
            }
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulationActive]);

  // Handler: Air Purifier update
  const handleUpdateAirPurifier = (status: 'auto' | 'on' | 'off', speed: 1 | 2 | 3 | 'turbo') => {
    setClassrooms(prev =>
      prev.map(r => {
        if (r.id !== selectedRoomId) return r;
        return {
          ...r,
          airQuality: {
            ...r.airQuality,
            airPurifierStatus: status,
            airPurifierSpeed: speed,
          },
        };
      })
    );
    showToast(`ปรับเครื่องฟอกอากาศห้อง ${selectedRoom.roomNumber} เป็นโหมด ${status.toUpperCase()}`);
  };

  // Handler: Lighting Toggle
  const handleToggleLight = (zoneId: string) => {
    setClassrooms(prev =>
      prev.map(r => {
        if (r.id !== selectedRoomId) return r;
        return {
          ...r,
          lights: r.lights.map(l => {
            if (l.id !== zoneId) return l;
            const newIsOn = !l.isOn;
            return {
              ...l,
              isOn: newIsOn,
              powerWatts: newIsOn ? Math.round(l.dimLevel * 1.2) : 0,
            };
          }),
        };
      })
    );
  };

  // Handler: Light Dimmer
  const handleUpdateLightDim = (zoneId: string, dimLevel: number) => {
    setClassrooms(prev =>
      prev.map(r => {
        if (r.id !== selectedRoomId) return r;
        return {
          ...r,
          lights: r.lights.map(l => {
            if (l.id !== zoneId) return l;
            return {
              ...l,
              dimLevel,
              powerWatts: l.isOn ? Math.round(dimLevel * 1.2) : 0,
            };
          }),
        };
      })
    );
  };

  // Handler: AC Toggle
  const handleToggleAc = (acId: string) => {
    setClassrooms(prev =>
      prev.map(r => {
        if (r.id !== selectedRoomId) return r;
        return {
          ...r,
          acs: r.acs.map(a => {
            if (a.id !== acId) return a;
            const newIsOn = !a.isOn;
            return {
              ...a,
              isOn: newIsOn,
              powerWatts: newIsOn ? 1400 : 0,
            };
          }),
        };
      })
    );
  };

  // Handler: AC Temperature
  const handleUpdateAcTemp = (acId: string, temp: number) => {
    setClassrooms(prev =>
      prev.map(r => {
        if (r.id !== selectedRoomId) return r;
        return {
          ...r,
          acs: r.acs.map(a => (a.id === acId ? { ...a, setTemp: temp } : a)),
        };
      })
    );
  };

  // Handler: AC Mode
  const handleUpdateAcMode = (acId: string, mode: 'cool' | 'eco' | 'fan' | 'dry') => {
    setClassrooms(prev =>
      prev.map(r => {
        if (r.id !== selectedRoomId) return r;
        return {
          ...r,
          acs: r.acs.map(a => {
            if (a.id !== acId) return a;
            return {
              ...a,
              mode,
              setTemp: mode === 'eco' ? 25 : a.setTemp,
              powerWatts: mode === 'eco' ? 950 : 1450,
            };
          }),
        };
      })
    );
    showToast(`ปรับแอร์ห้อง ${selectedRoom.roomNumber} สู่โหมด ${mode.toUpperCase()}`);
  };

  // Handler: Turn off all energy in selected room
  const handleTurnOffAllRoomEnergy = () => {
    setClassrooms(prev =>
      prev.map(r => {
        if (r.id !== selectedRoomId) return r;
        return {
          ...r,
          energyEcoAlert: false,
          lights: r.lights.map(l => ({ ...l, isOn: false, powerWatts: 0 })),
          acs: r.acs.map(a => ({ ...a, isOn: false, powerWatts: 0 })),
        };
      })
    );
    showToast(`ปิดไฟและแอร์ทั้งหมดในห้อง ${selectedRoom.roomNumber} เรียบร้อยแล้ว (ลดการใช้พลังงาน 100%)`);
  };

  // Handler: Turn on Eco Mode 25C for room
  const handleTurnOnEcoMode = () => {
    setClassrooms(prev =>
      prev.map(r => {
        if (r.id !== selectedRoomId) return r;
        return {
          ...r,
          lights: r.lights.map(l => ({ ...l, isOn: true, dimLevel: 75, powerWatts: 85 })),
          acs: r.acs.map(a => ({ ...a, isOn: true, setTemp: 25, mode: 'eco', powerWatts: 1050 })),
        };
      })
    );
    showToast(`เปิดโหมดประหยัดพลังงาน Eco (แอร์ 25°C + ไฟหรี่ 75%) ห้อง ${selectedRoom.roomNumber}`);
  };

  // Handler: Add schedule period
  const handleAddPeriod = (period: ClassPeriod) => {
    setClassrooms(prev =>
      prev.map(r => {
        if (r.id !== selectedRoomId) return r;
        return {
          ...r,
          schedule: [...r.schedule, period],
        };
      })
    );
    showToast(`เพิ่มคาบเรียน/กิจกรรม "${period.subjectName}" ในห้อง ${selectedRoom.roomNumber} สำเร็จ`);
  };

  // Handler: Empty a single smart bin
  const handleEmptyBin = (binId: string) => {
    setClassrooms(prev =>
      prev.map(r => {
        if (r.id !== selectedRoomId) return r;
        return {
          ...r,
          bins: r.bins.map(b => {
            if (b.id !== binId) return b;
            return {
              ...b,
              fillLevel: 5,
              weightKg: 0.2,
              lastEmptied: 'เมื่อสักครู่',
              needsEmptying: false,
            };
          }),
        };
      })
    );
    showToast(`บันทึกจัดเก็บและเทถังขยะเรียบร้อยแล้ว`);
  };

  // Handler: Empty all bins in selected room
  const handleEmptyAllRoomBins = () => {
    setClassrooms(prev =>
      prev.map(r => {
        if (r.id !== selectedRoomId) return r;
        return {
          ...r,
          bins: r.bins.map(b => ({
            ...b,
            fillLevel: 5,
            weightKg: 0.2,
            lastEmptied: 'เมื่อสักครู่',
            needsEmptying: false,
          })),
        };
      })
    );
    showToast(`ทำความสะอาดและเทถังขยะทั้ง 4 ถังในห้อง ${selectedRoom.roomNumber} ครบถ้วน`);
  };

  // Handler: Emergency eco for all wasteful rooms
  const handleEmergencyEcoAll = () => {
    setClassrooms(prev =>
      prev.map(r => {
        if (!r.isOccupied) {
          return {
            ...r,
            energyEcoAlert: false,
            lights: r.lights.map(l => ({ ...l, isOn: false, powerWatts: 0 })),
            acs: r.acs.map(a => ({ ...a, isOn: false, powerWatts: 0 })),
          };
        }
        return r;
      })
    );
    showToast('ปิดระบบไฟฟ้าและแอร์ในห้องที่ไม่มีผู้ใช้งานทุกห้องสำเร็จ (Zero Energy Waste)');
  };

  // Handler: Reset default data
  const handleResetDefaults = () => {
    if (confirm('ต้องการรีเซ็ตข้อมูลเซ็นเซอร์ทุกห้องกลับสู่ค่าเริ่มต้นหรือไม่?')) {
      setClassrooms(INITIAL_CLASSROOMS);
      localStorage.removeItem(STORAGE_KEY);
      showToast('รีเซ็ตข้อมูลเซ็นเซอร์สู่ค่าเริ่มต้นแล้ว');
    }
  };

  // Calculate wasteful rooms
  const energyWasteCount = classrooms.filter(c => c.energyEcoAlert).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <Header
        isSimulationActive={isSimulationActive}
        onToggleSimulation={() => setIsSimulationActive(!isSimulationActive)}
        onEmergencyEcoAll={handleEmergencyEcoAll}
        onResetDefaults={handleResetDefaults}
        energyWasteCount={energyWasteCount}
      />

      {/* Dismissible Notification Toast */}
      {toastMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 text-xs text-emerald-900">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-500 hover:text-slate-800 cursor-pointer ml-4"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Dashboard Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 1. Building-wide Aggregated Overview */}
        <BuildingOverviewCards
          classrooms={classrooms}
          onSelectRoom={(id) => setSelectedRoomId(id)}
        />

        {/* 2. Classroom Selector Navigation */}
        <ClassroomSelector
          classrooms={classrooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={(id) => setSelectedRoomId(id)}
        />

        {/* 3. Room Detail View Header & Feature Tabs */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md font-mono font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ห้อง {selectedRoom.roomNumber}
                </span>
                <span className="text-xs text-slate-500">
                  ชั้น {selectedRoom.floor} • {selectedRoom.building}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
                {selectedRoom.name}
              </h2>
            </div>

            {/* View Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
              <button
                id="tab-view-simulator"
                onClick={() => setActiveTab('simulator')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'simulator'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>ห้องเรียนจำลอง (Simulator)</span>
              </button>

              <button
                id="tab-view-all"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>มุมมองรวม (All)</span>
              </button>

              <button
                id="tab-view-air"
                onClick={() => setActiveTab('air')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'air'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wind className="w-3.5 h-3.5" />
                <span>คุณภาพฝุ่น (PM2.5)</span>
              </button>

              <button
                id="tab-view-energy"
                onClick={() => setActiveTab('energy')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'energy'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>ไฟ & แอร์ (Energy)</span>
              </button>

              <button
                id="tab-view-schedule"
                onClick={() => setActiveTab('schedule')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'schedule'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>ตารางเรียน (Schedule)</span>
              </button>

              <button
                id="tab-view-waste"
                onClick={() => setActiveTab('waste')}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'waste'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ถังขยะอัจฉริยะ (Waste)</span>
              </button>
            </div>
          </div>

          {/* Tab Content Rendering */}
          <div className="mt-5 space-y-6">
            {(activeTab === 'all' || activeTab === 'simulator') && (
              <ClassroomSimulatorView
                classroom={selectedRoom}
                onToggleLight={handleToggleLight}
                onToggleAc={handleToggleAc}
                onUpdateAirPurifier={handleUpdateAirPurifier}
                onEmptyBin={handleEmptyBin}
              />
            )}

            {(activeTab === 'all' || activeTab === 'air') && (
              <AirQualitySection
                classroom={selectedRoom}
                onUpdateAirPurifier={handleUpdateAirPurifier}
              />
            )}

            {(activeTab === 'all' || activeTab === 'energy') && (
              <EnergyControlSection
                classroom={selectedRoom}
                onToggleLight={handleToggleLight}
                onUpdateLightDim={handleUpdateLightDim}
                onToggleAc={handleToggleAc}
                onUpdateAcTemp={handleUpdateAcTemp}
                onUpdateAcMode={handleUpdateAcMode}
                onTurnOffAllRoomEnergy={handleTurnOffAllRoomEnergy}
                onTurnOnEcoMode={handleTurnOnEcoMode}
              />
            )}

            {(activeTab === 'all' || activeTab === 'schedule') && (
              <ScheduleSection
                classroom={selectedRoom}
                onAddPeriod={handleAddPeriod}
              />
            )}

            {(activeTab === 'all' || activeTab === 'waste') && (
              <WasteManagementSection
                classroom={selectedRoom}
                onEmptyBin={handleEmptyBin}
                onEmptyAllRoomBins={handleEmptyAllRoomBins}
              />
            )}
          </div>
        </div>
      </main>

      {/* Sustainable Campus Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 mt-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">
              Innovating Classrooms for a Sustainable Future
            </span>
            <span>• Smart Eco-Campus Solution</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>เซ็นเซอร์ IoT PM2.5 / PIR / Ultrasonic Bins</span>
            <span>เป้าหมาย Net Zero 2030</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
