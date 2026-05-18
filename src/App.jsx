import React, { useState, useEffect } from 'react';
import DashboardCard from './components/DashboardCard';
import AddMemoModal from './components/AddMemoModal';
import ActionFormModal from './components/ActionFormModal'; // Menggunakan form modal baru
import LoadingScreen from './components/LoadingScreen'; 
import { useSheetData } from './hooks/useSheetData'; 

function App() {
  const { memos, loading, refreshData } = useSheetData();
  const [showAdd, setShowAdd] = useState(false);
  const [showActionForm, setShowActionForm] = useState(false); // Kontrol modal form tunggal

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const butuhKonversi = memos.filter(m => m["Validasi"] !== true);
  
  // Konfigurasi stasiun lengkap dengan pemetaan kolom sheet untuk divalidasi di form
  const stations = [
    { name: "3R", start: "Start_3R", end: "Finish_3R" },
    { name: "Gudang", start: "Start_Gudang", end: "Finish_Gudang" },
    { name: "Cutting", start: "Start_Cutting", end: "Finish_Cutting" },
    { name: "Accesories", start: "Start_Accesories", end: "Finish_Accesories" },
    { name: "Incoming", start: "Start_Incoming", end: "Finish_Incoming" },
    { name: "Auto", start: "Start_Auto", end: "Finish_Auto" },
    { name: "M4/HT", start: "Start_M4HT", end: "Finish_M4HT" },
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
          className="bg-blue-600 hover:bg-blue-700 text-white w-12 h-12 rounded-full text-3xl shadow-lg flex items-center justify-center transition-transform active:scale-90"
        >
          +
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
                    stationKey={st} 
                    onRefresh={refreshData}
                  />
                ))}
             </div>
          </div>

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
//end
export default App;