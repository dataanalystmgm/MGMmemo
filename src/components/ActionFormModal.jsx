import React, { useState } from 'react';
import { api } from '../utils/api';
import Swal from 'sweetalert2';

const ActionFormModal = ({ memos, stations, onClose, onRefresh }) => {
  const [memoId, setMemoId] = useState("");
  const [activityType, setActivityType] = useState("start"); // default 'start'
  const [currentStation, setCurrentStation] = useState("");
  const [nextStation, setNextStation] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!memoId || !currentStation) {
      Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Mohon isi ID Memo dan pilih Station saat ini.' });
      return;
    }

    if (activityType === 'finish' && !nextStation) {
      Swal.fire({ icon: 'warning', title: 'Next Station Kosong', text: 'Jika proses FINISH, Anda wajib memilih Next Station.' });
      return;
    }

    // Format otomatis ID Memo (Contoh: "43" jadi "m00043")
    let formattedId = memoId.toLowerCase().trim();
    if (!formattedId.startsWith('m')) {
      formattedId = 'm' + memoId.padStart(5, '0');
    }

    try {
      Swal.fire({ title: 'Memproses Data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      // 1. Validasi Keberadaan ID Memo di Client-side
      const matchedItem = memos.find(m => m["ID"]?.toString().toLowerCase().trim() === formattedId);
      if (!matchedItem) {
        throw new Error(`ID Memo ${formattedId} tidak ditemukan di sistem.`);
      }

      // 2. Ambil Konfigurasi Stasiun
      const targetStationConfig = stations.find(s => s.name === currentStation);
      if (!targetStationConfig) {
        throw new Error("Konfigurasi kolom stasiun gagal dimuat.");
      }

      // 3. Validasi Aturan Kerja (Mencegah Double Start)
      if (activityType === 'start' && matchedItem[targetStationConfig.start]) {
        throw new Error(`ID ${formattedId} sudah melakukan proses START di Station ${currentStation}.`);
      }

      // 4. STRATEGI HYBRID PAYLOAD: Kirim dua format sekaligus agar lolos validasi di utils/api Anda
      const targetColumn = activityType === 'start' ? targetStationConfig.start : targetStationConfig.end;
      const targetNext = activityType === 'finish' ? nextStation : null;

      const rawResponse = await api.sendData('updateProcess', {
        id: formattedId,
        column: targetColumn,
        nextStation: targetNext,
        payload: {
          id: formattedId,
          column: targetColumn,
          nextStation: targetNext
        }
      });

      // 5. EVALUASI RESPONS SUPER AMAN (PERBAIKAN UTAMA)
      let isSuccess = true;
      let serverMessage = "";

      if (rawResponse) {
        // Konversi seluruh bentuk objek/string respons menjadi teks string biasa agar mudah dianalisis
        const responseString = typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse);
        const lowerResponse = responseString.toLowerCase();

        // Cek apakah di dalam teks respons mengandung indikasi sukses
        if (lowerResponse.includes('"success"') || lowerResponse.includes('success')) {
          isSuccess = true;
        } else {
          // Ambil pesan error dari properti objek jika tersedia
          serverMessage = rawResponse?.message || rawResponse?.data?.message || "Gagal menyimpan perubahan ke database Sheet.";
        }
      }

      // 6. Eksekusi Tampilan Berdasarkan Status Evaluasi
      if (isSuccess) {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil Diperbarui',
          text: `Memo ${formattedId} berhasil di-update (${activityType.toUpperCase()}) di ${currentStation}`,
          timer: 1500,
          showConfirmButton: false
        });
        onRefresh();
        onClose();
      } else {
        throw new Error(serverMessage || "Respon server tidak dikenal atau format tidak sesuai.");
      }

    } catch (err) {
      console.error("Detail Error Log Lapangan:", err);
      Swal.fire({ 
        icon: 'error', 
        title: 'Transaksi Gagal', 
        text: err.message || 'Terjadi gangguan eksternal pada koneksi server.' 
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* HEADER */}
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-center">
          <h2 className="text-white font-black tracking-wider uppercase text-sm">Form Update Posisi Produksi</h2>
          <p className="text-white/70 text-[10px] mt-0.5">MGM Quality Control & Tracking System</p>
        </div>

        {/* BODY */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* TEXTBOX ID MEMO */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">1. ID Memo / Barcode</label>
            <input 
              type="text"
              autoFocus
              required
              className="w-full border-2 border-slate-200 focus:border-blue-500 bg-slate-50/50 p-3.5 mt-1.5 rounded-xl text-center text-xl font-black outline-none tracking-widest transition-all"
              placeholder="Contoh: 00124 atau m00124"
              value={memoId}
              onChange={(e) => setMemoId(e.target.value)}
            />
          </div>

          {/* CHECKLIST AKTIVITAS (START / FINISH) */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">2. Jenis Aktivitas</label>
            <div className="grid grid-cols-2 gap-3 mt-1.5">
              <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-xs cursor-pointer transition-all ${
                activityType === 'start' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}>
                <input 
                  type="radio" name="activity" value="start" className="hidden"
                  checked={activityType === 'start'} 
                  onChange={() => {
                    setActivityType('start');
                    setNextStation("");
                  }}
                />
                <span>▶ START PROCESS</span>
              </label>

              <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-bold text-xs cursor-pointer transition-all ${
                activityType === 'finish' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}>
                <input 
                  type="radio" name="activity" value="finish" className="hidden"
                  checked={activityType === 'finish'} onChange={() => setActivityType('finish')}
                />
                <span>■ FINISH PROCESS</span>
              </label>
            </div>
          </div>

          {/* CHECKLIST STATION SAAT INI */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">3. Station Saat Ini</label>
            <select
              required
              className="w-full border-2 border-slate-200 focus:border-blue-500 p-3 mt-1.5 rounded-xl bg-white text-xs font-bold text-slate-700 outline-none transition-all"
              value={currentStation}
              onChange={(e) => setCurrentStation(e.target.value)}
            >
              <option value="">-- Pilih Station Anda --</option>
              {stations.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* CHECKLIST NEXT STATION */}
          <div className={`transition-all duration-300 ${activityType === 'finish' ? 'opacity-100 max-h-24' : 'opacity-0 max-h-0 overflow-hidden'}`}>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">4. Next Station (Tujuan Selanjutnya)</label>
            <select
              required={activityType === 'finish'}
              className="w-full border-2 border-slate-200 focus:border-emerald-500 p-3 mt-1.5 rounded-xl bg-white text-xs font-bold text-slate-700 outline-none transition-all"
              value={nextStation}
              onChange={(e) => setNextStation(e.target.value)}
            >
              <option value="">-- Pilih Tujuan Pemindahan --</option>
              {stations.map(s => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
              <option value="FINISH">SELESAI PRODUKSI (KELUAR)</option>
            </select>
          </div>

          {/* TOMBOL AKSI */}
          <div className="flex gap-2 pt-2 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs uppercase"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-blue-100"
            >
              Simpan Data
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ActionFormModal;