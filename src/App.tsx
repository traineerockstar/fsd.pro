
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { processFieldDataFromImages } from './services/geminiService';
import type { ProcessedData } from './types';
import { ImageUploader } from './components/ImageUploader';
import { TimeSlotManager } from './components/TimeSlotManager';
import { DataTable } from './components/DataTable';
import { Notifications } from './components/Notifications';
import { Sidebar } from './components/Sidebar';
import { SidebarLeftIcon } from './components/Icons';

export default function App(): React.ReactElement {
  const [activeView, setActiveView] = useState<string>('tomorrow');
  const [stage, setStage] = useState<'input' | 'review' | 'saved'>('input');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string; }[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [jobCount, setJobCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  // --- LOCAL STORAGE: LOAD ---
  useEffect(() => {
    const saved = localStorage.getItem('tomorrowWorksheet');
    if (saved && activeView === 'tomorrow') {
      try {
        const data = JSON.parse(saved);
        setTimeSlots(data.timeSlots);
        setProcessedData(data.processedData);
        setJobCount(data.jobCount);
        setStage('review');
      } catch (e) {
        console.error("Failed to load saved worksheet", e);
      }
    }
  }, [activeView]);

  // --- LOCAL STORAGE: SAVE ---
  const handleSaveWorksheet = () => {
    const payload = { timeSlots, processedData, jobCount, date: new Date().toISOString() };
    localStorage.setItem('tomorrowWorksheet', JSON.stringify(payload));
    setStage('saved');
  };

  const handleProcessImages = useCallback(async () => {
    if (imageFiles.length === 0) {
      setError("Please upload at least one image.");
      return;
    }
    setIsProcessing(true);
    setError(null);
    setProcessedData(null);

    try {
      const base64Images = await Promise.all(
        imageFiles.map(file => new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        }))
      );

      const result = await processFieldDataFromImages(base64Images);
      setProcessedData(result);
      setJobCount(result.notifications.length);
      setStage('review');
    } catch (e) {
      console.error(e);
      setError("An error occurred while processing the images.");
    } finally {
      setIsProcessing(false);
    }
  }, [imageFiles]);

  // --- DYNAMIC NOTIFICATIONS ---
  const dynamicNotifications = useMemo(() => {
    if (!processedData?.notifications) return [];
    return processedData.notifications.map((msg, index) => {
        const slot = timeSlots[index];
        const timeString = slot ? `${slot.start} - ${slot.end}` : '[TIME]';
        return msg.replace('{{TIME_SLOT}}', timeString);
    });
  }, [processedData, timeSlots]);

  // --- DYNAMIC TABLE SYNC (THE FIX) ---
  const syncedDataTable = useMemo(() => {
    if (!processedData?.dataTable) return '';
    
    const lines = processedData.dataTable.trim().split('\n');
    let jobIndex = 0;

    const updatedLines = lines.map((line, index) => {
      // Skip if not a table row, or if it's the Header/Separator
      if (!line.includes('|') || line.includes('---')) return line;
      
      // Skip the very first row if it's the header (usually index 0)
      // We check if the line contains "Time" or "Address" to identify header
      if (line.toLowerCase().includes('time') && line.toLowerCase().includes('address')) return line;

      // Now we are in a data row. Get the slot.
      const slot = timeSlots[jobIndex];
      
      // If we ran out of slots, just return the line as is
      if (!slot) return line;

      const columns = line.split('|');
      // Markdown table: | Time | Address | ... 
      // Split results in: ["", " Time ", " Address ", ...]
      // So Time is at index 1.
      if (columns.length > 1) {
        columns[1] = ` ${slot.start} - ${slot.end} `;
        jobIndex++; // Only increment job index when we successfully updated a row
      }
      return columns.join('|');
    });

    return updatedLines.join('\n');
  }, [processedData, timeSlots]);

  // --- EXTRACT ADDRESSES ---
  const extractedAddresses = useMemo(() => {
    if (!syncedDataTable) return [];
    try {
        const lines = syncedDataTable.trim().split('\n');
        const tableLines = lines.filter(line => line.includes('|') && !line.includes('---') && !line.toLowerCase().includes('address'));
        return tableLines.map(line => {
            const cols = line.split('|');
            return cols[2] ? cols[2].trim() : '';
        });
    } catch (e) {
        return [];
    }
  }, [syncedDataTable]);

  // --- EXTRACT JOB DETAILS (Product & Fault) ---
  const extractedJobDetails = useMemo(() => {
    if (!syncedDataTable) return [];
    try {
        const lines = syncedDataTable.trim().split('\n');
        // Header row contains "Product Type" or "Address". We filter out non-data rows.
        const tableLines = lines.filter(line => 
            line.includes('|') && 
            !line.includes('---') && 
            !line.toLowerCase().includes('address')
        );
        
        return tableLines.map(line => {
            const cols = line.split('|');
            // Indices based on header: | Time | Address | Product Code | Product Type | Product Brand | Description of Fault | ...
            // Split array: ["", "Time", "Address", "Code", "Type", "Brand", "Fault", ...]
            return {
                productType: cols[4] ? cols[4].trim() : '',
                fault: cols[6] ? cols[6].trim() : '',
            };
        });
    } catch (e) {
        return [];
    }
  }, [syncedDataTable]);

  const handleImagesSelected = (files: File[]) => setImageFiles(files);

  // --- RENDER ---
  const renderContent = () => {
    if (activeView === 'tomorrow') {
        return (
            <div className="max-w-6xl mx-auto space-y-12">
                <header className="space-y-4 mb-16">
                    <h1 className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 drop-shadow-sm">
                        Plan Tomorrow's Schedule
                    </h1>
                    <p className="text-slate-400 text-lg font-light max-w-2xl leading-relaxed">
                        {stage === 'input' ? "Upload screenshots to generate schedule." : 
                         stage === 'review' ? "Review timeline, details, and adjust times." : 
                         "Worksheet saved."}
                    </p>
                </header>

                {stage === 'input' && (
                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                        <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-2 rounded-3xl">
                            <ImageUploader onFilesSelected={handleImagesSelected} />
                        </div>
                    </div>
                    {error && <div className="text-red-400 bg-red-900/20 p-4 rounded-xl border border-red-500/20">{error}</div>}
                    <div className="flex justify-end">
                        <button onClick={handleProcessImages} disabled={isProcessing || imageFiles.length === 0} className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all disabled:opacity-50">
                            {isProcessing ? "Analyzing..." : "Generate Schedule"}
                        </button>
                    </div>
                </div>
                )}

                {stage === 'review' && processedData && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <TimeSlotManager 
                        jobCount={jobCount} 
                        timeSlots={timeSlots} 
                        onTimeSlotsChange={setTimeSlots} 
                        addresses={extractedAddresses}
                        jobDetails={extractedJobDetails}
                    />

                    <div className="fixed bottom-8 right-8 z-50">
                        <button onClick={handleSaveWorksheet} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-3">
                            <span>Approve & Save</span>
                        </button>
                    </div>
                </div>
                )}

                {stage === 'saved' && (
                    <div className="text-center py-32 space-y-8 animate-in fade-in zoom-in duration-500">
                        <h2 className="text-4xl font-bold text-white mb-2">Worksheet Saved</h2>
                        <p className="text-slate-400">You can view messages in the 'Messages' tab.</p>
                        <button onClick={() => { setStage('input'); setImageFiles([]); setTimeSlots([]); setProcessedData(null); localStorage.removeItem('tomorrowWorksheet'); }} className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-slate-200">
                            Start New Worksheet
                        </button>
                    </div>
                )}
            </div>
        );
    }

    if (activeView === 'messages') {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="mb-8 border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">Customer Messages</h1>
                </header>
                <Notifications messages={dynamicNotifications} />
            </div>
        );
    }

    return <div className="text-center py-40 text-slate-500">View: {activeView}</div>;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-slate-200 font-sans selection:bg-cyan-500/30 flex overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        onNavigate={setActiveView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Sidebar Backdrop */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Open Sidebar Button (Only visible when closed) */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className={`fixed top-4 left-4 md:top-6 md:left-6 z-[60] p-2.5 rounded-xl bg-black/50 text-white backdrop-blur-md border border-white/10 shadow-lg hover:bg-white/10 hover:scale-105 transition-all duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none -translate-x-4' : 'opacity-100 translate-x-0'}`}
        aria-label="Open Menu"
      >
        <SidebarLeftIcon />
      </button>

      <main className={`flex-1 h-screen overflow-y-auto w-full relative scroll-smooth transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
         <div className="p-6 md:p-12 pb-32 md:pb-12 max-w-[1600px] mx-auto">
             {renderContent()}
         </div>
      </main>
    </div>
  );
}
