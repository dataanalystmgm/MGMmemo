import React, { useState, useEffect } from 'react';
import DashboardCard from './components/DashboardCard';
import AddMemoModal from './components/AddMemoModal';
import ActionFormModal from './components/ActionFormModal'; 
import LoadingScreen from './components/LoadingScreen'; 
import { useSheetData } from './hooks/useSheetData'; 

function App() {
  const { memos, loading, refreshData } = useSheetData();
  const [showAdd, setShowAdd] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false); 

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const butuhKonversi = memos.filter(m => m["Validasi"] !== true);
  
  // Konfigurasi stasiun lengkap dengan pemetaan kolom sheet untuk divalidasi di form
  const stations = [
    { name: "3R", start: "Start_3R", end: "Finish_3R" },
    { name: "Gudang", start: "Start_Gudang", end: "Finish_Gudang" },
    { name: "Cutting", start: "Start_Cutting", end: "Finish_Cutting" },
    { name: "Accessories", start: "Start_Accessories", end: "Finish_Accessories" },
    { name: "Incoming", start: "Start_Incoming", end: "Finish_Incoming" },
    { name: "Auto", start: "Start_Auto", end: "Finish_Auto" },
    { name: "M4/HT", start: "Start_M4/HT", end: "Finish_M4/HT" },
    { name: "Sewing", start: "Start_Sewing", end: "Finish_Sewing" },
  ];

  const getStationData = (st) => {
    return memos.filter(m => {
      if (st.name === "3R") {
        return m["Validasi"] === true && !m["Finish_3R"];
      }
      return m["Next_Station"] === st.name && !m[st.end];
    });
  };

  // --- FILTER BARU: Mengumpulkan Memo yang status Next_Station-nya sudah "FINISH" ---
  const finishedMemos = memos.filter(m => {
    const nextSt = m["Next_Station"] || m["Next Station"] || "";
    return nextSt.toString().trim().toUpperCase() === "FINISH";
  });

  return (
    <div className="bg-slate-50 min-h-screen pb-10">
      {loading && <LoadingScreen />}

      {/* HEADER UTAMA */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-blue-900 uppercase tracking-tight">MGM PRODUCTION INFO</h1>
          <p className="text-xs text-slate-500 font-medium italic">Reject Replacement Tracking System</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white w-40 h-12 text-lg shadow-lg flex items-center justify-center transition-transform active:scale-90"
        >
          Add Memo
        </button>
      </header>

      <main className="p-6 space-y-6">
        
        {/* TOMBOL TUNGGAL DI ATAS */}
        <div className="max-w-md mx-auto bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <button
            onClick={() => setShowActionForm(true)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm tracking-wider uppercase shadow-md active:scale-95 transition-all text-center"
          >
            UPDATE PROSES (START / FINISH)
          </button>
        </div>

        {/* AREA KOTAK JALUR PRODUKSI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* KOLOM KIRI: ANTRIAN ADMIN */}
          <div className="space-y-6">
            <DashboardCard 
              title="Butuh Konversi" 
              data={butuhKonversi} 
              type="konversi" 
              onRefresh={refreshData} 
            />
          </div>

          {/* KOLOM KANAN: LANTAI PRODUKSI */}
          <div className="md:col-span-3">
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stations.map(st => (
                  <DashboardCard 
                    key={st.name} 
                    title={st.name} 
                    data={getStationData(st)} 
                    type="station"
                    stationKey={st.name} 
                    onRefresh={refreshData}
                  />
                ))}
             </div>
          </div>
        </div>

        {/* --- SPACE BARU: DAFTAR HISTORY MEMO YANG SUDAH SELESAI TOTAL --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <div>
              <h2 className="text-slate-800 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                ✅ History Selesai Produksi (Out)
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Daftar item reject replacement yang telah menyelesaikan seluruh tahapan stasiun</p>
            </div>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full shadow-sm">
              {finishedMemos.length} Memo Keluar
            </span>
          </div>

          {finishedMemos.length === 0 ? (
            <p className="text-slate-400 text-xs italic text-center py-6">Belum ada memo yang berstatus SELESAI / FINISH.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 max-h-[260px] overflow-y-auto pr-1">
              {finishedMemos.map((item, idx) => (
                <div key={idx} className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl flex flex-col justify-between hover:border-emerald-300 transition-all shadow-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-black text-emerald-700">{item['SPO#'] || item['SPO'] || '-'}</span>
                    <span className="text-[9px] font-mono font-black bg-white border border-emerald-200 text-slate-700 px-1.5 py-0.5 rounded shadow-xs">
                      {item["ID"]}
                    </span>
                  </div>
                  <p className="text-xs font-bold truncate text-slate-800 mt-1">{item.Style}</p>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">{item["Part/Material"]} ({item.Size})</p>
                  
                  <div className="mt-2 pt-1.5 border-t border-emerald-100/60 flex justify-between items-center text-[9px] text-emerald-600 font-bold">
                    <span>STATUS TOTAL:</span>
                    <span className="bg-emerald-600 text-white px-1 rounded font-black text-[8px]">OUT / COMPLETED</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {showAdd && (
        <AddMemoModal onClose={() => setShowAdd(false)} onRefresh={refreshData} />
      )}

      {/* FORM MODAL MANUAL */}
      {showActionForm && (
        <ActionFormModal 
          memos={memos} 
          stations={stations} 
          onClose={() => setShowActionForm(false)} 
          onRefresh={refreshData} 
        />
      )}
    </div>
  );
}

export default App;