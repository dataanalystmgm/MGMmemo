import React, { useState } from 'react';
import UpdateKonversiModal from './UpdateKonversiModal';

const DashboardCard = ({ title, data, type, stationKey, onRefresh }) => {
  const [selectedMemo, setSelectedMemo] = useState(null);

  // --- FUNGSI FORMAT TANGGAL: dd mmm yy hh:mm ---
  const formatProductionDate = (dateSource) => {
    if (!dateSource) return "-";
    
    try {
      const d = new Date(dateSource);
      // Validasi apakah parsing tanggal berhasil dan valid
      if (isNaN(d.getTime())) return dateSource.toString().trim();

      const day = String(d.getDate()).padStart(2, '0');
      
      // Menggunakan singkatan nama bulan Indonesia/Inggris 3 huruf
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const monthStr = months[d.getMonth()];
      
      // Ambil 2 angka terakhir dari tahun
      const yearTwoDigits = String(d.getFullYear()).slice(-2);
      
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      return `${day}-${monthStr}-${yearTwoDigits} ${hours}:${minutes}`;
    } catch (e) {
      return dateSource.toString().trim(); // Fallback kembalikan teks asli jika gagal
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Header Card */}
      <div className="p-3 border-b bg-gray-50 rounded-t-xl flex justify-between items-center">
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">{title}</h3>
        <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {data ? data.length : 0}
        </span>
      </div>

      {/* List Item */}
      <div className="p-3 space-y-3 overflow-y-auto max-h-[400px] flex-grow bg-slate-50/50">
        {!data || data.length === 0 ? (
          <p className="text-gray-400 text-xs italic text-center py-4">Kosong</p>
        ) : (
          data.map((item, idx) => {
            
            // --- LOGIKA FILTRASI DINAMIS BERDASARKAN ISI KOLOM NEXT_STATION ---
            let isStarted = false;
            let startTimestampValue = "-";

            // 1. Ambil nilai rujukan dari kolom Next_Station di Google Sheet (Kolom AH)
            const nextStationVal = item["Next_Station"] || item["Next Station"] || item["AH"] || "";
            const cleanNextStation = nextStationVal.toString().trim();

            // 2. AMBIL KEY SECARA DINAMIS BERDASARKAN ISI KOLOM NEXT_STATION
            const currentStartKey = cleanNextStation ? `Start_${cleanNextStation}` : "";

            // 3. Cek apakah kolom Start_(isi Next_Station) tersebut ada isinya di database
            if (currentStartKey && item[currentStartKey] !== undefined && item[currentStartKey] !== null) {
              const valString = item[currentStartKey].toString().trim();
              
              if (valString !== "" && valString !== "-" && valString.toLowerCase() !== "false") {
                isStarted = true;
                // Masukkan data waktu asli ke fungsi format kita
                startTimestampValue = formatProductionDate(item[currentStartKey]); 
              }
            }

            // --- SELEKSI WARNA BACKGROUND ---
            const cardStyleClass = isStarted 
              ? "bg-amber-50/70 border-amber-200 hover:border-amber-400 text-amber-900" // On Progress (Kuning)
              : "bg-rose-50/60 border-rose-200 hover:border-rose-300 text-rose-900";    // Not Started (Merah Muda)

            return (
              <div 
                key={idx} 
                className={`p-3 border rounded-lg transition-all shadow-sm ${cardStyleClass}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-bold ${isStarted ? 'text-amber-700' : 'text-rose-700'}`}>
                    {item['SPO#'] || item['SPO'] || '-'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* Label status dinamis */}
                    <span className={`text-[8px] font-black uppercase px-1 rounded-sm tracking-wide ${
                      isStarted ? 'bg-amber-200/80 text-amber-800' : 'bg-rose-200/80 text-rose-800'
                    }`}>
                      {isStarted ? "⚡ ON PROGRESS" : "⏳ NOT STARTED"}
                    </span>
                    <span className="text-[10px] font-black text-slate-700 bg-white/80 border border-slate-200/60 px-1.5 py-0.5 rounded shadow-sm">
                      {item["ID"] || 'No ID'}
                    </span>
                  </div>
                </div>
                
                <p className="text-xs font-bold truncate text-slate-800">{item.Style || 'No Style Name'}</p>
                <p className="text-[10px] font-medium text-slate-500">
                  {item["Part/Material"] || item["Part"] || '-'} - {item.Size || '-'}
                </p>

                {/* --- MENAMPILKAN JAM DENGAN FORMAT TERBARU dd mmm yy hh:mm --- */}
                {isStarted && (
                  <div className="mt-1 flex items-center gap-1 text-[9px] font-semibold text-amber-800/80 bg-amber-100/50 px-1.5 py-0.5 rounded border border-amber-200/40 w-fit">
                    <span>⏱️ {cleanNextStation} Start:</span>
                    <span className="font-mono text-amber-900 font-bold">{startTimestampValue}</span>
                  </div>
                )}
                
                {/* Tombol Aksi - Hanya tampil untuk admin konversi awal */}
                {type === 'konversi' && (
                  <div className="mt-2.5">
                    <button 
                      onClick={() => setSelectedMemo(item)}
                      className="w-full py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] font-bold rounded shadow-md shadow-yellow-100 transition-all active:scale-95"
                    >
                      UPDATE & PRINT LABEL
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Khusus Admin 3R */}
      {selectedMemo && (
        <UpdateKonversiModal 
          memo={selectedMemo} 
          onClose={() => setSelectedMemo(null)} 
          onRefresh={onRefresh} 
        />
      )}
    </div>
  );
};

export default DashboardCard;