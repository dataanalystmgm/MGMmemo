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
      <div className="p-3 space-y-3 overflow-y-auto max-h-[400px] flex-grow">
        {data.length === 0 ? (
          <p className="text-gray-400 text-xs italic text-center py-4">Kosong</p>
        ) : (
          data.map((item, idx) => (
            <div key={idx} className="p-3 border rounded-lg hover:border-blue-300 transition-colors bg-white shadow-sm">
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-bold text-blue-500">{item['SPO#']}</span>
                <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                  {item["ID"] || 'No ID'}
                </span>
              </div>
              
              <p className="text-xs font-semibold text-gray-800 truncate">{item.Style}</p>
              <p className="text-[10px] text-gray-500">{item["Part/Material"]} - {item.Size}</p>
              
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
          ))
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