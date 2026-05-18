import React, { useState } from 'react';
import { api } from '../utils/api';
import Swal from 'sweetalert2';

const AddMemoModal = ({ onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    nama: '', bagian: '', spo: '', style: '', 
    color: '', size: '', part: '', pcs_kiri: 0, pcs_kanan: 0, foto: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Menyimpan Memo...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });
    
    // Pastikan input pcs dikonversi ke Number agar tipenya sesuai di Google Sheet
    const payload = [
      formData.nama,                          // Kolom C
      formData.bagian,                        // Kolom D
      formData.spo,                           // Kolom E
      formData.style,                         // Kolom F
      formData.color,                         // Kolom G
      formData.size,                          // Kolom H
      formData.part,                          // Kolom I
      Number(formData.pcs_kiri) || 0,         // Kolom J
      Number(formData.pcs_kanan) || 0,        // Kolom K
      formData.foto                           // Kolom L
    ];
    
    try {
      // PERBAIKAN: Tampung hasil response ke dalam variabel 'res'
      const res = await api.sendData('addMemo', { payload });
      
      // Validasi jika Google Apps Script mengirim status sukses
      if (res && res.status === "Success") {
        await Swal.fire({
          icon: 'success',
          title: 'Berhasil!',
          text: `Memo tersimpan dengan ID: ${res.id || ''}`, 
          timer: 2000,
          showConfirmButton: false
        });
        onRefresh();
        onClose();
      } else {
        // Jika backend Apps Script mengirimkan status error
        throw new Error(res.message || 'Gagal menyimpan data ke sheet.');
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.message || 'Terjadi kesalahan saat menyimpan data.'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
          <div>
            <h2 className="font-bold uppercase tracking-tight">Tambah Memo Produksi</h2>
            <p className="text-[10px] opacity-80 uppercase font-bold">ID akan dibuat otomatis oleh sistem</p>
          </div>
          <button onClick={onClose} className="text-2xl hover:opacity-70 transition-opacity">&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
          <input className="border-2 border-slate-100 p-2 rounded-lg text-sm focus:border-blue-500 outline-none" placeholder="Nama Lengkap" onChange={e => setFormData({...formData, nama: e.target.value})} required />
          <input className="border-2 border-slate-100 p-2 rounded-lg text-sm focus:border-blue-500 outline-none" placeholder="Bagian (Dept)" onChange={e => setFormData({...formData, bagian: e.target.value})} required />
          <input className="border-2 border-slate-100 p-2 rounded-lg text-sm focus:border-blue-500 outline-none" placeholder="SPO#" onChange={e => setFormData({...formData, spo: e.target.value})} required />
          <input className="border-2 border-slate-100 p-2 rounded-lg text-sm focus:border-blue-500 outline-none" placeholder="Warna / Colour" onChange={e => setFormData({...formData, color: e.target.value})} />
          <input className="border-2 border-slate-100 p-2 rounded-lg text-sm col-span-2 focus:border-blue-500 outline-none" placeholder="Style Name" onChange={e => setFormData({...formData, style: e.target.value})} required />
          <input className="border-2 border-slate-100 p-2 rounded-lg text-sm focus:border-blue-500 outline-none" placeholder="Size" onChange={e => setFormData({...formData, size: e.target.value})} />
          <input className="border-2 border-slate-100 p-2 rounded-lg text-sm focus:border-blue-500 outline-none" type="text" placeholder="Foto URL (Opsional)" onChange={e => setFormData({...formData, foto: e.target.value})} />
          <input className="border-2 border-slate-100 p-2 rounded-lg text-sm col-span-2 focus:border-blue-500 outline-none" placeholder="Part / Material Name" onChange={e => setFormData({...formData, part: e.target.value})} />
          
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Pcs Kiri</label>
            <input className="border-2 border-slate-100 p-2 rounded-lg text-sm focus:border-blue-500 outline-none" type="number" placeholder="0" onChange={e => setFormData({...formData, pcs_kiri: e.target.value})} />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 mb-1 uppercase">Pcs Kanan</label>
            <input className="border-2 border-slate-100 p-2 rounded-lg text-sm focus:border-blue-500 outline-none" type="number" placeholder="0" onChange={e => setFormData({...formData, pcs_kanan: e.target.value})} />
          </div>
          
          <div className="col-span-2 mt-4 flex gap-3">
            <button type="submit" className="flex-[2] bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95">SIMPAN MEMO</button>
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-500 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">BATAL</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemoModal;