import React, { useMemo, useState, useEffect, useCallback } from 'react';
import api from '../api';

const DAFTAR_SUMBER_DANA = ['Kas OSIS', 'Dana Sekolah', 'Sponsor', 'Lainnya'];
const SEPARATED_CACHE_KEY = 'ositara_keuangan_separated_v1';
const OVERRIDE_CACHE_KEY = 'ositara_keuangan_overrides_v1';

// Helper Normalisasi Data Universal
const normalizeJenis = (item) => {
  if (!item || typeof item !== 'object') return 'Pemasukan';
  const raw = String(
    item?.jenis ??
      item?.jenis_transaksi ??
      item?.tipe ??
      item?.type ??
      item?.kategori ??
      ''
  )
    .toLowerCase()
    .trim();

  if (
    raw === 'pengeluaran' ||
    raw === 'keluar' ||
    raw === 'expense' ||
    raw === 'debit' ||
    raw === 'out' ||
    raw.includes('keluar') ||
    raw.includes('expense')
  ) {
    return 'Pengeluaran';
  }
  return 'Pemasukan';
};

const normalizeNominal = (item) => {
  if (!item || typeof item !== 'object') return 0;
  const raw = item?.jumlah ?? item?.nominal ?? item?.amount ?? 0;
  if (typeof raw === 'number') return Number.isNaN(raw) ? 0 : raw;
  const parsed = Number(String(raw).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const normalizeSumberKategori = (item) => {
  const raw = String(
    item?.kategori_sumber || item?.sumber || item?.sumber_dana || 'Kas OSIS'
  );
  if (raw.toLowerCase().includes('sekolah')) return 'Dana Sekolah';
  if (raw.toLowerCase().includes('sponsor')) return 'Sponsor';
  if (raw.toLowerCase().includes('kas')) return 'Kas OSIS';
  return 'Lainnya';
};

const normalizeSumberLabel = (item) => {
  return item?.sumber || item?.kategori_sumber || item?.sumber_dana || 'Kas OSIS';
};

const normalizeBuktiNota = (item) => {
  const raw =
    item?.bukti_nota || item?.buktiNota || item?.nota || item?.foto_nota || '';
  if (!raw || typeof raw !== 'string') return '';
  if (raw.startsWith('data:image') || raw.startsWith('http')) return raw;
  return `http://localhost:8000/storage/${raw.replace(/^\/+/, '')}`;
};

const getFingerprint = (item) => {
  const tgl = String(item?.tanggal || '').split('T')[0].split(' ')[0];
  const ket = String(item?.keterangan || '').trim().toLowerCase();
  const nom = normalizeNominal(item);
  const jns = normalizeJenis(item);
  return `${tgl}|${ket}|${nom}|${jns}`;
};

// Membaca seluruh data keuangan dari localStorage (termasuk separated cache Bendahara)
const readAllLocalKeuangan = () => {
  const collected = [];

  try {
    const sepRaw = localStorage.getItem(SEPARATED_CACHE_KEY);
    if (sepRaw) {
      const sep = JSON.parse(sepRaw);
      if (Array.isArray(sep?.pemasukan)) {
        sep.pemasukan.forEach((it) =>
          collected.push({ ...it, jenis: 'Pemasukan', tipe: 'Pemasukan' })
        );
      }
      if (Array.isArray(sep?.pengeluaran)) {
        sep.pengeluaran.forEach((it) =>
          collected.push({ ...it, jenis: 'Pengeluaran', tipe: 'Pengeluaran' })
        );
      }
    }
  } catch {
    // Abaikan error parse
  }

  const keysToCheck = [
    'ositara_keuangan_list',
    'ositara_keuangan',
    'keuanganList',
    'keuangan',
    'data_keuangan',
    'ositara_laporan_keuangan',
  ];

  for (const key of keysToCheck) {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          collected.push(...parsed);
        }
      }
    } catch {
      // Abaikan error parse
    }
  }

  return collected;
};

