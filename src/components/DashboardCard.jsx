import React, { useState } from 'react';
import UpdateKonversiModal from './UpdateKonversiModal';

const DashboardCard = ({ title, data, type, stationKey, onRefresh }) => {
  const [selectedMemo, setSelectedMemo] = useState(null);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      {/* Header Card */}
      <div className="p-3 border-b bg-gray-50 rounded-t-xl flex justify-between items-center">
        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">{title}</h3>
        <span className="bg-blue-100 text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full">
          {data.length}
        </span>
      </div>

      {/* List Item */}
      <div className="p-3 space-y-3 overflow-y-auto max-h-[400px] flex-grow bg-slate-50/50">
        {data.length === 0 ? (
          <p className="text-gray-400 text-xs italic text-center py-4">Kosong</p>
        ) : (
          data.map((item, idx) => {
            // LOGIKA COLOUR MANAGEMENT BERDASARKAN STATUS START
            // Menyusun nama kolom target, contoh: "Start_Cutting" atau "Start_Sewing"
            const startColumnKey = `Start_${stationKey}`;
            const isStarted = item[startColumnKey] && item[startColumnKey].toString().trim() !== "";

            // Menentukan class warna background dan border card item
            const cardStyleClass = isStarted 
              ? "bg-amber-50/70 border-amber-200 hover:border-amber-400 text-amber-900" // On Progress (Kuning Muda)
              : "bg-rose-50/60 border-rose-200 hover:border-rose-300 text-rose-900";    // Not Started (Merah Muda)

            return (
              <div 
                key={idx} 
                className={`p-3 border rounded-lg transition-all shadow-sm ${cardStyleClass}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-[10px] font-bold ${isStarted ? 'text-amber-700' : 'text-rose-700'}`}>
                    {item['SPO#']}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* Badge Status Indikator Visual Tambahan */}
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
                
                <p className="text-xs font-bold truncate text-slate-800">{item.Style}</p>
                <p className="text-[10px] font-medium text-slate-500">{item["Part/Material"]} - {item.Size}</p>
                
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

      {/* Modal Khusus Admin 3R (Input Konversi) */}
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