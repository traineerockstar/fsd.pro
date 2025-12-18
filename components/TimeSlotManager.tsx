import React, { useEffect } from 'react';
import { TravelConnector } from './TravelConnector';
import { ChevronDownIcon } from './Icons';

type TimeSlot = {
  start: string;
  end: string;
};

interface TimeSlotManagerProps {
  jobCount: number;
  timeSlots: TimeSlot[];
  onTimeSlotsChange: (slots: TimeSlot[]) => void;
  addresses?: string[];
  jobDetails: { productType: string; fault: string; }[];
}

const timeOptions = (() => {
  const options = [];
  // 06:00 (360) to 23:00 (1380)
  for (let totalMinutes = 360; totalMinutes <= 1380; totalMinutes += 30) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    options.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
  }
  return options;
})();

export const TimeSlotManager: React.FC<TimeSlotManagerProps> = ({ 
  jobCount, 
  timeSlots, 
  onTimeSlotsChange, 
  addresses = [],
  jobDetails = []
}) => {
  
  useEffect(() => {
    if (jobCount > 0 && timeSlots.length === 0) {
      const initialSlots: TimeSlot[] = [];
      initialSlots.push({ start: '07:30', end: '08:30' });
      
      let currentStartMinutes = 8 * 60; 
      for (let i = 1; i < jobCount; i++) {
        const hours = Math.floor(currentStartMinutes / 60);
        const minutes = currentStartMinutes % 60;
        const startStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        
        const endMinutes = currentStartMinutes + 120;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;
        const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

        initialSlots.push({ start: startStr, end: endStr });
        currentStartMinutes += 120; 
      }
      onTimeSlotsChange(initialSlots);
    }
  }, [jobCount, onTimeSlotsChange, timeSlots.length]);

  const handleStartTimeChange = (index: number, newStart: string) => {
    const newSlots = [...timeSlots];
    const currentSlot = newSlots[index];

    // Calculate current duration
    const [oldStartH, oldStartM] = currentSlot.start.split(':').map(Number);
    const [oldEndH, oldEndM] = currentSlot.end.split(':').map(Number);
    let durationMinutes = (oldEndH * 60 + oldEndM) - (oldStartH * 60 + oldStartM);
    
    // Fallback if invalid duration (e.g. crossing midnight or zero)
    if (durationMinutes <= 0) durationMinutes = 120;

    const [h, m] = newStart.split(':').map(Number);
    const startMins = h * 60 + m;
    const endMins = startMins + durationMinutes;
    const endH = Math.floor(endMins / 60);
    const endM = endMins % 60;
    const newEnd = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
    
    newSlots[index] = { start: newStart, end: newEnd };
    onTimeSlotsChange(newSlots);
  };

  const handleEndTimeChange = (index: number, newEnd: string) => {
    const newSlots = [...timeSlots];
    const currentSlot = newSlots[index];
    newSlots[index] = { ...currentSlot, end: newEnd };
    onTimeSlotsChange(newSlots);
  };

  return (
    <div className="space-y-0">
       <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-6">
        Job Schedule
      </h2>

      {timeSlots.map((slot, index) => {
        const details = jobDetails[index] || { productType: 'Unknown', fault: 'No details available' };
        
        return (
        <div key={index} className="relative">
          
          {/* The Job Card */}
          <div className="relative z-10 group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 flex flex-col lg:flex-row lg:items-center gap-6 shadow-lg">
              
              {/* Job Badge */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">JOB</span>
                  <span className="text-2xl font-black text-white">{index + 1}</span>
                </div>
              </div>

              {/* Job Details (Product Type & Fault) */}
              <div className="flex-1 min-w-0 space-y-2 lg:pr-8">
                  <div>
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Product Type</span>
                      <h4 className="text-lg font-bold text-cyan-100 truncate" title={details.productType}>{details.productType}</h4>
                  </div>
                  <div>
                      <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Fault Description</span>
                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-2" title={details.fault}>{details.fault}</p>
                  </div>
              </div>

              {/* Time Controls */}
              <div className="flex-shrink-0 w-full lg:w-auto grid grid-cols-2 gap-4 border-t lg:border-t-0 lg:border-l border-white/5 pt-4 lg:pt-0 lg:pl-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">Start Time</label>
                  <div className="relative">
                    <select
                      value={slot.start}
                      onChange={(e) => handleStartTimeChange(index, e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pr-10 text-cyan-100 font-mono text-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none appearance-none transition-all hover:bg-white/5 min-w-[120px] cursor-pointer"
                    >
                      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                        <ChevronDownIcon />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold ml-1">End Time</label>
                  <div className="relative">
                    <select
                      value={slot.end}
                      onChange={(e) => handleEndTimeChange(index, e.target.value)}
                      className="w-full bg-slate-900/30 border border-white/5 rounded-xl px-4 py-3 pr-10 text-slate-400 font-mono text-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none appearance-none transition-all hover:bg-white/5 min-w-[120px] cursor-pointer"
                    >
                      {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
                        <ChevronDownIcon />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Travel Connector Logic */}
          {index < timeSlots.length - 1 && (
             <div className="pl-8 relative z-0">
                <TravelConnector 
                  origin={addresses[index] || ''} 
                  destination={addresses[index+1] || ''} 
                />
             </div>
          )}
        </div>
        );
      })}
    </div>
  );
};