// Menggabungkan & menduplikasi transaksi dari berbagai sumber tanpa menghilangkan pengeluaran
const mergeAndDedupeKeuangan = (...sources) => {
  let overrides = {};
  try {
    overrides = JSON.parse(localStorage.getItem(OVERRIDE_CACHE_KEY) || '{}');
  } catch {
    overrides = {};
  }

  const seenIds = new Set();
  const seenFps = new Set();
  const mergedResult = [];

  for (const src of sources) {
    if (!Array.isArray(src)) continue;
    for (const rawItem of src) {
      if (!rawItem || typeof rawItem !== 'object') continue;
      const ov =
        (rawItem.id !== undefined &&
          rawItem.id !== null &&
          overrides[`id:${rawItem.id}`]) ||
        overrides[`fp:${getFingerprint(rawItem)}`] ||
        null;
      const item = ov ? { ...rawItem, ...ov, id: rawItem.id ?? ov.id } : rawItem;

      const jenisFix = normalizeJenis(item);
      const nomFix = normalizeNominal(item);
      const normalizedItem = {
        ...item,
        jenis: jenisFix,
        jenis_transaksi: jenisFix,
        tipe: jenisFix,
        type: jenisFix,
        kategori: jenisFix,
        nominal: nomFix,
        jumlah: nomFix,
        sumber: normalizeSumberLabel(item),
        kategori_sumber: normalizeSumberKategori(item),
        bukti_nota: normalizeBuktiNota(item),
      };

      const idKey =
        normalizedItem.id !== undefined && normalizedItem.id !== null
          ? `id:${normalizedItem.id}`
          : null;
      const fpKey = `fp:${getFingerprint(normalizedItem)}`;

      if (idKey && seenIds.has(idKey)) continue;
      if (seenFps.has(fpKey)) continue;

      if (idKey) seenIds.add(idKey);
      seenFps.add(fpKey);
      mergedResult.push(normalizedItem);
    }
  }

  return mergedResult.sort((a, b) =>
    String(b.tanggal || '').localeCompare(String(a.tanggal || ''))
  );
};

