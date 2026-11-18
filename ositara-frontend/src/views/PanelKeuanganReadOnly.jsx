import { useMemo, useState, useEffect, useCallback } from 'react';
import api from '../api';
import logoOsitara from '../assets/LOGO OSITARA.png';

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
  if (typeof raw === 'number') return Number.isNaN(raw) ? 0 : Math.abs(raw);
  const parsed = Number(String(raw).replace(/[^0-9.-]/g, ''));
  return Number.isNaN(parsed) ? 0 : Math.abs(parsed);
};

const normalizeSumberKategori = (item) => {
  const raw = String(
    item?.kategori_sumber || item?.sumber || item?.sumber_dana || 'Kas OSIS'
  )
    .toLowerCase()
    .trim();
  if (raw.includes('dana sekolah') || raw.includes('bos')) return 'Dana Sekolah';
  if (raw.includes('sponsor')) return 'Sponsor';
  if (raw.includes('kas')) return 'Kas OSIS';
  return 'Lainnya';
};

const normalizeSumberLabel = (item) => {
  const label = String(
    item?.sumber || item?.kategori_sumber || item?.sumber_dana || ''
  ).trim();
  return label || 'Kas OSIS';
};

const getStorageBaseUrl = () => {
  const envUrl = import.meta?.env?.VITE_API_URL || '';
  if (envUrl) return envUrl.replace(/\/api\/?$/, '');
  return window.location.origin;
};

const normalizeBuktiNota = (item) => {
  if (!item || typeof item !== 'object') return '';
  const raw =
    item?.bukti_nota ||
    item?.buktiNota ||
    item?.nota ||
    item?.foto_nota ||
    item?.gambar_nota ||
    item?.lampiran_nota ||
    item?.bukti_transaksi ||
    item?.file_nota ||
    item?.bukti ||
    item?.file_bukti ||
    '';
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return '';
  if (
    trimmed.startsWith('data:image') ||
    trimmed.startsWith('http') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }
  return `${getStorageBaseUrl()}/storage/${trimmed.replace(/^\/+/, '').replace(/^storage\//, '')}`;
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

const readOverridesSafe = (storageKey) => {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}') || {};
  } catch {
    return {};
  }
};

