import React from 'react';
import Barcode from 'react-barcode';

const ThermalLabel = React.forwardRef(({ data }, ref) => {
  if (!data) return null;

  return (
    <div ref={ref}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: 80mm 50mm; margin: 0; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          .print-area { display: block !important; }
        }
      `}} />

      <div className="print-area w-[80mm] h-[50mm] p-2 bg-white text-black border-[1px] border-black flex flex-col items-center mx-auto overflow-hidden">
        
        {/* HEADER & BARCODE (Skala 80%) */}
        <div className="w-full flex flex-col items-center border-b border-black pb-1 mb-1">
          <h1 className="text-[9px] font-black uppercase tracking-tighter mb-1">MGM PRODUCTION INFO - 3R VALIDATED</h1>
          <div className="scale-[0.8] origin-center">
            <Barcode 
              value={data["ID"] || "00000"} 
              width={1.5} 
              height={30} 
              fontSize={14}
              margin={0}
              displayValue={true} 
            />
          </div>
        </div>

        {/* INFORMASI PRODUKSI (GRID SISTEM) */}
        <div className="w-full text-[9px] font-bold leading-[1.1] space-y-1">
          {/* Baris 1: Style & SPO */}
          <div className="grid grid-cols-2 gap-2">
            <div className="truncate">STYLE: <span className="font-normal">{data["Style"] || "-"}</span></div>
            <div className="truncate text-right">SPO: <span className="font-normal">{data["SPO#"] || "-"}</span></div>
          </div>

          {/* Baris 2: Material & Colour/Size */}
          <div className="grid grid-cols-2 gap-2">
            <div className="truncate">PART: <span className="font-normal">{data["Part/Material"] || "-"}</span></div>
            <div className="truncate text-right">COL/SZ: <span className="font-normal">{data["Colour"]}/{data["Size"]}</span></div>
          </div>

          {/* Baris 3: Nama & Bagian */}
          <div className="flex justify-between border-t border-dotted border-gray-400 pt-1">
            <div className="truncate">NAME: <span className="font-normal">{data["Nama"] || "-"}</span></div>
            <div className="truncate">DEPT: <span className="font-normal">{data["Bagian"] || "-"}</span></div>
          </div>

          {/* Baris 4: Detail Reject & Hasil Konversi */}
          <div className="flex justify-between items-center bg-slate-50 p-1 border border-black rounded-sm mt-1">
            <div className="flex flex-col text-[8px]">
              <span>REJECT: L({data["Pcs Kiri"]}) | R({data["Pcs Kanan"]})</span>
              <span className="italic text-[7px] font-normal">Original Reject Total: {Number(data["Pcs Kiri"]) + Number(data["Pcs Kanan"])} Pcs</span>
            </div>
            <div className="text-right">
              <span className="text-[8px] block uppercase">Qty Konversi:</span>
              <span className="text-[13px] font-black">{data.qty} {data.uom}</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="w-full mt-auto flex justify-between text-[6px] font-bold border-t border-black pt-1">
          <span>DATE: {new Date().toLocaleDateString('id-ID')}</span>
          <span>TS: {data["Timestamp"] || "N/A"}</span>
        </div>
      </div>
    </div>
  );
});

export default ThermalLabel;