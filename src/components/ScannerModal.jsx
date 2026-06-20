import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../utils/api';
import Swal from 'sweetalert2';

const ScannerModal = ({ type, memos, stations, onClose, onRefresh }) => {
  const [manualMode, setManualMode] = useState(false);
  const [manualId, setManualId] = useState("");
  const qrCodeRef = useRef(null);

  const handleScanAction = async (decodedText) => {
    try {
      // 1. Matikan kamera sejenak
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        await qrCodeRef.current.stop();
      }

      // 2. DETEKSI OTOMATIS: Cari data barang di dalam list memos berdasarkan ID Barcode
      const currentItem = memos.find(m => m["ID"]?.toString().toLowerCase().trim() === decodedText.toLowerCase().trim());
      
      if (!currentItem) {
        throw new Error(`ID Barcode ${decodedText} tidak ditemukan di sistem.`);
      }

      // 3. DETEKSI POSISI STATION BARANG SAAT INI
      let activeStationKey = null;
      if (currentItem["Validasi"] === true && !currentItem["Finish_3R"]) {
        activeStationKey = stations.find(s => s.name === "3R");
      } else {
        activeStationKey = stations.find(s => s.name === currentItem["Next_Station"]);
      }

      if (!activeStationKey) {
        throw new Error("Barang belum divalidasi admin atau sudah selesai diproduksi.");
      }

      // ============================================================
      // VALIDASI KUNCI TOMBOL: JIKA START SUDAH ADA, TIDAK BISA START LAGI
      // ============================================================
      if (type === 'start' && currentItem[activeStationKey.start]) {
        throw new Error(`Barang ini sudah melakukan proses START di Station ${activeStationKey.name}.`);
      }

      let nextDest = null;

      // 4. JIKA FINISH: Tampilkan Pilihan Station Tujuan Selanjutnya
      if (type === 'finish') {
        const { value: selectedDest } = await Swal.fire({
          title: `Finish di ${activeStationKey.name}, Kirim ke Mana?`,
          input: 'select',
          inputOptions: {
            'Gudang': 'Gudang',
            'Cutting': 'Cutting',
            'Accessories': 'Accessories',
            'Incoming': 'Incoming',
            'Auto': 'Auto',
            'M4/HT': 'M4/HT',
            'Sewing': 'Sewing',
            'FINISH': 'Selesai Produksi (Keluar)'
          },
          inputPlaceholder: 'Pilih Station Selanjutnya',
          showCancelButton: true,
          allowOutsideClick: false
        });

        if (!selectedDest) {
          if (!manualMode) window.location.reload(); 
          return;
        }
        nextDest = selectedDest;
      }

      // 5. Loading kirim ke database
      Swal.fire({ title: 'Menyimpan Data...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      // 6. Kirim data target kolom yang dinamis hasil deteksi otomatis di atas
      const response = await api.sendData('updateProcess', {
        id: decodedText,
        column: type === 'start' ? activeStationKey.start : activeStationKey.end,
        nextStation: nextDest
      });

      if (response.status === "Success") {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `Aktivitas ${type.toUpperCase()} terekam di Station ${activeStationKey.name}`,
          timer: 1500,
          showConfirmButton: false
        });
        onRefresh();
        onClose();
      } else {
        throw new Error(response.message || "Gagal menyimpan");
      }

    } catch (err) {
      console.error(err);
      await Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: err.message });
      onClose(); // Tutup modal jika terjadi error validasi
    }
  };

  useEffect(() => {
    if (!manualMode) {
      const html5QrCode = new Html5Qrcode("reader");
      qrCodeRef.current = html5QrCode;
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };

      html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => { handleScanAction(decodedText); }
      ).catch(err => console.error("Kamera error:", err));
    }

    return () => {
      if (qrCodeRef.current && qrCodeRef.current.isScanning) {
        qrCodeRef.current.stop()
          .then(() => qrCodeRef.current.clear())
          .catch(err => console.error("Cleanup error:", err));
      }
    };
  }, [manualMode]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualId) return;
    let formattedId = manualId.toLowerCase().trim();
    if (!formattedId.startsWith('m')) {
      formattedId = 'm' + manualId.padStart(5, '0');
    }
    handleScanAction(formattedId);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/95 z-[100] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl">
        
        <div className={`p-6 text-center ${type === 'start' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
          <h2 className="text-white font-black tracking-widest uppercase">SCANNER {type}</h2>
          <p className="text-white/70 text-[10px] mt-1 font-medium">Sistem Pendeteksi Otomatis - MGM</p>
        </div>

        <div className="p-6">
          {!manualMode ? (
            <div className="space-y-4">
              <div id="reader" className="overflow-hidden rounded-2xl bg-black aspect-square border-4 border-slate-100"></div>
              <button onClick={() => setManualMode(true)} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs">INPUT ID MANUAL</button>
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="text-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID Barcode</label>
                <input 
                  autoFocus
                  className="w-full border-2 border-blue-500 mt-2 p-4 rounded-2xl text-center text-2xl font-black outline-none"
                  placeholder="000xx"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setManualMode(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold text-xs uppercase">Kamera</button>
                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold text-xs uppercase">Konfirmasi</button>
              </div>
            </form>
          )}
        </div>

        <button onClick={onClose} className="w-full p-4 text-slate-400 text-[10px] font-bold border-t uppercase tracking-widest">Batal</button>
      </div>
    </div>
  );
};

export default ScannerModal;