// Menggabungkan & menduplikasi transaksi dari berbagai sumber tanpa menghilangkan bukti nota
const mergeAndDedupeKeuangan = (...sources) => {
  const overridesV1 = readOverridesSafe(OVERRIDE_CACHE_KEY);
  const overridesLegacy = readOverridesSafe('ositara_keuangan_overrides');

  const seenIds = new Set();
  const seenFps = new Set();
  const mergedResult = [];
  const itemByIdMap = new Map();
  const itemByFpMap = new Map();

  for (const src of sources) {
    if (!Array.isArray(src)) continue;
    for (const rawItem of src) {
      if (!rawItem || typeof rawItem !== 'object') continue;
      const fpRaw = getFingerprint(rawItem);
      const ov =
        (rawItem.id !== undefined &&
          rawItem.id !== null &&
          (overridesV1[`id:${rawItem.id}`] || overridesLegacy[String(rawItem.id)])) ||
        overridesV1[`fp:${fpRaw}`] ||
        overridesLegacy[fpRaw] ||
        null;
      const item = ov ? { ...rawItem, ...ov, id: rawItem.id ?? ov.id } : rawItem;

      const jenisFix = normalizeJenis(item);
      const nomFix = normalizeNominal(item);
      const notaFix = normalizeBuktiNota(item);
      const ketFix = String(item?.keterangan || '').trim() || '-';
      const tglFix =
        String(item?.tanggal || new Date().toISOString().split('T')[0])
          .split('T')[0]
          .split(' ')[0] || '-';

      const normalizedItem = {
        ...item,
        jenis: jenisFix,
        jenis_transaksi: jenisFix,
        tipe: jenisFix,
        type: jenisFix,
        kategori: jenisFix,
        nominal: nomFix,
        jumlah: nomFix,
        keterangan: ketFix,
        tanggal: tglFix,
        sumber: normalizeSumberLabel(item),
        kategori_sumber: normalizeSumberKategori(item),
        bukti_nota: notaFix,
      };

      const idKey =
        normalizedItem.id !== undefined && normalizedItem.id !== null
          ? `id:${normalizedItem.id}`
          : null;
      const fpKey = `fp:${getFingerprint(normalizedItem)}`;

      if (idKey && seenIds.has(idKey)) {
        const existing = itemByIdMap.get(idKey);
        if (existing && !existing.bukti_nota && notaFix) {
          existing.bukti_nota = notaFix;
        }
        continue;
      }
      if (seenFps.has(fpKey)) {
        const existing = itemByFpMap.get(fpKey);
        if (existing && !existing.bukti_nota && notaFix) {
          existing.bukti_nota = notaFix;
        }
        continue;
      }

      if (idKey) {
        seenIds.add(idKey);
        itemByIdMap.set(idKey, normalizedItem);
      }
      seenFps.add(fpKey);
      itemByFpMap.set(fpKey, normalizedItem);
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
  namaBendahara,
}) {
  const bendaharaDisplay = namaBendahara || namaBendaharaOsis || 'Bendahara OSIS';

  const [serverList, setServerList] = useState([]);
  const [hasServerResponded, setHasServerResponded] = useState(false);
  const [localTick, setLocalTick] = useState(0);

  const syncedList = useMemo(() => {
    void localTick;
    const localItems = readAllLocalKeuangan();

    // Jika server sudah merespons dan memiliki data, jadikan server sebagai acuan utama
    // (sehingga jika data dihapus di database server, tampilan ikut menyesuaikan)
    if (hasServerResponded && serverList.length > 0) {
      const notaById = new Map();
      const notaByFp = new Map();
      localItems.forEach((loc) => {
        const n = normalizeBuktiNota(loc);
        if (!n) return;
        if (loc.id !== undefined && loc.id !== null) notaById.set(String(loc.id), n);
        notaByFp.set(getFingerprint(loc), n);
      });

      const enrichedServer = serverList.map((srv) => {
        const existingNota = normalizeBuktiNota(srv);
        if (existingNota) return srv;
        const matchedNota =
          (srv.id !== undefined && srv.id !== null && notaById.get(String(srv.id))) ||
          notaByFp.get(getFingerprint(srv)) ||
          '';
        return matchedNota ? { ...srv, bukti_nota: matchedNota } : srv;
      });

      return mergeAndDedupeKeuangan(enrichedServer);
    }

    // Jika server masih kosong (0 rows) atau offline, tetap baca data dari Bendahara (localStorage / props)
    return mergeAndDedupeKeuangan(localItems, serverList, keuanganList);
  }, [keuanganList, serverList, hasServerResponded, localTick]);

  // Ambil data terbaru langsung dari backend API /keuangan
  const fetchKeuanganServer = useCallback(async () => {
    try {
      const res = await api.get('/keuangan');
      const raw = res?.data?.data ?? res?.data;
      if (Array.isArray(raw)) {
        setServerList(raw);
        setHasServerResponded(true);
        if (raw.length > 0) {
          const cleanCache = mergeAndDedupeKeuangan(raw);
          localStorage.setItem('ositara_keuangan_list', JSON.stringify(cleanCache));
        }
      }
    } catch {
      // Jika offline, tetap gunakan data lokal
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchKeuanganServer();
    });
  }, [fetchKeuanganServer]);

  useEffect(() => {
    const handleStorageSync = () => {
      setLocalTick((prev) => prev + 1);
      fetchKeuanganServer();
    };

    window.addEventListener('storage', handleStorageSync);
    window.addEventListener('ositara_keuangan_updated', handleStorageSync);
    window.addEventListener('ositara-keuangan-updated', handleStorageSync);
    window.addEventListener('storage_keuangan_updated', handleStorageSync);

    const interval = setInterval(() => {
      setLocalTick((prev) => prev + 1);
      fetchKeuanganServer();
    }, 2500);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageSync);
      window.removeEventListener('ositara_keuangan_updated', handleStorageSync);
      window.removeEventListener('ositara-keuangan-updated', handleStorageSync);
      window.removeEventListener('storage_keuangan_updated', handleStorageSync);
    };
  }, [fetchKeuanganServer]);

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

  const formatTanggalDash = (tgl) => {
    if (!tgl) return '-';
    const clean = String(tgl).split('T')[0].split(' ')[0];
    const parts = clean.split('-');
    if (parts.length === 3 && parts[0].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return formatTanggal(tgl);
  };

  const formatTanggalFormal = () => {
    return new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const nomorSuratResmi = useMemo(() => {
    const now = new Date();
    const romawi = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][
      now.getMonth()
    ];
    return `014/LPJ-KEU/OSIS/${romawi}/${now.getFullYear()}`;
  }, []);

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
        selectedSumber === 'Semua' ||
        normalizeSumberKategori(item) === selectedSumber ||
        normalizeSumberLabel(item).toLowerCase() === selectedSumber.toLowerCase();
      const matchJenis =
        selectedJenis === 'Semua' || normalizeJenis(item) === selectedJenis;
      return matchSumber && matchJenis;
    });
  }, [syncedList, selectedSumber, selectedJenis]);

  // Filter Khusus Modal Laporan (dengan urutan kronologis + saldo berjalan seperti Bendahara)
  const laporanFilteredList = useMemo(() => {
    const now = new Date();
    const filtered = syncedList
      .filter((item) => {
        if (
          laporanSumberFilter !== 'Semua' &&
          normalizeSumberKategori(item) !== laporanSumberFilter &&
          normalizeSumberLabel(item).toLowerCase() !== laporanSumberFilter.toLowerCase()
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
      })
      .sort((a, b) => String(a.tanggal || '').localeCompare(String(b.tanggal || '')));

    return filtered.reduce((acc, item) => {
      const isMasuk = normalizeJenis(item) === 'Pemasukan';
      const nom = normalizeNominal(item);
      const prevSaldo = acc.length > 0 ? acc[acc.length - 1]._saldoBerjalan : 0;
      const saldoBerjalan = prevSaldo + (isMasuk ? nom : -nom);
      acc.push({
        ...item,
        _isMasuk: isMasuk,
        _nominal: nom,
        _saldoBerjalan: saldoBerjalan,
        _notaUrl: normalizeBuktiNota(item),
      });
      return acc;
    }, []);
  }, [syncedList, laporanSumberFilter, laporanJenisFilter, laporanPeriodeFilter]);

  const { laporanTotalMasuk, laporanTotalKeluar, laporanSaldoAkhir, laporanNotaList } =
    useMemo(() => {
      let masuk = 0;
      let keluar = 0;
      const notas = [];
      laporanFilteredList.forEach((item) => {
        if (item._isMasuk) {
          masuk += item._nominal;
        } else {
          keluar += item._nominal;
        }
        if (item._notaUrl) notas.push(item);
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

  const getLabelSumberFormal = () => {
    return laporanSumberFilter === 'Semua' ? 'Seluruh Sumber Dana OSIS' : laporanSumberFilter;
  };

  const getLabelJenisFormal = () => {
    if (laporanJenisFilter === 'Pemasukan') return 'Hanya Pemasukan';
    if (laporanJenisFilter === 'Pengeluaran') return 'Hanya Pengeluaran';
    return 'Pemasukan & Pengeluaran';
  };

  // Fungsi Print / Ekspor PDF Resmi (Persis Format Bendahara + Lampiran Nota)
  const handlePrintPdfLaporan = () => {
    const printWindow = window.open('', '_blank', 'width=1024,height=800');
    if (!printWindow) return;

    const rowsHtml = laporanFilteredList
      .map((item, i) => {
        const nom = formatRupiah(item._nominal);
        const lampIndex = laporanNotaList.findIndex((n) => n === item);
        return `
          <tr>
            <td style="text-align:center;">${i + 1}</td>
            <td style="text-align:center;white-space:nowrap;">${formatTanggalDash(item.tanggal)}</td>
            <td>${normalizeSumberLabel(item)}</td>
            <td>${item.keterangan || '-'}</td>
            <td style="text-align:center;color:${lampIndex >= 0 ? '#1d4ed8' : '#475569'};font-weight:${lampIndex >= 0 ? 'bold' : 'normal'};">
              ${lampIndex >= 0 ? `Lampiran ${lampIndex + 1}` : 'Tercatat Sistem'}
            </td>
            <td style="text-align:right;color:#047857;font-weight:bold;white-space:nowrap;">${item._isMasuk ? `+${nom}` : 'Rp 0'}</td>
            <td style="text-align:right;color:#be123c;font-weight:bold;white-space:nowrap;">${!item._isMasuk ? `-${nom}` : 'Rp 0'}</td>
            <td style="text-align:right;font-weight:bold;white-space:nowrap;">${formatRupiah(item._saldoBerjalan)}</td>
          </tr>
        `;
      })
      .join('');

    const lampiranHtml =
      laporanNotaList.length > 0
        ? `
          <div style="margin-top:28px;border-top:2px solid #0f172a;padding-top:14px;page-break-inside:avoid;">
            <h4 style="margin:0 0 12px 0;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">
              LAMPIRAN BUKTI NOTA TRANSAKSI (${laporanNotaList.length} BUKTI TRANSAKSI)
            </h4>
            <div style="display:grid;grid-template-columns: repeat(3,1fr);gap:12px;">
              ${laporanNotaList
                .map(
                  (n, idx) => `
                <div style="border:1px solid #94a3b8;border-radius:8px;padding:8px;background:#f8fafc;">
                  <div style="background:#fff;border:1px solid #cbd5e1;height:140px;display:flex;align-items:center;justify-content:center;margin-bottom:6px;">
                    <img src="${n._notaUrl}" style="max-height:132px;max-width:100%;object-fit:contain;" />
                  </div>
                  <div style="font-size:11px;font-weight:bold;color:#0f172a;">Lampiran ${idx + 1}. ${n.keterangan || '-'}</div>
                  <div style="font-size:10px;color:#475569;margin-top:2px;">${formatTanggalDash(n.tanggal)} &bull; ${normalizeSumberLabel(n)}</div>
                  <div style="font-size:11px;color:${n._isMasuk ? '#047857' : '#be123c'};font-weight:bold;margin-top:2px;">${n._isMasuk ? '+' : '-'} ${formatRupiah(n._nominal)}</div>
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
          <title>Laporan Pertanggungjawaban Keuangan OSIS</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 28px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 14px; }
            th, td { border: 1px solid #334155; padding: 7px 8px; }
            th { background: #e2e8f0; text-transform: uppercase; font-size: 10px; }
          </style>
        </head>
        <body>
          <div style="text-align:center;border-bottom: 3px double #0f172a;padding-bottom: 12px;">
            <div style="font-size:12px;font-weight:bold;letter-spacing:1.5px;">ORGANISASI SISWA INTRA SEKOLAH (OSIS)</div>
            <div style="font-size:18px;font-weight:bold;margin-top:3px;">LAPORAN PERTANGGUNGJAWABAN KEUANGAN</div>
            <div style="font-size:11px;color:#475569;margin-top:3px;">Nomor: ${nomorSuratResmi}</div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:12px;color:#334155;">
            <div>
              <div><b>Sumber Dana :</b> ${getLabelSumberFormal()}</div>
              <div><b>Kategori Mutasi :</b> ${getLabelJenisFormal()}</div>
            </div>
            <div style="text-align:right;">
              <div><b>Periode Laporan :</b> ${getLabelPeriode()}</div>
              <div><b>Jumlah Tercatat :</b> ${laporanFilteredList.length} Transaksi (${laporanNotaList.length} Bukti Nota)</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #334155;margin-top:12px;background:#f8fafc;">
            <div style="padding:10px;border-right:1px solid #334155;">
              <div style="font-size:10px;font-weight:bold;color:#475569;">TOTAL PEMASUKAN (+)</div>
              <div style="font-size:15px;font-weight:bold;color:#065f46;margin-top:2px;">+ ${formatRupiah(laporanTotalMasuk)}</div>
            </div>
            <div style="padding:10px;border-right:1px solid #334155;">
              <div style="font-size:10px;font-weight:bold;color:#475569;">TOTAL PENGELUARAN (-)</div>
              <div style="font-size:15px;font-weight:bold;color:#9f1239;margin-top:2px;">- ${formatRupiah(laporanTotalKeluar)}</div>
            </div>
            <div style="padding:10px;background:#f1f5f9;">
              <div style="font-size:10px;font-weight:bold;color:#475569;">SALDO AKHIR PERIODE</div>
              <div style="font-size:15px;font-weight:bold;color:#0f172a;margin-top:2px;">${formatRupiah(laporanSaldoAkhir)}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Sumber Dana</th>
                <th>Uraian / Keterangan Transaksi</th>
                <th>Nota</th>
                <th>Pemasukan (+)</th>
                <th>Pengeluaran (-)</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>${rowsHtml || '<tr><td colspan="8" style="text-align:center;">Tidak ada data</td></tr>'}</tbody>
          </table>
          <div style="display:flex;justify-content:space-between;margin-top:36px;font-size:12px;text-align:center;">
            <div style="width: 42%;">Mengetahui,<br/><b>Ketua OSIS</b><br/><br/><br/><br/><u>( ${namaKetuaOsis} )</u></div>
            <div style="width: 42%;">${formatTanggalFormal()}<br/><b>Bendahara OSIS</b><br/><br/><br/><br/><u>( ${bendaharaDisplay} )</u></div>
          </div>
          ${lampiranHtml}
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Fungsi Ekspor ke Gambar PNG / JPG (Lengkap dengan Saldo & Lampiran Foto Nota)
  const handleExportLaporanImage = async (format = 'png') => {
    const loadImg = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = src;
      });

    const loadedNotas = await Promise.all(
      laporanNotaList.map(async (item) => ({
        item,
        img: await loadImg(item._notaUrl),
      }))
    );
    const validNotas = loadedNotas.filter((n) => n.img !== null);

    const canvas = document.createElement('canvas');
    const width = 1120;
    const rowHeight = 36;
    const headerHeight = 275;
    const signHeight = 165;
    const notaRows = Math.ceil(validNotas.length / 3);
    const notaSectionHeight = validNotas.length > 0 ? 85 + notaRows * 245 : 0;

    canvas.width = width;
    canvas.height =
      headerHeight + Math.max(laporanFilteredList.length, 1) * rowHeight + signHeight + notaSectionHeight;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, canvas.height);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('ORGANISASI SISWA INTRA SEKOLAH (OSIS)', width / 2, 42);
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText('LAPORAN PERTANGGUNGJAWABAN KEUANGAN', width / 2, 70);
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#475569';
    ctx.fillText(`Nomor: ${nomorSuratResmi}`, width / 2, 92);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(45, 106);
    ctx.lineTo(width - 45, 106);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = '12px sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText(`Sumber Dana : ${getLabelSumberFormal()}`, 50, 128);
    ctx.fillText(`Kategori Mutasi : ${getLabelJenisFormal()}`, 50, 146);
    ctx.textAlign = 'right';
    ctx.fillText(`Periode Laporan : ${getLabelPeriode()}`, width - 50, 128);
    ctx.fillText(
      `Jumlah Tercatat : ${laporanFilteredList.length} Transaksi (${laporanNotaList.length} Bukti Nota)`,
      width - 50,
      146
    );

    ctx.textAlign = 'left';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillStyle = '#047857';
    ctx.fillText(`TOTAL PEMASUKAN (+): +${formatRupiah(laporanTotalMasuk)}`, 50, 180);
    ctx.fillStyle = '#be123c';
    ctx.fillText(`TOTAL PENGELUARAN (-): -${formatRupiah(laporanTotalKeluar)}`, 390, 180);
    ctx.fillStyle = '#1d4ed8';
    ctx.fillText(`SALDO AKHIR PERIODE: ${formatRupiah(laporanSaldoAkhir)}`, 740, 180);

    let y = 212;
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(45, y, width - 90, 34);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(45, y, width - 90, 34);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('NO', 56, y + 21);
    ctx.fillText('TANGGAL', 96, y + 21);
    ctx.fillText('SUMBER DANA', 190, y + 21);
    ctx.fillText('URAIAN / KETERANGAN', 320, y + 21);
    ctx.fillText('NOTA', 595, y + 21);
    ctx.fillText('PEMASUKAN (+)', 665, y + 21);
    ctx.fillText('PENGELUARAN (-)', 805, y + 21);
    ctx.fillText('SALDO', 955, y + 21);
    y += 34;

    laporanFilteredList.forEach((item, idx) => {
      const lampIdx = laporanNotaList.findIndex((n) => n === item);
      ctx.strokeStyle = '#cbd5e1';
      ctx.strokeRect(45, y, width - 90, rowHeight);
      ctx.fillStyle = '#1e293b';
      ctx.font = '12px sans-serif';
      ctx.fillText(String(idx + 1), 56, y + 23);
      ctx.fillText(formatTanggalDash(item.tanggal), 96, y + 23);
      ctx.fillText(normalizeSumberLabel(item).slice(0, 16), 190, y + 23);
      ctx.fillText(String(item.keterangan || '-').slice(0, 34), 320, y + 23);
      ctx.fillStyle = lampIdx >= 0 ? '#1d4ed8' : '#64748b';
      ctx.fillText(lampIdx >= 0 ? `Lampiran ${lampIdx + 1}` : 'Tercatat', 595, y + 23);
      ctx.fillStyle = item._isMasuk ? '#047857' : '#64748b';
      ctx.font = item._isMasuk ? 'bold 12px sans-serif' : '12px sans-serif';
      ctx.fillText(item._isMasuk ? `+${formatRupiah(item._nominal)}` : 'Rp 0', 665, y + 23);
      ctx.fillStyle = !item._isMasuk ? '#be123c' : '#64748b';
      ctx.font = !item._isMasuk ? 'bold 12px sans-serif' : '12px sans-serif';
      ctx.fillText(!item._isMasuk ? `-${formatRupiah(item._nominal)}` : 'Rp 0', 805, y + 23);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(formatRupiah(item._saldoBerjalan), 955, y + 23);
      y += rowHeight;
    });

    y += 36;
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.font = '12px sans-serif';
    ctx.fillText('Mengetahui,', 240, y);
    ctx.fillText(formatTanggalFormal(), width - 240, y);
    y += 18;
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Ketua OSIS', 240, y);
    ctx.fillText('Bendahara OSIS', width - 240, y);
    y += 60;
    ctx.fillText(`( ${namaKetuaOsis} )`, 240, y);
    ctx.fillText(`( ${bendaharaDisplay} )`, width - 240, y);

    if (validNotas.length > 0) {
      y += 45;
      ctx.textAlign = 'left';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(
        `LAMPIRAN BUKTI NOTA TRANSAKSI (${validNotas.length} BUKTI TRANSAKSI)`,
        45,
        y
      );
      y += 16;
      validNotas.forEach(({ item, img }, idx) => {
        const col = idx % 3;
        const row = Math.floor(idx / 3);
        const cx = 45 + col * 350;
        const cy = y + row * 245;
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(cx, cy, 330, 230);
        const ratio = Math.min(312 / img.width, 150 / img.height);
        const dw = img.width * ratio;
        const dh = img.height * ratio;
        ctx.drawImage(img, cx + (330 - dw) / 2, cy + 8 + (150 - dh) / 2, dw, dh);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(
          `Lampiran ${idx + 1}. ${String(item.keterangan || '-').slice(0, 34)}`,
          cx + 10,
          cy + 180
        );
        ctx.fillStyle = '#475569';
        ctx.font = '10px sans-serif';
        ctx.fillText(
          `${formatTanggalDash(item.tanggal)} • ${normalizeSumberLabel(item)}`,
          cx + 10,
          cy + 196
        );
        ctx.fillStyle = item._isMasuk ? '#047857' : '#be123c';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`${item._isMasuk ? '+' : '-'} ${formatRupiah(item._nominal)}`, cx + 10, cy + 214);
      });
    }

    const mimeType = format === 'jpg' ? 'image/jpeg' : 'image/png';
    const link = document.createElement('a');
    link.download = `Laporan-Keuangan-OSIS-${new Date().toISOString().split('T')[0]}.${format}`;
    link.href = canvas.toDataURL(mimeType, 0.95);
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* HEADER READ-ONLY + TOMBOL EKSPOR */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-800">
              Transparansi &amp; Laporan Keuangan OSIS
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#2256B7] border border-blue-200 text-[10px] font-black uppercase">
              Sinkron Otomatis &bull; Mode Lihat &amp; Ekspor
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Data &amp; bukti nota tersinkron langsung dari pencatatan Bendahara OSIS &amp; database server. Anda dapat
            memfilter dan mengekspor laporan resmi.
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
                  const notaUrl = normalizeBuktiNota(item);
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
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#2256B7] border border-blue-200 text-xs font-bold cursor-pointer hover:bg-blue-100"
                          >
                            Lihat Nota
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Tercatat</span>
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
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-800">Bukti Nota Transaksi</h4>
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
                className="max-h-[60vh] rounded-2xl object-contain border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL EKSPOR LAPORAN (100% SAMA DENGAN DOKUMEN RESMI BENDAHARA OSIS) */}
      {isLaporanModalOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-[#2256B7] text-[10px] font-black uppercase tracking-wider">
                  DOKUMEN RESMI BENDAHARA OSIS
                </span>
                <h3 className="text-base sm:text-xl font-black text-slate-800 mt-1">
                  Laporan Pertanggungjawaban Keuangan OSIS
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLaporanModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-black cursor-pointer"
              >
                X
              </button>
            </div>

            {/* FILTER LAPORAN */}
            <div className="px-6 py-3.5 bg-white border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  SUMBER DANA
                </label>
                <select
                  value={laporanSumberFilter}
                  onChange={(e) => setLaporanSumberFilter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
                >
                  <option value="Semua">Semua Sumber Dana ({syncedList.length})</option>
                  {DAFTAR_SUMBER_DANA.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  JENIS TRANSAKSI
                </label>
                <select
                  value={laporanJenisFilter}
                  onChange={(e) => setLaporanJenisFilter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
                >
                  <option value="Semua">Semua (Pemasukan &amp; Pengeluaran)</option>
                  <option value="Pemasukan">Hanya Pemasukan</option>
                  <option value="Pengeluaran">Hanya Pengeluaran</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                  PERIODE LAPORAN
                </label>
                <select
                  value={laporanPeriodeFilter}
                  onChange={(e) => setLaporanPeriodeFilter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold"
                >
                  <option value="semua">Seluruh Periode Berjalan</option>
                  <option value="minggu">7 Hari Terakhir</option>
                  <option value="bulan">30 Hari Terakhir</option>
                  <option value="tahun">1 Tahun Terakhir</option>
                </select>
              </div>
            </div>

            {/* PRATINJAU DOKUMEN FORMAL */}
            <div className="p-4 sm:p-6 overflow-y-auto bg-slate-200/75 flex-1">
              <div className="bg-white p-6 sm:p-10 border border-slate-400 shadow-md max-w-4xl mx-auto text-slate-900 space-y-5 font-serif">
                <div className="flex items-center justify-between gap-4 border-b-4 border-double border-slate-900 pb-4">
                  <img
                    src={logoOsitara}
                    alt="Logo OSITARA"
                    className="w-14 h-14 object-contain shrink-0"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                  <div className="text-center flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest">
                      Organisasi Siswa Intra Sekolah (OSIS)
                    </p>
                    <h4 className="text-lg font-bold uppercase mt-0.5">
                      Laporan Pertanggungjawaban Keuangan
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-1">
                      Nomor: {nomorSuratResmi}
                    </p>
                  </div>
                  <div className="w-14 hidden sm:block" />
                </div>

                {/* INFO METADATA DOKUMEN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-700">
                  <div className="space-y-0.5">
                    <p>
                      <strong className="inline-block w-28">Sumber Dana</strong>:{' '}
                      {getLabelSumberFormal()}
                    </p>
                    <p>
                      <strong className="inline-block w-28">Kategori Mutasi</strong>:{' '}
                      {getLabelJenisFormal()}
                    </p>
                  </div>
                  <div className="space-y-0.5 sm:text-right">
                    <p>
                      <strong>Periode Laporan:</strong> {getLabelPeriode()}
                    </p>
                    <p>
                      <strong>Jumlah Tercatat:</strong> {laporanFilteredList.length} Transaksi (
                      {laporanNotaList.length} Bukti Nota)
                    </p>
                  </div>
                </div>

                {/* 3 KOTAK TOTAL */}
                <div className="grid grid-cols-1 sm:grid-cols-3 border border-slate-700 divide-y sm:divide-y-0 sm:divide-x divide-slate-700 bg-slate-50">
                  <div className="p-3.5">
                    <span className="block text-[10px] font-bold uppercase text-slate-600">
                      TOTAL PEMASUKAN (+)
                    </span>
                    <strong className="text-emerald-800 text-base">
                      + {formatRupiah(laporanTotalMasuk)}
                    </strong>
                  </div>
                  <div className="p-3.5">
                    <span className="block text-[10px] font-bold uppercase text-slate-600">
                      TOTAL PENGELUARAN (-)
                    </span>
                    <strong className="text-rose-800 text-base">
                      - {formatRupiah(laporanTotalKeluar)}
                    </strong>
                  </div>
                  <div className="p-3.5 bg-slate-100">
                    <span className="block text-[10px] font-bold uppercase text-slate-600">
                      SALDO AKHIR PERIODE
                    </span>
                    <strong className="text-slate-900 text-base">
                      {formatRupiah(laporanSaldoAkhir)}
                    </strong>
                  </div>
                </div>

                {/* TABEL MUTASI LENGKAP DENGAN NOTA & SALDO */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse border border-slate-700">
                    <thead>
                      <tr className="bg-slate-200 font-bold uppercase text-[10px]">
                        <th className="border border-slate-700 py-2.5 px-2 text-center">NO</th>
                        <th className="border border-slate-700 py-2.5 px-2 text-center">
                          TANGGAL
                        </th>
                        <th className="border border-slate-700 py-2.5 px-2">SUMBER DANA</th>
                        <th className="border border-slate-700 py-2.5 px-2">
                          URAIAN / KETERANGAN TRANSAKSI
                        </th>
                        <th className="border border-slate-700 py-2.5 px-2 text-center">NOTA</th>
                        <th className="border border-slate-700 py-2.5 px-2 text-right">
                          PEMASUKAN (+)
                        </th>
                        <th className="border border-slate-700 py-2.5 px-2 text-right">
                          PENGELUARAN (-)
                        </th>
                        <th className="border border-slate-700 py-2.5 px-2 text-right">SALDO</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laporanFilteredList.length === 0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            className="border border-slate-700 py-6 text-center text-slate-400"
                          >
                            Tidak ada transaksi pada filter yang dipilih.
                          </td>
                        </tr>
                      ) : (
                        laporanFilteredList.map((item, idx) => {
                          const lampIndex = laporanNotaList.findIndex((n) => n === item);
                          return (
                            <tr key={item.id || idx}>
                              <td className="border border-slate-700 py-2 px-2 text-center">
                                {idx + 1}
                              </td>
                              <td className="border border-slate-700 py-2 px-2 text-center whitespace-nowrap">
                                {formatTanggalDash(item.tanggal)}
                              </td>
                              <td className="border border-slate-700 py-2 px-2">
                                {normalizeSumberLabel(item)}
                              </td>
                              <td className="border border-slate-700 py-2 px-2">
                                {item.keterangan}
                              </td>
                              <td className="border border-slate-700 py-2 px-2 text-center">
                                {lampIndex >= 0 ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPreviewNotaModal({
                                        isOpen: true,
                                        imageUrl: item._notaUrl,
                                        keterangan: item.keterangan,
                                        tanggal: formatTanggalDash(item.tanggal),
                                        nominal: item._nominal,
                                      })
                                    }
                                    className="text-[11px] font-sans font-bold text-blue-700 underline cursor-pointer"
                                  >
                                    Lampiran {lampIndex + 1}
                                  </button>
                                ) : (
                                  'Tercatat Sistem'
                                )}
                              </td>
                              <td className="border border-slate-700 py-2 px-2 text-right text-emerald-800 font-bold whitespace-nowrap">
                                {item._isMasuk ? `+${formatRupiah(item._nominal)}` : 'Rp 0'}
                              </td>
                              <td className="border border-slate-700 py-2 px-2 text-right text-rose-800 font-bold whitespace-nowrap">
                                {!item._isMasuk ? `-${formatRupiah(item._nominal)}` : 'Rp 0'}
                              </td>
                              <td className="border border-slate-700 py-2 px-2 text-right font-bold whitespace-nowrap">
                                {formatRupiah(item._saldoBerjalan)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* TANDA TANGAN KETUA OSIS & BENDAHARA OSIS */}
                <div className="pt-4 grid grid-cols-2 gap-6 text-xs text-center">
                  <div>
                    <p>Mengetahui,</p>
                    <p className="font-bold">Ketua OSIS</p>
                    <div className="h-14" />
                    <p className="font-bold underline">( {namaKetuaOsis} )</p>
                  </div>
                  <div>
                    <p>{formatTanggalFormal()}</p>
                    <p className="font-bold">Bendahara OSIS</p>
                    <div className="h-14" />
                    <p className="font-bold underline">( {bendaharaDisplay} )</p>
                  </div>
                </div>

                {/* LAMPIRAN BUKTI NOTA TRANSAKSI (GALERI & KAMERA BENDAHARA) */}
                {laporanNotaList.length > 0 && (
                  <div className="pt-6 border-t-2 border-slate-900 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wide">
                      LAMPIRAN BUKTI NOTA TRANSAKSI ({laporanNotaList.length} BUKTI TRANSAKSI)
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {laporanNotaList.map((notaItem, idx) => (
                        <div
                          key={notaItem.id || idx}
                          onClick={() =>
                            setPreviewNotaModal({
                              isOpen: true,
                              imageUrl: notaItem._notaUrl,
                              keterangan: notaItem.keterangan,
                              tanggal: formatTanggalDash(notaItem.tanggal),
                              nominal: notaItem._nominal,
                            })
                          }
                          className="border border-slate-300 rounded-xl p-2.5 bg-slate-50 cursor-pointer hover:border-blue-500 transition-colors"
                        >
                          <img
                            src={notaItem._notaUrl}
                            alt={`Lampiran ${idx + 1}`}
                            className="w-full h-36 object-contain bg-white rounded border border-slate-200 mb-2"
                          />
                          <p className="text-[11px] font-bold truncate font-sans">
                            Lampiran {idx + 1}. {notaItem.keterangan}
                          </p>
                          <p className="text-[10px] text-slate-600 font-sans">
                            {formatTanggalDash(notaItem.tanggal)} &bull;{' '}
                            {normalizeSumberLabel(notaItem)}
                          </p>
                          <p
                            className={`text-[11px] font-bold font-sans ${
                              notaItem._isMasuk ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {notaItem._isMasuk ? '+' : '-'} {formatRupiah(notaItem._nominal)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TOMBOL AKSI EKSPOR */}
            <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500 font-medium">
                Format resmi siap cetak beserta lampiran nota pengeluaran.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLaporanModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleExportLaporanImage('png')}
                  className="px-4 py-2 rounded-xl bg-[#2158B8] hover:bg-blue-700 text-white font-black text-xs cursor-pointer"
                >
                  Unduh PNG
                </button>
                <button
                  type="button"
                  onClick={() => handleExportLaporanImage('jpg')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs cursor-pointer"
                >
                  Unduh JPG
                </button>
                <button
                  type="button"
                  onClick={handlePrintPdfLaporan}
                  className="px-4 py-2 rounded-xl bg-[#109868] hover:bg-emerald-700 text-white font-black text-xs cursor-pointer"
                >
                  Cetak / PDF Resmi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