export default function PanelKeuanganReadOnly({
  keuanganList = [],
  namaKetuaOsis = 'Ketua OSIS',
  namaBendaharaOsis = 'Bendahara OSIS',
}) {
  const [serverList, setServerList] = useState([]);
  const [syncedList, setSyncedList] = useState(() =>
    mergeAndDedupeKeuangan(readAllLocalKeuangan(), keuanganList)
  );

  // Ambil data terbaru langsung dari backend API /keuangan
  const fetchKeuanganServer = useCallback(async () => {
    try {
      const res = await api.get('/keuangan');
      const raw = res?.data?.data || res?.data || [];
      if (Array.isArray(raw)) {
        setServerList(raw);
        setSyncedList(mergeAndDedupeKeuangan(readAllLocalKeuangan(), raw, keuanganList));
      }
    } catch {
      // Jika offline, tetap gunakan data lokal
      setSyncedList(mergeAndDedupeKeuangan(readAllLocalKeuangan(), keuanganList));
    }
  }, [keuanganList]);

  useEffect(() => {
    fetchKeuanganServer();
  }, [fetchKeuanganServer]);

  useEffect(() => {
    setSyncedList(mergeAndDedupeKeuangan(readAllLocalKeuangan(), serverList, keuanganList));
  }, [keuanganList, serverList]);

  useEffect(() => {
    const handleStorageSync = () => {
      setSyncedList(
        mergeAndDedupeKeuangan(readAllLocalKeuangan(), serverList, keuanganList)
      );
    };

    window.addEventListener('storage', handleStorageSync);
    window.addEventListener('ositara_keuangan_updated', handleStorageSync);
    window.addEventListener('ositara-keuangan-updated', handleStorageSync);
    window.addEventListener('storage_keuangan_updated', handleStorageSync);

    const interval = setInterval(handleStorageSync, 1500);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageSync);
      window.removeEventListener('ositara_keuangan_updated', handleStorageSync);
      window.removeEventListener('ositara-keuangan-updated', handleStorageSync);
      window.removeEventListener('storage_keuangan_updated', handleStorageSync);
    };
  }, [keuanganList, serverList]);

  const [selectedSumber, setSelectedSumber] = useState('Semua');
  const [selectedJenis, setSelectedJenis] = useState('Semua');
  const [isLaporanModalOpen, setIsLaporanModalOpen] = useState(false);
  const [laporanSumberFilter, setLaporanSumberFilter] = useState('Semua');
  const [laporanJenisFilter, setLaporanJenisFilter] = useState('Semua');
  const [laporanPeriodeFilter, setLaporanPeriodeFilter] = useState('semua');

  const [previewNotaModal, setPreviewNotaModal] = useState({
    isOpen: false,
    imageUrl: '',
    keterangan: '',
    tanggal: '',
    nominal: 0,
  });

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(Number(angka) || 0);
  };

  const formatTanggal = (tgl) => {
    if (!tgl) return '-';
    const d = new Date(tgl);
    if (Number.isNaN(d.getTime())) return String(tgl);
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTanggalFormal = () => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Kalkulasi Utama
  const { totalPemasukan, totalPengeluaran, saldoSaatIni } = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    syncedList.forEach((item) => {
      const nom = normalizeNominal(item);
      if (normalizeJenis(item) === 'Pemasukan') {
        masuk += nom;
      } else {
        keluar += nom;
      }
    });
    return {
      totalPemasukan: masuk,
      totalPengeluaran: keluar,
      saldoSaatIni: masuk - keluar,
    };
  }, [syncedList]);

  const filteredTransaksi = useMemo(() => {
    return syncedList.filter((item) => {
      const matchSumber =
        selectedSumber === 'Semua' || normalizeSumberKategori(item) === selectedSumber;
      const matchJenis =
        selectedJenis === 'Semua' || normalizeJenis(item) === selectedJenis;
      return matchSumber && matchJenis;
    });
  }, [syncedList, selectedSumber, selectedJenis]);

  // Filter Khusus Modal Laporan
  const laporanFilteredList = useMemo(() => {
    const now = new Date();
    return syncedList.filter((item) => {
      if (
        laporanSumberFilter !== 'Semua' &&
        normalizeSumberKategori(item) !== laporanSumberFilter
      )
        return false;
      if (laporanJenisFilter !== 'Semua' && normalizeJenis(item) !== laporanJenisFilter)
        return false;
      if (laporanPeriodeFilter !== 'semua' && item.tanggal) {
        const tgl = new Date(item.tanggal);
        if (!Number.isNaN(tgl.getTime())) {
          const diffDays = (now - tgl) / (1000 * 60 * 60 * 24);
          if (laporanPeriodeFilter === 'minggu' && diffDays > 7) return false;
          if (laporanPeriodeFilter === 'bulan' && diffDays > 30) return false;
          if (laporanPeriodeFilter === 'tahun' && diffDays > 365) return false;
        }
      }
      return true;
    });
  }, [syncedList, laporanSumberFilter, laporanJenisFilter, laporanPeriodeFilter]);

  const { laporanTotalMasuk, laporanTotalKeluar, laporanSaldoAkhir, laporanNotaList } =
    useMemo(() => {
      let masuk = 0;
      let keluar = 0;
      const notas = [];
      laporanFilteredList.forEach((item) => {
        const nom = normalizeNominal(item);
        if (normalizeJenis(item) === 'Pemasukan') {
          masuk += nom;
        } else {
          keluar += nom;
        }
        if (normalizeBuktiNota(item)) notas.push(item);
      });
      return {
        laporanTotalMasuk: masuk,
        laporanTotalKeluar: keluar,
        laporanSaldoAkhir: masuk - keluar,
        laporanNotaList: notas,
      };
    }, [laporanFilteredList]);

  const getLabelPeriode = () => {
    if (laporanPeriodeFilter === 'minggu') return '7 Hari Terakhir';
    if (laporanPeriodeFilter === 'bulan') return '30 Hari Terakhir';
    if (laporanPeriodeFilter === 'tahun') return '1 Tahun Terakhir';
    return 'Seluruh Periode Berjalan';
  };

  // Fungsi Print / Ekspor PDF
  const handlePrintPdfLaporan = () => {
    const printWindow = window.open('', '_blank', 'width=950,height=750');
    if (!printWindow) return;
    const rowsHtml = laporanFilteredList
      .map((item, i) => {
        const isMasuk = normalizeJenis(item) === 'Pemasukan';
        const nom = formatRupiah(normalizeNominal(item));
        return `
          <tr>
            <td style="text-align:center;">${i + 1}</td>
            <td style="text-align:center;">${formatTanggal(item.tanggal)}</td>
            <td>${normalizeSumberLabel(item)}</td>
            <td>${item.keterangan || '-'}</td>
            <td style="text-align:right;color:#047857;">${isMasuk ? nom : '-'}</td>
            <td style="text-align:right;color:#be123c;">${!isMasuk ? nom : '-'}</td>
          </tr>
        `;
      })
      .join('');

    const lampiranHtml =
      laporanNotaList.length > 0
        ? `
          <div style="margin-top:24px;border-top:2px solid #333;padding-top:12px;page-break-before:always;">
            <h4 style="margin:0 0 10px 0;font-size:13px;text-transform:uppercase;">Lampiran Bukti Nota Pengeluaran (${laporanNotaList.length} Berkas)</h4>
            <div style="display:grid;grid-template-columns: repeat(3,1fr);gap:10px;">
              ${laporanNotaList
                .map(
                  (n, idx) => `
                <div style="border:1px solid #999;padding:6px;text-align:center;">
                  <img src="${normalizeBuktiNota(n)}" style="max-height:130px;max-width:100%;object-fit:contain;" />
                  <div style="font-size:10px;margin-top:4px;font-weight:bold;">${idx + 1}. ${n.keterangan}</div>
                  <div style="font-size:9px;color:#555;">${formatTanggal(n.tanggal)} | ${formatRupiah(normalizeNominal(n))}</div>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        `
        : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Keuangan OSIS</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 24px; color: #111; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }
            th, td { border: 1px solid #444; padding: 6px 8px; }
            th { background: #e5e7eb; text-transform: uppercase; font-size: 11px; }
          </style>
        </head>
        <body>
          <div style="text-align:center;border-bottom: 3px double #000;padding-bottom: 10px;">
            <div style="font-size:13px;font-weight:bold;">ORGANISASI SISWA INTRA SEKOLAH (OSIS)</div>
            <div style="font-size:18px;font-weight:bold;margin-top:2px;">LAPORAN PERTANGGUNGJAWABAN KEUANGAN</div>
            <div style="font-size:11px;color:#555;">Periode: ${getLabelPeriode()} | Sumber: ${laporanSumberFilter}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Sumber Dana</th>
                <th>Keterangan</th>
                <th>Pemasukan</th>
                <th>Pengeluaran</th>
              </tr>
            </thead>
            <tbody>${rowsHtml || '<tr><td colspan="6" style="text-align:center;">Tidak ada data</td></tr>'}</tbody>
            <tfoot>
              <tr style="font-weight:bold;background: #f3f4f6;">
                <td colspan="4" style="text-align:right;">TOTAL</td>
                <td style="text-align:right;">${formatRupiah(laporanTotalMasuk)}</td>
                <td style="text-align:right;">${formatRupiah(laporanTotalKeluar)}</td>
              </tr>
              <tr style="font-weight:bold;background: #dbeafe;">
                <td colspan="4" style="text-align:right;">SALDO AKHIR</td>
                <td colspan="2" style="text-align:right;">${formatRupiah(laporanSaldoAkhir)}</td>
              </tr>
            </tfoot>
          </table>
          ${lampiranHtml}
          <div style="display:flex;justify-content:space-between;margin-top:36px;font-size:12px;text-align:center;">
            <div style="width: 40%;">Mengetahui, <br/><b>Pembina OSIS</b><br/><br/><br/><br/><u>(${namaKetuaOsis})</u></div>
            <div style="width: 40%;">${formatTanggalFormal()}<br/><b>Bendahara OSIS</b><br/><br/><br/><br/><u>(${namaBendaharaOsis})</u></div>
          </div>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Fungsi Ekspor ke Gambar PNG / JPG
  const handleExportLaporanImage = (format = 'png') => {
    const canvas = document.createElement('canvas');
    const width = 1000;
    const rowHeight = 36;
    const height = 340 + Math.max(laporanFilteredList.length, 1) * rowHeight;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LAPORAN PERTANGGUNGJAWABAN KEUANGAN OSIS', width / 2, 42);
    ctx.font = '13px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(
      `Sumber: ${laporanSumberFilter} | Kategori: ${laporanJenisFilter} | Periode: ${getLabelPeriode()}`,
      width / 2,
      66
    );

    ctx.textAlign = 'left';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#047857';
    ctx.fillText(`Total Pemasukan: ${formatRupiah(laporanTotalMasuk)}`, 40, 105);
    ctx.fillStyle = '#be123c';
    ctx.fillText(`Total Pengeluaran: ${formatRupiah(laporanTotalKeluar)}`, 360, 105);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillText(`Saldo Akhir: ${formatRupiah(laporanSaldoAkhir)}`, 690, 105);

    let y = 135;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(40, y, width - 80, 32);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('No', 50, y + 21);
    ctx.fillText('Tanggal', 90, y + 21);
    ctx.fillText('Sumber', 200, y + 21);
    ctx.fillText('Keterangan', 330, y + 21);
    ctx.fillText('Nominal', 800, y + 21);
    y += 32;

    laporanFilteredList.forEach((item, idx) => {
      const isMasuk = normalizeJenis(item) === 'Pemasukan';
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(40, y, width - 80, rowHeight);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px sans-serif';
      ctx.fillText(String(idx + 1), 50, y + 23);
      ctx.fillText(formatTanggal(item.tanggal), 90, y + 23);
      ctx.fillText(normalizeSumberLabel(item).slice(0, 16), 200, y + 23);
      ctx.fillText(String(item.keterangan || '-').slice(0, 48), 330, y + 23);
      ctx.fillStyle = isMasuk ? '#047857' : '#be123c';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(
        `${isMasuk ? '+' : '-'}${formatRupiah(normalizeNominal(item))}`,
        800,
        y + 23
      );
      y += rowHeight;
    });

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const link = document.createElement('a');
    link.download = `Laporan-Keuangan-OSIS.${format}`;
    link.href = canvas.toDataURL(mimeType, 0.95);
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* HEADER READ-ONLY + TOMBOL EKSPOR */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              Transparansi &amp; Laporan Keuangan OSIS
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2256B7] border border-blue-200 text-[10px] font-black uppercase">
              Sinkron Otomatis &bull; Mode Lihat &amp; Ekspor
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Data tersinkron langsung dari pencatatan Bendahara OSIS. Anda dapat memfilter dan
            mengekspor laporan resmi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setLaporanSumberFilter(selectedSumber);
            setLaporanJenisFilter(selectedJenis);
            setIsLaporanModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-[#109868] hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-all cursor-pointer"
        >
          Ekspor Laporan (PDF / PNG / JPG)
        </button>
      </div>

      {/* 3 KARTU RINGKASAN SALDO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-gradient-to-r from-teal-500 to-cyan-400 text-white shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-90">
            TOTAL PEMASUKAN
          </p>
          <p className="text-2xl font-black mt-1">{formatRupiah(totalPemasukan)}</p>
        </div>
        <div className="p-5 rounded-3xl bg-gradient-to-r from-rose-500 to-pink-400 text-white shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-90">
            TOTAL PENGELUARAN
          </p>
          <p className="text-2xl font-black mt-1">{formatRupiah(totalPengeluaran)}</p>
        </div>
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#2256B7] to-[#5899F2] text-white shadow-sm">
          <p className="text-xs font-extrabold uppercase tracking-wider opacity-90">
            SALDO KAS SAAT INI
          </p>
          <p className="text-2xl font-black mt-1">{formatRupiah(saldoSaatIni)}</p>
        </div>
      </div>

      {/* TABEL MUTASI KEUANGAN (READ-ONLY) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h4 className="text-sm sm:text-base font-black text-slate-800">
            Rincian Mutasi Kas ({filteredTransaksi.length} Transaksi)
          </h4>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedSumber}
              onChange={(e) => setSelectedSumber(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700"
            >
              <option value="Semua">Semua Sumber Dana</option>
              {DAFTAR_SUMBER_DANA.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700"
            >
              <option value="Semua">Semua Kategori</option>
              <option value="Pemasukan">Pemasukan</option>
              <option value="Pengeluaran">Pengeluaran</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[11px] bg-slate-100/70">
                <th className="py-3 px-4 rounded-l-xl">Tanggal</th>
                <th className="py-3 px-4">Sumber Dana</th>
                <th className="py-3 px-4">Keterangan</th>
                <th className="py-3 px-4 text-center">Bukti Nota</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransaksi.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-slate-400 font-medium">
                    Belum ada transaksi keuangan yang tercatat.
                  </td>
                </tr>
              ) : (
                filteredTransaksi.map((item, idx) => {
                  const isMasuk = normalizeJenis(item) === 'Pemasukan';
                  const notaUrl = !isMasuk ? normalizeBuktiNota(item) : '';
                  return (
                    <tr key={item.id || idx} className="hover:bg-blue-50/40">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                        {formatTanggal(item.tanggal)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {normalizeSumberLabel(item)}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {item.keterangan}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {notaUrl ? (
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewNotaModal({
                                isOpen: true,
                                imageUrl: notaUrl,
                                keterangan: item.keterangan,
                                tanggal: formatTanggal(item.tanggal),
                                nominal: normalizeNominal(item),
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#2256B7] border border-blue-200 text-xs font-bold cursor-pointer"
                          >
                            Lihat Nota
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-black whitespace-nowrap ${
                          isMasuk ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isMasuk ? '+' : '-'} {formatRupiah(normalizeNominal(item))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PREVIEW NOTA */}
      {previewNotaModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-800">Bukti Nota Pengeluaran</h4>
                <p className="text-xs text-slate-500">
                  {previewNotaModal.keterangan} &bull; {formatRupiah(previewNotaModal.nominal)}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPreviewNotaModal({
                    isOpen: false,
                    imageUrl: '',
                    keterangan: '',
                    tanggal: '',
                    nominal: 0,
                  })
                }
                className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 font-black cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-5 bg-slate-100 flex justify-center max-h-[70vh] overflow-auto">
              <img
                src={previewNotaModal.imageUrl}
                alt="Bukti Nota"
                className="max-h-[60vh] rounded-2xl object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL EKSPOR LAPORAN */}
      {isLaporanModalOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-[#2256B7] text-[10px] font-black uppercase">
                  Mode Lihat &amp; Ekspor
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-800 mt-0.5">
                  Laporan Pertanggungjawaban Keuangan OSIS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLaporanModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 font-black cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* FILTER LAPORAN */}
            <div className="px-6 py-3 bg-white border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={laporanSumberFilter}
                onChange={(e) => setLaporanSumberFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
              >
                <option value="Semua">Semua Sumber Dana</option>
                {DAFTAR_SUMBER_DANA.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                value={laporanJenisFilter}
                onChange={(e) => setLaporanJenisFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
              >
                <option value="Semua">Semua (Pemasukan &amp; Pengeluaran)</option>
                <option value="Pemasukan">Hanya Pemasukan</option>
                <option value="Pengeluaran">Hanya Pengeluaran</option>
              </select>
              <select
                value={laporanPeriodeFilter}
                onChange={(e) => setLaporanPeriodeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
              >
                <option value="semua">Seluruh Periode Berjalan</option>
                <option value="minggu">7 Hari Terakhir</option>
                <option value="bulan">30 Hari Terakhir</option>
                <option value="tahun">1 Tahun Terakhir</option>
              </select>
            </div>

            {/* PRATINJAU DOKUMEN FORMAL */}
            <div className="p-6 overflow-y-auto bg-slate-100 flex-1">
              <div className="bg-white p-6 sm:p-8 border border-slate-400 shadow-sm space-y-4">
                <div className="text-center border-b-4 border-double border-slate-900 pb-3">
                  <p className="text-xs font-bold uppercase tracking-widest">
                    Organisasi Siswa Intra Sekolah (OSIS)
                  </p>
                  <h4 className="text-lg font-bold uppercase mt-0.5">
                    Laporan Pertanggungjawaban Keuangan
                  </h4>
                  <p className="text-[11px] text-slate-600">Periode: {getLabelPeriode()}</p>
                </div>
                <div className="grid grid-cols-3 border border-slate-500 divide-x divide-slate-500 bg-slate-50 text-xs">
                  <div className="p-3">
                    <span className="block text-[10px] font-bold uppercase text-slate-500">
                      Total Pemasukan
                    </span>
                    <strong className="text-emerald-700 text-sm">
                      {formatRupiah(laporanTotalMasuk)}
                    </strong>
                  </div>
                  <div className="p-3">
                    <span className="block text-[10px] font-bold uppercase text-slate-500">
                      Total Pengeluaran
                    </span>
                    <strong className="text-rose-700 text-sm">
                      {formatRupiah(laporanTotalKeluar)}
                    </strong>
                  </div>
                  <div className="p-3 bg-blue-50/50">
                    <span className="block text-[10px] font-bold uppercase text-slate-600">
                      Saldo Akhir
                    </span>
                    <strong className="text-[#2256B7] text-sm">
                      {formatRupiah(laporanSaldoAkhir)}
                    </strong>
                  </div>
                </div>

                <table className="w-full text-left text-xs border-collapse border border-slate-500">
                  <thead>
                    <tr className="bg-slate-200 font-bold uppercase text-[11px]">
                      <th className="border border-slate-500 py-2 px-2 text-center">No</th>
                      <th className="border border-slate-500 py-2 px-2 text-center">Tanggal</th>
                      <th className="border border-slate-500 py-2 px-2">Sumber</th>
                      <th className="border border-slate-500 py-2 px-2">Keterangan</th>
                      <th className="border border-slate-500 py-2 px-2 text-right">Pemasukan</th>
                      <th className="border border-slate-500 py-2 px-2 text-right">Pengeluaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporanFilteredList.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="border border-slate-500 py-6 text-center text-slate-400"
                        >
                          Tidak ada transaksi pada filter yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      laporanFilteredList.map((item, idx) => {
                        const isMasuk = normalizeJenis(item) === 'Pemasukan';
                        return (
                          <tr key={item.id || idx}>
                            <td className="border border-slate-500 py-1.5 px-2 text-center">
                              {idx + 1}
                            </td>
                            <td className="border border-slate-500 py-1.5 px-2 text-center">
                              {formatTanggal(item.tanggal)}
                            </td>
                            <td className="border border-slate-500 py-1.5 px-2">
                              {normalizeSumberLabel(item)}
                            </td>
                            <td className="border border-slate-500 py-1.5 px-2">
                              {item.keterangan}
                            </td>
                            <td className="border border-slate-500 py-1.5 px-2 text-right text-emerald-700 font-semibold">
                              {isMasuk ? formatRupiah(normalizeNominal(item)) : '-'}
                            </td>
                            <td className="border border-slate-500 py-1.5 px-2 text-right text-rose-700 font-semibold">
                              {!isMasuk ? formatRupiah(normalizeNominal(item)) : '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* TOMBOL AKSI EKSPOR */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsLaporanModalOpen(false)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                Tutup
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintPdfLaporan}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs cursor-pointer"
                >
                  Ekspor PDF / Print
                </button>
                <button
                  type="button"
                  onClick={() => handleExportLaporanImage('png')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer"
                >
                  Simpan PNG
                </button>
                <button
                  type="button"
                  onClick={() => handleExportLaporanImage('jpg')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs cursor-pointer"
                >
                  Simpan JPG
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}