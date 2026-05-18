import React, { useState, useRef } from 'react';
import { api } from '../utils/api';
import ThermalLabel from './ThermalLabel';
import { useReactToPrint } from 'react-to-print';
import Swal from 'sweetalert2';

const UpdateKonversiModal = ({ memo, onRefresh, onClose }) => {
  const [pass, setPass] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [form, setForm] = useState({ 
    qty: memo["Qty Konversi"] || '', 
    uom: memo["UoM Konversi"] || '' 
  });
  
  const printRef = useRef();

  // Konfigurasi print dengan delay internal untuk merender barcode
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Label_${memo["ID"]}`,
    onAfterPrint: () => {
      onRefresh();
      onClose();
    }
  });

  const handleUnlock = () => {
    if (pass === "3Rdong") { 
      setUnlocked(true);
      Swal.fire({
        icon: 'success',
        title: 'Akses Diterima',
        timer: 1000,
        showConfirmButton: false
      });
    } else { 
      Swal.fire({
        icon: 'error',
        title: 'Password Salah',
        text: 'Gunakan password otorisasi 3R.'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.qty || !form.uom) {
      return Swal.fire({
        icon: 'error',
        title: 'Data Tidak Lengkap',
        text: 'Harap isi Qty dan UoM Konversi.'
      });
    }

    Swal.fire({
      title: 'Memproses Data...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      /**
       * PENTING: Membungkus data dalam payload agar Code.gs 
       * bisa membaca payload.qty dan payload.uom (Kolom M & N)
       */
      await api.sendData('updateKonversi', { 
        id: memo["ID"], 
        qty: form.qty, 
        uom: form.uom 
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Data Berhasil Disimpan',
        text: 'Menyiapkan Barcode...',
        timer: 1000,
        showConfirmButton: false
      }).then(() => {
        // Jeda agar komponen ThermalLabel (yang transparan) selesai merender SVG Barcode
        setTimeout(() => {
          handlePrint();
        }, 600);
      });
      
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Update Gagal',
        text: 'Koneksi ke sistem bermasalah.'
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* TOMBOL CLOSE */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* PANEL KIRI: RINGKASAN DATA */}
        <div className="bg-slate-100 p-6 md:w-1/2 border-r border-slate-200">
          <h2 className="text-blue-900 font-bold mb-4 border-b border-slate-300 pb-2 uppercase text-sm tracking-tight">Detail Reject</h2>
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2">
              <span className="text-slate-500">ID</span>
              <span className="font-bold text-slate-800">: {memo["ID"]}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-slate-500">SPO#</span>
              <span className="font-bold text-slate-800">: {memo["SPO#"]}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-slate-500">Style</span>
              <span className="font-bold text-slate-800">: {memo["Style"]}</span>
            </div>
            <div className="grid grid-cols-2">
              <span className="text-slate-500">Part Material</span>
              <span className="font-bold text-slate-800">: {memo["Part/Material"]}</span>
            </div>
            <hr className="border-slate-300" />
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-[10px] text-blue-400 uppercase font-bold">Status Produksi:</p>
              <p className="text-xs italic text-blue-700">Validasi Konversi 3R System</p>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: FORM UPDATE */}
        <div className="p-6 md:w-1/2 flex flex-col justify-center">
          {!unlocked ? (
            <div className="text-center">
              <h2 className="font-bold text-slate-700 mb-4 uppercase text-xs tracking-widest">Otorisasi Keamanan</h2>
              <input 
                type="password" 
                autoFocus
                className="w-full border-2 border-slate-200 p-3 rounded-xl text-center mb-4 focus:border-blue-500 outline-none transition-all"
                placeholder="Password 3R"
                onChange={(e) => setPass(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              />
              <button onClick={handleUnlock} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md">
                UNLOCK FORM
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-bold text-slate-700 mb-2 uppercase text-xs tracking-widest">Input Data Konversi</h2>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Qty Hasil Konversi</label>
                <input 
                  type="number" 
                  step="any"
                  required
                  className="w-full border-2 border-blue-100 p-3 rounded-xl focus:border-blue-500 outline-none font-bold text-lg"
                  value={form.qty}
                  onChange={e => setForm({...form, qty: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UoM (Satuan)</label>
                <select 
                  required
                  className="w-full border-2 border-blue-100 p-3 rounded-xl focus:border-blue-500 outline-none bg-white font-semibold"
                  value={form.uom}
                  onChange={e => setForm({...form, uom: e.target.value})}
                >
                  <option value="">Pilih Satuan</option>
                  <option value="Pcs">Pcs</option>
                  <option value="Prs">Prs (Pasang)</option>
                  <option value="Set">Set</option>
                  <option value="Kg">Kg</option>
                  <option value="Meter">Meter</option>
                  <option value="Yard">Yard</option>
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all transform active:scale-95">
                  SIMPAN & CETAK LABEL
                </button>
                <button type="button" onClick={onClose} className="w-full text-slate-400 text-[10px] mt-4 hover:text-slate-600 uppercase font-bold tracking-widest">Batal</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* AREA PRINT (HIDDEN DYNAMICS): 
          Menggunakan Opacity 0.01 agar browser tetap merender 
          komponen Barcode sebelum jendela print menangkap gambarnya.
      */}
      <div 
        style={{ 
          position: 'absolute', 
          zIndex: -50,
          opacity: 0.01,
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }}
      >
        <div ref={printRef}>
          <ThermalLabel data={{ ...memo, qty: form.qty, uom: form.uom }} />
        </div>
      </div>
    </div>
  );
};

export default UpdateKonversiModal;